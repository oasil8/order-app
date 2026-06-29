import { useState, useEffect } from 'react'

export default function MenuCard({ menu, isExpanded, onToggle, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])

  useEffect(() => {
    if (!isExpanded) setSelectedOptions([])
  }, [isExpanded])

  function toggleOption(option) {
    setSelectedOptions(prev =>
      prev.find(o => o.label === option.label)
        ? prev.filter(o => o.label !== option.label)
        : [...prev, option]
    )
  }

  function handleAdd(e) {
    e.stopPropagation()
    onAddToCart(selectedOptions)
  }

  function handleClose(e) {
    e.stopPropagation()
    onToggle()
  }

  const optionPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0)
  const displayPrice = (menu.price + optionPrice).toLocaleString()

  return (
    <div
      className={`menu-card ${menu.stock === 0 ? 'out-of-stock' : ''}`}
      onClick={!isExpanded && menu.stock > 0 ? onToggle : undefined}
    >
      <div className="menu-image">{menu.emoji}</div>
      <div className="menu-info">
        <strong className="menu-name">{menu.name}</strong>
        <span className="menu-price">{displayPrice}원</span>
      </div>
      {menu.stock === 0 && <span className="sold-out-badge">품절</span>}

      {isExpanded && (
        <div className="menu-detail" onClick={e => e.stopPropagation()}>
          <p className="menu-desc">{menu.desc}</p>
          <ul className="option-list">
            {menu.options.map(opt => (
              <li key={opt.label}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!selectedOptions.find(o => o.label === opt.label)}
                    onChange={() => toggleOption(opt)}
                  />
                  {opt.label} (+{opt.price.toLocaleString()}원)
                </label>
              </li>
            ))}
          </ul>
          <div className="card-actions">
            <button className="btn-primary" onClick={handleAdd}>담기</button>
            <button className="btn-secondary" onClick={handleClose}>닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}
