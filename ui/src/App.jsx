import { useState, useEffect } from 'react'
import Header from './components/Header'
import OrderPage from './components/OrderPage'
import AdminPage from './components/AdminPage'
import { fetchMenus, updateMenuStock, createOrder } from './api'
import './App.css'

function cartKey(menuId, selectedOptions) {
  const optionStr = [...selectedOptions].sort((a, b) => a.label.localeCompare(b.label)).map(o => o.label).join(',')
  return `${menuId}|${optionStr}`
}

function totalInCartByMenu(cartSnapshot, menuId) {
  return cartSnapshot.filter(i => i.menuId === menuId).reduce((sum, i) => sum + i.quantity, 0)
}

function App() {
  const [page, setPage] = useState('order')
  const [menus, setMenus] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    fetchMenus()
      .then(setMenus)
      .catch(() => setFetchError('메뉴를 불러오지 못했습니다. 서버 연결을 확인해주세요.'))
      .finally(() => setLoading(false))
  }, [])

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

  async function handleOrder() {
    await createOrder(cart)
    setCart([])
    const updated = await fetchMenus()
    setMenus(updated)
  }

  async function handleChangeStock(id, delta) {
    const menu = menus.find(m => m.id === id)
    const newStock = Math.max(0, menu.stock + delta)
    setMenus(prev => prev.map(m => m.id === id ? { ...m, stock: newStock } : m))
    try {
      await updateMenuStock(id, newStock)
    } catch {
      setMenus(prev => prev.map(m => m.id === id ? { ...m, stock: menu.stock } : m))
    }
  }

  if (loading) return <div className="page-status">메뉴를 불러오는 중...</div>
  if (fetchError) return <div className="page-status error">{fetchError}</div>

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
          onChangeStock={handleChangeStock}
        />
      )}
    </div>
  )
}

export default App
