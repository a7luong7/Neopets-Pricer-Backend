import express from 'express';
import { getShops } from '../services/shop-service';

const shopRouter = express.Router();

shopRouter.get('/', async (req:express.Request, res:express.Response) => {
  const shops = await getShops();
  return res.status(200).json(shops);
  // res.status(404).send('not implemented yet');
});

export default shopRouter;
