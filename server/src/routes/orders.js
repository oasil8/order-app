const express = require('express')
const router = express.Router()
const pool = require('../db')

const VALID_STATUSES = ['주문 접수', '제조 중', '제조 완료']
const STATUS_NEXT = { '주문 접수': '제조 중', '제조 중': '제조 완료' }

// GET /api/orders — 주문 목록 조회 (최신순)
router.get('/', async (req, res) => {
  try {
    const ordersResult = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    )
    const itemsResult = await pool.query(`
      SELECT
        oi.id, oi.order_id, oi.quantity, oi.item_price,
        m.name AS menu_name,
        COALESCE(
          json_agg(o.name) FILTER (WHERE o.name IS NOT NULL),
          '[]'
        ) AS options
      FROM order_items oi
      JOIN menus m ON m.id = oi.menu_id
      LEFT JOIN order_item_options oio ON oio.order_item_id = oi.id
      LEFT JOIN options o ON o.id = oio.option_id
      GROUP BY oi.id, m.name
    `)

    const orders = ordersResult.rows.map(order => ({
      ...order,
      items: itemsResult.rows.filter(item => item.order_id === order.id),
    }))

    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '서버 오류가 발생했습니다' })
  }
})

// GET /api/orders/:id — 특정 주문 조회
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    )
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' })
    }

    const itemsResult = await pool.query(`
      SELECT
        oi.id, oi.order_id, oi.quantity, oi.item_price,
        m.name AS menu_name,
        COALESCE(
          json_agg(o.name) FILTER (WHERE o.name IS NOT NULL),
          '[]'
        ) AS options
      FROM order_items oi
      JOIN menus m ON m.id = oi.menu_id
      LEFT JOIN order_item_options oio ON oio.order_item_id = oi.id
      LEFT JOIN options o ON o.id = oio.option_id
      WHERE oi.order_id = $1
      GROUP BY oi.id, m.name
    `, [id])

    res.json({ ...orderResult.rows[0], items: itemsResult.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '서버 오류가 발생했습니다' })
  }
})

// POST /api/orders — 주문 생성
router.post('/', async (req, res) => {
  const { items, total_price } = req.body

  if (!items || items.length === 0 || total_price === undefined) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 재고 확인 및 차감
    for (const item of items) {
      const menuResult = await client.query(
        'SELECT stock FROM menus WHERE id = $1 FOR UPDATE',
        [item.menu_id]
      )
      if (menuResult.rows.length === 0) {
        throw { status: 404, message: '메뉴를 찾을 수 없습니다' }
      }
      if (menuResult.rows[0].stock < item.quantity) {
        throw { status: 409, message: '재고가 부족합니다' }
      }
      await client.query(
        'UPDATE menus SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.menu_id]
      )
    }

    // 주문 생성
    const orderResult = await client.query(
      'INSERT INTO orders (total_price) VALUES ($1) RETURNING *',
      [total_price]
    )
    const order = orderResult.rows[0]

    // 주문 항목 및 옵션 저장
    for (const item of items) {
      const itemResult = await client.query(
        'INSERT INTO order_items (order_id, menu_id, quantity, item_price) VALUES ($1, $2, $3, $4) RETURNING id',
        [order.id, item.menu_id, item.quantity, item.item_price]
      )
      const orderItemId = itemResult.rows[0].id

      if (item.option_ids && item.option_ids.length > 0) {
        for (const optionId of item.option_ids) {
          await client.query(
            'INSERT INTO order_item_options (order_item_id, option_id) VALUES ($1, $2)',
            [orderItemId, optionId]
          )
        }
      }
    }

    await client.query('COMMIT')
    res.status(201).json(order)
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error(err)
    res.status(500).json({ error: '서버 오류가 발생했습니다' })
  } finally {
    client.release()
  }
})

// PATCH /api/orders/:id/status — 주문 상태 변경
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: '유효하지 않은 상태입니다' })
  }

  try {
    const current = await pool.query(
      'SELECT status FROM orders WHERE id = $1',
      [id]
    )
    if (current.rows.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' })
    }
    if (STATUS_NEXT[current.rows[0].status] !== status) {
      return res.status(400).json({ error: '유효하지 않은 상태 전환입니다' })
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '서버 오류가 발생했습니다' })
  }
})

module.exports = router
