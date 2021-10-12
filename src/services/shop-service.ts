import ShopModel from '../models/shop';
import {
  GenericResponse,
  Shop,
  ShopDTO,
  ShopInsertRequest,
} from '../types';

export const getShops = async () : Promise<Shop[]> => {
  const shops:Shop[] = await ShopModel.find();
  return shops;
};

export default {};
