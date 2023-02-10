import express from 'express'

const router = express.Router()

router.get('/api/card', (req, res) => {
    return res.send('the card')
})

router.post('/api/card', (req, res) => {
    return res.send('new card created')
})

export { router as cardRouter }