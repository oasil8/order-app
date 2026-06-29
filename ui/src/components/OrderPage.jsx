import { useState, useEffect } from 'react'
import MenuCard from './MenuCard'
import Cart from './Cart'

export default function OrderPage({ menus, cart, onAddToCart, onChangeQuantity, onRemove, onOrder }) {
  const [expandedId, setExpandedId] = useState(null)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    let timer
    if (toast) timer = setTimeout(() => setToast(false), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  function handleToggle(id) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  function handleAddToCart(menu, selectedOptions) {
    onAddToCart(menu, selectedOptions)
    setExpandedId(null)
  }

  function handleOrder() {
    onOrder()
    setToast(true)
  }

  const stockMap = Object.fromEntries(menus.map(m => [m.id, m.stock]))

  return (
    <main className="page-content">
      {toast && <div className="toast">주문이 접수되었습니다!</div>}
      <div className="menu-grid">
        {menus.map(menu => (
          <MenuCard
            key={menu.id}
            menu={menu}
            isExpanded={expandedId === menu.id}
            onToggle={() => handleToggle(menu.id)}
            onAddToCart={opts => handleAddToCart(menu, opts)}
          />
        ))}
      </div>
      {cart.length > 0 && (
        <Cart
          cartItems={cart}
          stockMap={stockMap}
          onChangeQuantity={onChangeQuantity}
          onRemove={onRemove}
          onOrder={handleOrder}
        />
      )}
    </main>
  )
}
