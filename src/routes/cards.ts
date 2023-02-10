import express, { Request, Response } from 'express'

const router = express.Router()

router.get('/api/card', (req: Request, res: Response) => {
    return res.send('the card')
})

router.post('/api/card', (req: Request, res: Response) => {
    return res.send('new card created')
})

export { router as cardRouter }