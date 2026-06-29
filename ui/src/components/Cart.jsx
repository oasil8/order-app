export default function Cart({ cartItems, onChangeQuantity, onRemove, onOrder }) {
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="cart">
      <div className="cart-inner">
        <div className="cart-left">
          <h3 className="cart-title">장바구니</h3>
          <ul className="cart-list">
            {cartItems.map(item => (
              <li key={item.key} className="cart-item">
                <span className="cart-item-name">
                  {item.menuName}
                  {item.selectedOptions.length > 0 && (
                    <span className="cart-item-options">
                      ({item.selectedOptions.map(o => o.label).join(', ')})
                    </span>
                  )}
                </span>
                <div className="cart-item-controls">
                  <button className="qty-btn" onClick={() => onChangeQuantity(item.key, -1)}>−</button>
                  <span className="qty-count">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => onChangeQuantity(item.key, 1)}>+</button>
                  <span className="cart-item-price">{item.subtotal.toLocaleString()}원</span>
                  <button className="remove-btn" onClick={() => onRemove(item.key)}>×</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="cart-right">
          <span className="cart-total">
            총 금액 <strong>{total.toLocaleString()}원</strong>
          </span>
          <button className="btn-primary" onClick={onOrder}>주문하기</button>
        </div>
      </div>
    </div>
  )
}
