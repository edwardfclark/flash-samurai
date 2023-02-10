import express from 'express'
import { json } from 'body-parser'
import { cardRouter } from './routes/cards'

const app = express()
app.use(json())
app.use(cardRouter)

app.listen(3000, () => {
    console.log('server is listening on port 3000')
})