const express = require('express')
const router = express.Router()
const pool = require('../db')

// GET /api/menus — 메뉴 목록 + 옵션 조회
router.get('/', async (req, res) => {
  try {
    const menusResult = await pool.query(
      'SELECT * FROM menus ORDER BY id'
    )
    const optionsResult = await pool.query(
      'SELECT * FROM options ORDER BY id'
    )

    const menus = menusResult.rows.map(menu => ({
      ...menu,
      options: optionsResult.rows.filter(opt => opt.menu_id === menu.id),
    }))

    res.json(menus)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '서버 오류가 발생했습니다' })
  }
})

// PATCH /api/menus/:id/stock — 재고 수량 수정
router.patch('/:id/stock', async (req, res) => {
  const { id } = req.params
  const { stock } = req.body

  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: '유효하지 않은 재고 수량입니다' })
  }

  try {
    const result = await pool.query(
      'UPDATE menus SET stock = $1 WHERE id = $2 RETURNING *',
      [stock, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '서버 오류가 발생했습니다' })
  }
})

module.exports = router
