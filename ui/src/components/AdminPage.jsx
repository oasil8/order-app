import { useState, useEffect } from 'react'
import { fetchOrders, updateOrderStatus } from '../api'

function formatDate(dateStr) {
  const date = new Date(dateStr)
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
const ORDER_BTN  = { '주문 접수': '제조 시작', '제조 중': '제조 완료 처리' }

export default function AdminPage({ menus, onChangeStock }) {
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setOrdersLoading(false))
  }, [])

  async function handleAdvanceOrder(id, currentStatus) {
    const nextStatus = ORDER_NEXT[currentStatus]
    if (!nextStatus) return
    try {
      await updateOrderStatus(id, nextStatus)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o))
    } catch (err) {
      console.error(err)
    }
  }

  const summary = {
    total:    orders.length,
    received: orders.filter(o => o.status === '주문 접수').length,
    making:   orders.filter(o => o.status === '제조 중').length,
    done:     orders.filter(o => o.status === '제조 완료').length,
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
          {menus.map(item => {
            const { label, cls } = stockStatus(item.stock)
            return (
              <div key={item.id} className="stock-card">
                <span className="stock-name">{item.name}</span>
                <div className="stock-row">
                  <span className="stock-qty">{item.stock}개</span>
                  <span className={`stock-badge ${cls}`}>{label}</span>
                </div>
                <div className="stock-controls">
                  <button className="qty-btn" onClick={() => onChangeStock(item.id, 1)}>+</button>
                  <button className="qty-btn" onClick={() => onChangeStock(item.id, -1)} disabled={item.stock === 0}>−</button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 주문 현황 */}
      <section className="admin-section">
        <h2 className="section-title">주문 현황</h2>
        {ordersLoading ? (
          <p className="empty-msg">주문을 불러오는 중...</p>
        ) : orders.length === 0 ? (
          <p className="empty-msg">접수된 주문이 없습니다.</p>
        ) : (
          <ul className="order-list">
            {orders.map(order => {
              const btnLabel = ORDER_BTN[order.status]
              return (
                <li key={order.id} className="order-row">
                  <span className="order-date">{formatDate(order.created_at)}</span>
                  <span className="order-items">
                    {order.items.map((it, i) => (
                      <span key={it.id}>
                        {it.menu_name}
                        {it.options.length > 0 ? ` (${it.options.join(', ')})` : ''}
                        {' '}x {it.quantity}
                        {i < order.items.length - 1 ? ',  ' : ''}
                      </span>
                    ))}
                  </span>
                  <span className="order-total">{order.total_price.toLocaleString()}원</span>
                  <div className="order-action">
                    {btnLabel ? (
                      <button className="btn-primary btn-sm" onClick={() => handleAdvanceOrder(order.id, order.status)}>
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
