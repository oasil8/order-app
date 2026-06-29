require('dotenv').config()
const express = require('express')
const cors = require('cors')

const menusRouter = require('./routes/menus')
const ordersRouter = require('./routes/orders')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: '커피 주문 앱 서버가 정상적으로 실행 중입니다.',
    endpoints: [
      'GET    /api/menus',
      'PATCH  /api/menus/:id/stock',
      'GET    /api/orders',
      'GET    /api/orders/:id',
      'POST   /api/orders',
      'PATCH  /api/orders/:id/status',
    ],
  })
})

app.use('/api/menus', menusRouter)
app.use('/api/orders', ordersRouter)

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
})
