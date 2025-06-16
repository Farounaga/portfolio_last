import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import askHandler from './ask.js'

dotenv.config()

const app = express()
app.use(express.json())
app.post('/api/ask', askHandler)
app.use(express.static(path.join(process.cwd(), 'public')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
