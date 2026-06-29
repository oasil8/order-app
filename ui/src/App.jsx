import { useState } from 'react'
import Header from './components/Header'
import OrderPage from './components/OrderPage'
import AdminPage from './components/AdminPage'
import './App.css'

function App() {
  const [page, setPage] = useState('order')

  return (
    <div className="app">
      <Header currentPage={page} onNavigate={setPage} />
      {page === 'order' && <OrderPage />}
      {page === 'admin' && <AdminPage />}
    </div>
  )
}

export default App
