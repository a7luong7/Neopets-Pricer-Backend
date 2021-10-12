import express from 'express';
import { getItems, insertItems, insertOrUpdateItems } from '../services/item-service';
import { ItemInsertRequest } from '../types';
import { toItemInsertRequest } from '../utils';

require('express-async-errors');

const itemRouter = express.Router();

const findDuplicates = (names:string[]) : string[] => {
  const duplicates = <string[]>[];
  const sortedNames = names.map((x) => x.trim().toUpperCase()).sort();
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sortedNames.length - 1; i++) {
    if (sortedNames[i] === sortedNames[i + 1]) {
      duplicates.push(sortedNames[i]);
    }
  }
  return [...new Set(duplicates)];
};

itemRouter.post('/search', async (req:express.Request, res:express.Response) => {
  const itemNamesFromReq:any = req.body.itemNames;
  const isBadRequest = !itemNamesFromReq
    || !(itemNamesFromReq instanceof Array)
    || itemNamesFromReq.length === 0;
  if (isBadRequest) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  const itemNames:string[] = itemNamesFromReq;
  const items = await getItems(itemNames);
  return res.status(200).json(items);
});

const getItemInsertOrUpdateRequest = (reqBody:any) : [string, ItemInsertRequest[]] => {
  const isBadRequest = !reqBody
    || !(reqBody instanceof Array)
    || reqBody.length === 0;
  if (isBadRequest) {
    return ['Bad Request', []];
  }

  let insertOrUpdateRequest = <ItemInsertRequest[]>[];
  try {
    insertOrUpdateRequest = reqBody.map((x) => toItemInsertRequest(x));
    const duplicateNames = findDuplicates(insertOrUpdateRequest.map((x) => x.name));
    if (duplicateNames.length !== 0) {
      return [`Duplicate item names found: ${duplicateNames.join(', ')}`, []];
    }
  } catch (e:any) {
    return [e.message, []];
  }

  return ['', insertOrUpdateRequest];
};

itemRouter.post('/', async (req:express.Request, res:express.Response) => {
  const [reqError, insertOrUpdateRequest] = getItemInsertOrUpdateRequest(req.body);
  if (reqError) {
    return res.status(400).json({ error: reqError });
  }

  const insertResponse = await insertItems(insertOrUpdateRequest);
  return res.status(200).json({ insertResponse });
});

itemRouter.put('/', async (req:express.Request, res:express.Response) => {
  const [reqError, insertOrUpdateRequest] = getItemInsertOrUpdateRequest(req.body);
  if (reqError) {
    return res.status(400).json({ error: reqError });
  }

  const insertOrUpdateResponse = await insertOrUpdateItems(insertOrUpdateRequest);
  return res.status(200).json({ insertOrUpdateResponse });
});

export default itemRouter;
