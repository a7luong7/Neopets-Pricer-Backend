import express from 'express';
import { getItems, addItems } from '../services/item-service';
import { ItemInsertRequest } from '../types';
import { toItemInsertRequest } from '../utils';

require('express-async-errors');

const itemRouter = express.Router();

itemRouter.post('/search', async (req:express.Request, res:express.Response) => {
  const itemNamesFromReq:any = req.body.itemNames;
  const isBadRequest = !itemNamesFromReq
    || !(itemNamesFromReq instanceof Array)
    || itemNamesFromReq.length === 0;
  if (isBadRequest) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  const itemNames:string[] = itemNamesFromReq;
  // console.log('item names', itemNames);
  const items = await getItems(itemNames);
  return res.status(200).json(items);
});

itemRouter.post('/', async (req:express.Request, res:express.Response) => {
  const reqBody = req.body;
  const isBadRequest = !reqBody
    || !(reqBody instanceof Array)
    || reqBody.length === 0;
  if (isBadRequest) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  let insertRequest = <ItemInsertRequest[]>[];
  try {
    insertRequest = reqBody.map((x) => toItemInsertRequest(x));
  } catch (e:any) {
    return res.status(400).json({ error: e.message });
  }

  const insertResponse = await addItems(insertRequest);
  return res.status(200).json({ success: true, body: insertResponse });
});

export default itemRouter;
