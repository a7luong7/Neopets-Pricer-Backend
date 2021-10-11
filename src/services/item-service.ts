/* eslint-disable @typescript-eslint/no-unused-vars */
import ItemModel from '../models/item';
import { Item, ItemDTO } from '../types';

const convertItems = (items:Item[]) : ItemDTO[] => {
  const dtoList = items.map((x) => ({
    name: x.name,
    price: x.price,
  }));
  return dtoList;
};

export const getItems = async (itemNames:string[]) : Promise<ItemDTO[]> => {
  // const items:ItemDTO[] = [];
  const items:Item[] = await ItemModel.find({});
  const convertedItems = convertItems(items);
  return convertedItems;
};

export default {};
