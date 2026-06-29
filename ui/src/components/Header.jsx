export default function Header({ currentPage, onNavigate }) {
  return (
    <header className="header">
      <span className="brand">COZY</span>
      <nav className="nav">
        <button
          className={`nav-btn ${currentPage === 'order' ? 'active' : ''}`}
          onClick={() => onNavigate('order')}
        >
          주문하기
        </button>
        <button
          className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => onNavigate('admin')}
        >
          관리자
        </button>
      </nav>
    </header>
  )
}
