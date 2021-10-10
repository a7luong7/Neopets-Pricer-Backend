import express from 'express';
import dotenv from 'dotenv';
import itemRouter from './routes/item-route';
import shopRouter from './routes/shop-route';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/shops', shopRouter);
app.use('/api/items', itemRouter);

// 404 catchall
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Invalid route' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// Unhandled exception catchall
app.use((error:Error, req:express.Request, res:express.Response, next:Function) => {
  console.log(`Unhandled exception at: ${req.path}`);
  if (process.env.NODE_ENV !== 'production') {
    return res.status(500).send(error);
  }
  return res.status(500).json({ error: 'Internal server error' });
  next(error);
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log('listening on port', port);
});
