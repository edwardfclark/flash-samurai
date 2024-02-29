import express, { type Request, type Response, type NextFunction } from 'express';
import bodyParser from 'body-parser';

const router = express.Router();

router.post('/api/performance', bodyParser.json({ type: '*/*' }), (req: Request, res: Response, next: NextFunction) => {
  const now = new Date().getTime() / 1000;
  const record = `${now},${req.body.url},${req.body.dcl},${req.body.load},${req.body.fcp},${req.body.lcp},${req.body.cls},${req.body.fid}`;

  // TODO: Do something with this performance data (e.g. save it to a database)
  console.log(record);

  res.sendStatus(200);
  next();
});

export { router as performanceRouter };
