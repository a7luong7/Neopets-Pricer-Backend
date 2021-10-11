import express from 'express';
import { getItems } from '../services/item-service';

const itemRouter = express.Router();

itemRouter.post('/search', async (req:express.Request, res:express.Response) => {
  // return res.status(404).send('not implemented yet');
  const itemNamesFromReq:any = req.body.itemNames;
  const isBadRequest = !itemNamesFromReq
    || itemNamesFromReq.length === 0
    || !(itemNamesFromReq instanceof Array);
  if (isBadRequest) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  const itemNames:string[] = itemNamesFromReq;
  // console.log('item names', itemNames);
  const items = await getItems(itemNames);
  return res.status(200).json(items);
});

export default itemRouter;
