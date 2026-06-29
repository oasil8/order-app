import { useState } from 'react'
import Header from './components/Header'
import OrderPage from './components/OrderPage'
import AdminPage from './components/AdminPage'
import './App.css'

const INITIAL_MENUS = [
  { id: 1, name: '아메리카노(ICE)', price: 4000, emoji: '🧊', desc: '얼음이 가득한 시원한 아메리카노', stock: 10, options: [{ label: '샷 추가', price: 500 }, { label: '시럽 추가', price: 0 }] },
  { id: 2, name: '아메리카노(HOT)', price: 4000, emoji: '🫖', desc: '따뜻하게 즐기는 클래식 아메리카노', stock: 10, options: [{ label: '샷 추가', price: 500 }, { label: '시럽 추가', price: 0 }] },
  { id: 3, name: '카페라떼', price: 5000, emoji: '🥛', desc: '부드러운 우유와 에스프레소의 조화', stock: 8, options: [{ label: '샷 추가', price: 500 }, { label: '시럽 추가', price: 0 }] },
  { id: 4, name: '카푸치노', price: 5000, emoji: '🍵', desc: '풍성한 우유 거품이 올라간 카푸치노', stock: 6, options: [{ label: '샷 추가', price: 500 }, { label: '시럽 추가', price: 0 }] },
  { id: 5, name: '바닐라라떼', price: 5500, emoji: '🍦', desc: '달콤한 바닐라 향이 가득한 라떼', stock: 5, options: [{ label: '샷 추가', price: 500 }, { label: '바닐라 시럽 추가', price: 500 }] },
  { id: 6, name: '카라멜마키아토', price: 5500, emoji: '🍮', desc: '달콤 쌉싸름한 카라멜과 에스프레소', stock: 0, options: [{ label: '샷 추가', price: 500 }, { label: '카라멜 추가', price: 500 }] },
]

const ORDER_NEXT = { '주문 접수': '제조 중', '제조 중': '제조 완료' }

function cartKey(menuId, selectedOptions) {
  const optionStr = [...selectedOptions].sort((a, b) => a.label.localeCompare(b.label)).map(o => o.label).join(',')
  return `${menuId}|${optionStr}`
}

function totalInCartByMenu(cartSnapshot, menuId) {
  return cartSnapshot.filter(i => i.menuId === menuId).reduce((sum, i) => sum + i.quantity, 0)
}

function App() {
  const [page, setPage] = useState('order')
  const [menus, setMenus] = useState(INITIAL_MENUS)
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([])

  function handleAddToCart(menu, selectedOptions) {
    const key = cartKey(menu.id, selectedOptions)
    const optionPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0)
    const unitPrice = menu.price + optionPrice

    setCart(prev => {
      if (totalInCartByMenu(prev, menu.id) >= menu.stock) return prev
      const existing = prev.find(item => item.key === key)
      if (existing) {
        return prev.map(item =>
          item.key === key
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        )
      }
      return [...prev, { key, menuId: menu.id, menuName: menu.name, unitPrice, selectedOptions, quantity: 1, subtotal: unitPrice }]
    })
  }

  function handleChangeQuantity(key, delta) {
    if (delta > 0) {
      const cartItem = cart.find(i => i.key === key)
      const menu = menus.find(m => m.id === cartItem?.menuId)
      if (cartItem && menu && totalInCartByMenu(cart, cartItem.menuId) >= menu.stock) return
    }
    setCart(prev =>
      prev
        .map(item => item.key === key
          ? { ...item, quantity: item.quantity + delta, subtotal: (item.quantity + delta) * item.unitPrice }
          : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  function handleRemoveFromCart(key) {
    setCart(prev => prev.filter(item => item.key !== key))
  }

  function handleOrder() {
    if (cart.length === 0) return
    const newOrder = {
      id: Date.now(),
      createdAt: new Date(),
      items: cart.map(item => ({
        name: item.menuName,
        options: item.selectedOptions.map(o => o.label),
        qty: item.quantity,
      })),
      total: cart.reduce((sum, item) => sum + item.subtotal, 0),
      status: '주문 접수',
    }
    setOrders(prev => [newOrder, ...prev])
    setMenus(prev => prev.map(menu => {
      const totalQty = cart
        .filter(item => item.menuId === menu.id)
        .reduce((sum, item) => sum + item.quantity, 0)
      if (totalQty === 0) return menu
      return { ...menu, stock: Math.max(0, menu.stock - totalQty) }
    }))
    setCart([])
  }

  function handleChangeStock(id, delta) {
    setMenus(prev => prev.map(menu =>
      menu.id === id ? { ...menu, stock: Math.max(0, menu.stock + delta) } : menu
    ))
  }

  function handleAdvanceOrder(id) {
    setOrders(prev => prev.map(order =>
      order.id === id && ORDER_NEXT[order.status]
        ? { ...order, status: ORDER_NEXT[order.status] }
        : order
    ))
  }

  return (
    <div className="app">
      <Header currentPage={page} onNavigate={setPage} />
      {page === 'order' && (
        <OrderPage
          menus={menus}
          cart={cart}
          onAddToCart={handleAddToCart}
          onChangeQuantity={handleChangeQuantity}
          onRemove={handleRemoveFromCart}
          onOrder={handleOrder}
        />
      )}
      {page === 'admin' && (
        <AdminPage
          menus={menus}
          orders={orders}
          onChangeStock={handleChangeStock}
          onAdvanceOrder={handleAdvanceOrder}
        />
      )}
    </div>
  )
}

export default App
