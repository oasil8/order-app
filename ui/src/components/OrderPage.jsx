import { useState } from 'react'
import MenuCard from './MenuCard'
import Cart from './Cart'

const MENUS = [
  {
    id: 1, name: '아메리카노(ICE)', price: 4000, emoji: '🧊',
    desc: '얼음이 가득한 시원한 아메리카노',
    stock: 10,
    options: [{ label: '샷 추가', price: 500 }, { label: '시럽 추가', price: 0 }],
  },
  {
    id: 2, name: '아메리카노(HOT)', price: 4000, emoji: '🫖',
    desc: '따뜻하게 즐기는 클래식 아메리카노',
    stock: 10,
    options: [{ label: '샷 추가', price: 500 }, { label: '시럽 추가', price: 0 }],
  },
  {
    id: 3, name: '카페라떼', price: 5000, emoji: '🥛',
    desc: '부드러운 우유와 에스프레소의 조화',
    stock: 8,
    options: [{ label: '샷 추가', price: 500 }, { label: '시럽 추가', price: 0 }],
  },
  {
    id: 4, name: '카푸치노', price: 5000, emoji: '🍵',
    desc: '풍성한 우유 거품이 올라간 카푸치노',
    stock: 6,
    options: [{ label: '샷 추가', price: 500 }, { label: '시럽 추가', price: 0 }],
  },
  {
    id: 5, name: '바닐라라떼', price: 5500, emoji: '🍦',
    desc: '달콤한 바닐라 향이 가득한 라떼',
    stock: 5,
    options: [{ label: '샷 추가', price: 500 }, { label: '바닐라 시럽 추가', price: 500 }],
  },
  {
    id: 6, name: '카라멜마키아토', price: 5500, emoji: '🍮',
    desc: '달콤 쌉싸름한 카라멜과 에스프레소',
    stock: 0,
    options: [{ label: '샷 추가', price: 500 }, { label: '카라멜 추가', price: 500 }],
  },
]

function cartKey(menuId, selectedOptions) {
  const optionStr = [...selectedOptions].sort((a, b) => a.label.localeCompare(b.label)).map(o => o.label).join(',')
  return `${menuId}|${optionStr}`
}

export default function OrderPage() {
  const [expandedId, setExpandedId] = useState(null)
  const [cart, setCart] = useState([])

  function handleToggle(id) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  function handleAddToCart(menu, selectedOptions) {
    const key = cartKey(menu.id, selectedOptions)
    const optionPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0)
    const unitPrice = menu.price + optionPrice

    setCart(prev => {
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
    setExpandedId(null)
  }

  function handleChangeQuantity(key, delta) {
    setCart(prev =>
      prev
        .map(item => item.key === key
          ? { ...item, quantity: item.quantity + delta, subtotal: (item.quantity + delta) * item.unitPrice }
          : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  function handleRemove(key) {
    setCart(prev => prev.filter(item => item.key !== key))
  }

  function handleOrder() {
    alert('주문이 접수되었습니다!')
    setCart([])
  }

  return (
    <main className="page-content">
      <div className="menu-grid">
        {MENUS.map(menu => (
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
          onChangeQuantity={handleChangeQuantity}
          onRemove={handleRemove}
          onOrder={handleOrder}
        />
      )}
    </main>
  )
}
