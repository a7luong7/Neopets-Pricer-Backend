import express from 'express';
import {
  getShops, insertShops, insertOrUpdateShops, getJellyShops, getActiveShops,
  updateShopActiveStatus,
} from '../services/shop-service';
import { toShopInsertRequest, toShopUpdateActiveStatusRequest } from '../utils';
import { ShopInsertRequest } from '../types';

const shopRouter = express.Router();

shopRouter.get('/', async (req:express.Request, res:express.Response) => {
  const shops = await getShops();
  return res.status(200).json(shops);
});

shopRouter.get('/active', async (req:express.Request, res:express.Response) => {
  const shops = await getActiveShops();
  const shopsDTO = shops.map((x) => ({
    title: x.title,
    dateUpdated: x.dateUpdated,
  }));
  return res.status(200).json(shopsDTO);
});

shopRouter.post('/active', async (req:express.Request, res:express.Response) => {
  const reqBody = req.body;

  const isBadRequest = !reqBody
    || !(reqBody instanceof Array)
    || reqBody.length === 0;
  if (isBadRequest) {
    return res.status(400).json({ error: 'Bad Request' });
  }
  const updateActiveStatusRequest = reqBody.map((x) => toShopUpdateActiveStatusRequest(x));
  const response = await updateShopActiveStatus(updateActiveStatusRequest);
  return res.status(200).json(response);
});

// const findDuplicates = (requestItems:ShopInsertRequest[]) : string[] => {
//   const duplicates = <string[]>[];
//   const sortedItems = requestItems
//     .map((shop) => ({
//       ...shop,
//       title: shop.title.trim().toUpperCase(),
//     }))
//     .sort((a, b) => {
//       if (a.title > b.title) return 1;
//       if (a.title < b.title) return -1;
//       return 0;
//     });

//   // eslint-disable-next-line no-plusplus
//   for (let i = 0; i < sortedItems.length - 1; i++) {
//     const item = sortedItems[i];
//     const next = sortedItems[i + 1];
//     if (item.title === next.title || item.neoID === next.neoID || item.jellyID === next.jellyID) {
//       duplicates.push(sortedItems[i].title);
//     }
//   }
//   return [...new Set(duplicates)];
// };

// const getShopInsertOrUpdateRequest = (reqBody:any) : [string, ShopInsertRequest[]] => {
//   const isBadRequest = !reqBody
//     || !(reqBody instanceof Array)
//     || reqBody.length === 0;
//   if (isBadRequest) {
//     return ['Bad Request', []];
//   }

//   let insertOrUpdateRequest = <ShopInsertRequest[]>[];
//   try {
//     insertOrUpdateRequest = reqBody.map((x) => toShopInsertRequest(x));
//     const duplicates = findDuplicates(insertOrUpdateRequest);
//     if (duplicates.length !== 0) {
//       return [`Duplicate shops found. Shops should have a unique name, neoID, and jellyID: ${duplicates.join(', ')}`, []];
//     }
//   } catch (e:any) {
//     return [e.message, []];
//   }

//   return ['', insertOrUpdateRequest];
// };

// shopRouter.post('/', async (req:express.Request, res:express.Response) => {
//   const [reqError, insertOrUpdateRequest] = getShopInsertOrUpdateRequest(req.body);
//   if (reqError) {
//     return res.status(400).json({ error: reqError });
//   }

//   const insertResponse = await insertShops(insertOrUpdateRequest);
//   return res.status(200).json({ insertResponse });
// });

// shopRouter.put('/', async (req:express.Request, res:express.Response) => {
//   const [reqError, insertOrUpdateRequest] = getShopInsertOrUpdateRequest(req.body);
//   if (reqError) {
//     return res.status(400).json({ error: reqError });
//   }

//   const insertOrUpdateResponse = await insertOrUpdateShops(insertOrUpdateRequest);
//   return res.status(200).json({ insertOrUpdateResponse });
// });

// shopRouter.get('/jelly', async (req:express.Request, res:express.Response) => {
//   const jellyShops = await getJellyShops();
//   return res.status(200).json({ html: jellyShops });
// });

// shopRouter.post('/update', async (req:express.Request, res:express.Response) => {
//   const jellyShops = await getJellyShops();
//   if (!jellyShops || jellyShops.length === 0) {
//     return res.status(500).json({ error: 'Could not retrieve shops from jellyneo' });
//   }

//   const insertOrUpdateResponse = await insertOrUpdateShops(jellyShops);
//   return res.status(200).json({ insertOrUpdateResponse });
// });

export default shopRouter;
