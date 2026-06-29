import { useState } from 'react'

const INITIAL_STOCK = [
  { id: 1, name: '아메리카노(ICE)', quantity: 10 },
  { id: 2, name: '아메리카노(HOT)', quantity: 10 },
  { id: 3, name: '카페라떼', quantity: 3 },
  { id: 4, name: '카푸치노', quantity: 0 },
  { id: 5, name: '바닐라라떼', quantity: 7 },
]

const INITIAL_ORDERS = [
  {
    id: 1,
    createdAt: new Date(2026, 5, 29, 13, 0),
    items: [{ name: '아메리카노(ICE)', options: [], qty: 1 }],
    total: 4000,
    status: '주문 접수',
  },
  {
    id: 2,
    createdAt: new Date(2026, 5, 29, 12, 45),
    items: [
      { name: '카페라떼', options: ['샷 추가'], qty: 2 },
      { name: '아메리카노(HOT)', options: [], qty: 1 },
    ],
    total: 14000,
    status: '제조 중',
  },
  {
    id: 3,
    createdAt: new Date(2026, 5, 29, 12, 30),
    items: [{ name: '바닐라라떼', options: [], qty: 1 }],
    total: 5500,
    status: '제조 완료',
  },
]

function formatDate(date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${month}월 ${day}일 ${hh}:${mm}`
}

function stockStatus(qty) {
  if (qty === 0) return { label: '품절', cls: 'badge-sold-out' }
  if (qty < 5)  return { label: '주의', cls: 'badge-warning' }
  return { label: '정상', cls: 'badge-ok' }
}

const ORDER_NEXT = { '주문 접수': '제조 중', '제조 중': '제조 완료' }
const ORDER_BTN  = { '주문 접수': '제조 시작', '제조 중': '제조 완료' }

export default function AdminPage() {
  const [stock, setStock]   = useState(INITIAL_STOCK)
  const [orders, setOrders] = useState(INITIAL_ORDERS)

  const summary = {
    total:    orders.length,
    received: orders.filter(o => o.status === '주문 접수').length,
    making:   orders.filter(o => o.status === '제조 중').length,
    done:     orders.filter(o => o.status === '제조 완료').length,
  }

  function changeStock(id, delta) {
    setStock(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    )
  }

  function advanceOrder(id) {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: ORDER_NEXT[order.status] } : order
      )
    )
  }

  return (
    <main className="page-content admin-page">

      {/* 대시보드 */}
      <section className="admin-section">
        <h2 className="section-title">관리자 대시보드</h2>
        <div className="dashboard-grid">
          {[
            { label: '총 주문',   value: summary.total },
            { label: '주문 접수', value: summary.received },
            { label: '제조 중',   value: summary.making },
            { label: '제조 완료', value: summary.done },
          ].map(({ label, value }) => (
            <div key={label} className="stat-card">
              <span className="stat-label">{label}</span>
              <span className="stat-value">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 재고 현황 */}
      <section className="admin-section">
        <h2 className="section-title">재고 현황</h2>
        <div className="stock-grid">
          {stock.map(item => {
            const { label, cls } = stockStatus(item.quantity)
            return (
              <div key={item.id} className="stock-card">
                <span className="stock-name">{item.name}</span>
                <div className="stock-row">
                  <span className="stock-qty">{item.quantity}개</span>
                  <span className={`stock-badge ${cls}`}>{label}</span>
                </div>
                <div className="stock-controls">
                  <button className="qty-btn" onClick={() => changeStock(item.id, 1)}>+</button>
                  <button className="qty-btn" onClick={() => changeStock(item.id, -1)} disabled={item.quantity === 0}>−</button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 주문 현황 */}
      <section className="admin-section">
        <h2 className="section-title">주문 현황</h2>
        {orders.length === 0 ? (
          <p className="empty-msg">접수된 주문이 없습니다.</p>
        ) : (
          <ul className="order-list">
            {orders.map(order => {
              const btnLabel = ORDER_BTN[order.status]
              return (
                <li key={order.id} className="order-row">
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  <span className="order-items">
                    {order.items.map((it, i) => (
                      <span key={i}>
                        {it.name}{it.options.length > 0 ? ` (${it.options.join(', ')})` : ''} x {it.qty}
                        {i < order.items.length - 1 && ',  '}
                      </span>
                    ))}
                  </span>
                  <span className="order-total">{order.total.toLocaleString()}원</span>
                  <div className="order-action">
                    {btnLabel ? (
                      <button className="btn-primary btn-sm" onClick={() => advanceOrder(order.id)}>
                        {btnLabel}
                      </button>
                    ) : (
                      <button className="btn-done" disabled>제조 완료</button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

    </main>
  )
}
