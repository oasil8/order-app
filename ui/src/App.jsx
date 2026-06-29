import { useState } from 'react'
import Header from './components/Header'
import OrderPage from './components/OrderPage'
import './App.css'

function App() {
  const [page, setPage] = useState('order')

  return (
    <div className="app">
      <Header currentPage={page} onNavigate={setPage} />
      {page === 'order' && <OrderPage />}
      {page === 'admin' && (
        <main className="page-content">
          <p>관리자 화면 (준비 중)</p>
        </main>
      )}
    </div>
  )
}

export default App
