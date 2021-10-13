import express from 'express';
import {
  getItems, insertItems, insertOrUpdateItems, getJellyItems, updateItemsFromJelly, getJellyItem,
} from '../services/item-service';
import { getShop, getShops } from '../services/shop-service';
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

itemRouter.post('/search/:shopID', async (req:express.Request, res:express.Response) => {
  const shopIDStr = req.params.shopID;
  if (!shopIDStr || Number.isNaN(Number(shopIDStr))) {
    return res.status(400).json({ error: 'Invalid shop ID' });
  }
  const shopID = Number(shopIDStr);

  const itemNamesFromReq:any = req.body.itemNames;
  const isBadRequest = !itemNamesFromReq
    || !(itemNamesFromReq instanceof Array)
    || itemNamesFromReq.length === 0;
  if (isBadRequest) {
    return res.status(400).json({ error: 'Invalid item name list' });
  }

  const shop = await getShop(shopID);
  if (!shop) {
    return res.status(500).json({ error: 'Shop currently not supported' });
  }

  const itemNames:string[] = itemNamesFromReq;
  const items = await getItems(shopID, itemNames);
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

itemRouter.get('/jelly/:id', async (req:express.Request, res:express.Response) => {
  const jellyIDStr = req.params.id;
  if (!jellyIDStr || Number.isNaN(Number(jellyIDStr))) {
    return res.status(400).json({ error: 'Invalid jellyneo item ID' });
  }

  const jellyItem = await getJellyItem(Number(jellyIDStr));
  return res.status(200).json({ html: jellyItem });
});

itemRouter.get('/jelly', async (req:express.Request, res:express.Response) => {
  const jellyItems = await getJellyItems(1, 5);
  return res.status(200).json({ html: jellyItems });
});

itemRouter.post('/update/:id', async (req:express.Request, res:express.Response) => {
  const shopID = req.params.id;
  if (!shopID || Number.isNaN(Number(shopID))) {
    return res.status(404).json({ error: 'Please provide the jellyneo ID for the shop to be updated' });
  }

  const shops = await getShops();
  const shop = shops.find((x) => x.jellyID === Number(shopID));
  if (!shop) {
    return res.status(404).json({ error: `Shop with jelly ID: ${shopID} not found` });
  }

  const result = await updateItemsFromJelly(shop);
  return res.status(200).json({ result });
});
export default itemRouter;
