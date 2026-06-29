const BASE_URL = 'http://localhost:4000'

function getEmoji(name) {
  if (name.includes('ICE')) return '🧊'
  if (name.includes('HOT')) return '🫖'
  if (name.includes('바닐라')) return '🍦'
  if (name.includes('라떼')) return '🥛'
  if (name.includes('카푸치노')) return '🍵'
  if (name.includes('카라멜')) return '🍮'
  return '☕'
}

export async function fetchMenus() {
  const res = await fetch(`${BASE_URL}/api/menus`)
  if (!res.ok) throw new Error('메뉴를 불러오지 못했습니다')
  const data = await res.json()
  return data.map(menu => ({
    id: menu.id,
    name: menu.name,
    desc: menu.description,
    price: menu.price,
    stock: menu.stock,
    emoji: getEmoji(menu.name),
    options: menu.options.map(opt => ({
      id: opt.id,
      label: opt.name,
      price: opt.price,
    })),
  }))
}

export async function updateMenuStock(menuId, stock) {
  const res = await fetch(`${BASE_URL}/api/menus/${menuId}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock }),
  })
  if (!res.ok) throw new Error('재고 수정에 실패했습니다')
  return res.json()
}

export async function createOrder(cart) {
  const body = {
    items: cart.map(item => ({
      menu_id: item.menuId,
      quantity: item.quantity,
      option_ids: item.selectedOptions.map(o => o.id).filter(Boolean),
      item_price: item.unitPrice,
    })),
    total_price: cart.reduce((sum, item) => sum + item.subtotal, 0),
  }
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || '주문에 실패했습니다')
  }
  return res.json()
}

export async function fetchOrders() {
  const res = await fetch(`${BASE_URL}/api/orders`)
  if (!res.ok) throw new Error('주문을 불러오지 못했습니다')
  return res.json()
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || '상태 변경에 실패했습니다')
  }
  return res.json()
}
