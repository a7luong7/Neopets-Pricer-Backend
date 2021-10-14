import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { exit } from 'process';
import itemRouter from './routes/item-route';
import shopRouter from './routes/shop-route';
import updateItems from './services/update-items';
import 'express-async-errors';

dotenv.config();
mongoose.connect(process.env.DB_URI as string, { });

const updateItemsProm = () => {
  console.log('Update items start: ', new Date());
  return updateItems()
    .then((res) => {
      console.log('Update items complete: ', res);
    })
    .catch((error: any) => {
      console.log('Update items error: ', error);
    })
    .then(() => console.log('Update items end: ', new Date()));
};
const argFlags = process.argv.slice(2);
if (argFlags.includes('--updateItems')) {
  updateItemsProm().then(() => exit());
} else {
  const limiter = rateLimit({
    windowMs: Number(process.env.REQUESTS_LIMIT_WINDOW_MINUTES) * 60 * 1000, // 10min
    max: Number(process.env.MAX_REQUESTS_PER_WINDOW),
  });

  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use('/api/', limiter);
  app.use('/api/shops', shopRouter);
  app.use('/api/items', itemRouter);

  // 404 catchall
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Invalid route' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Unhandled exception catchall
  app.use((error:Error, req:express.Request, res:express.Response, next:Function) => {
    console.log(`Unhandled exception at: ${req.path}`, error);
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
    next(error);
  });

  const port = process.env.PORT;
  app.listen(port, () => {
    console.log('listening on port', port);
  });

  const updateItemsIntervalMs = (Number(process.env.UPDATE_ITEMS_DAYS_INTERVAL) as number)
    * 24 * 60 * 60 * 1000;
  setInterval(updateItemsProm, updateItemsIntervalMs);
}
