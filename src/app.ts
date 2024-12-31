import express from 'express'
import productRoutes from '@/routes/product'
import { domainErrorHandler } from '@/middleware/domainError'
import { parsingJsonErrorHandler } from '@/middleware/parsingJsonError'

const app = express()

app.use(express.json())
app.use(parsingJsonErrorHandler)
app.use('/api/products', productRoutes)
app.use(domainErrorHandler)

export default app
