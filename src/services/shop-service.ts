import ShopModel from '../models/shop';
import {
  GenericResponse,
  Shop,
  ShopInsertRequest,
} from '../types';

export const getShops = async () : Promise<Shop[]> => {
  const shops:Shop[] = await ShopModel.find();
  return shops;
};

export const insertShops = async (shops:ShopInsertRequest[]) : Promise<GenericResponse> => {
  await ShopModel.insertMany(shops);
  return <GenericResponse>{ isSuccess: true };
};

export const insertOrUpdateShops = async (shops:ShopInsertRequest[]) => {
  await ShopModel.bulkWrite(shops.map((shop) => ({
    updateOne: {
      filter: { neoID: shop.neoID },
      update: shop,
      upsert: true,
    },
  })));
  return <GenericResponse>{ isSuccess: true };
};

export default {};
