/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
import { updateItemsFromJelly } from './item-service';
import { getActiveShops, insertOrUpdateShops } from './shop-service';
import { addDays } from '../utils';

const updateItems = async (): Promise<string> => {
  const activeShops = await getActiveShops();
  const now = new Date();
  const shopsNeedingUpdate = activeShops
    .filter((x) => {
      const nextUpdate = addDays(x.dateUpdated, 14);
      return nextUpdate < now;
    });

  if (shopsNeedingUpdate.length === 0) {
    return 'No shops need to be updated';
  }

  for (let i = 0; i < shopsNeedingUpdate.length; i++) {
    const shop = shopsNeedingUpdate[i];
    console.log('Updating items for shop: ', shop.title);
    const updateItemsResult = await updateItemsFromJelly(shop);
    if (!updateItemsResult.isSuccess) { return updateItemsResult.message; }
    const updateShopResult = await insertOrUpdateShops([shop]);
    if (!updateShopResult.isSuccess) { return updateItemsResult.message; }
  }

  return `${shopsNeedingUpdate.length} shops updated`;
};

export default updateItems;
