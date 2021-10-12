/* eslint-disable @typescript-eslint/no-unused-vars */
import ItemModel from '../models/item';
import {
  GenericResponse, Item, ItemInsertRequest, ItemInsertDTO, ItemDTO,
} from '../types';

const convertItems = (items:Item[]) : ItemDTO[] => {
  const dtoList = items.map((x) => ({
    name: x.name,
    price: x.price,
  }));
  return dtoList;
};

export const getItems = async (itemNames:string[]) : Promise<ItemDTO[]> => {
  const items:Item[] = await ItemModel.find({
    name: { $in: itemNames },
  });
  const convertedItems = convertItems(items);
  return convertedItems;
};

export const insertItems = async (items:ItemInsertRequest[]) : Promise<GenericResponse> => {
  const itemsToInsert = items;
  await ItemModel.insertMany(itemsToInsert);
  return <GenericResponse>{ isSuccess: true };
};

export const insertOrUpdateItems = async (items:ItemInsertRequest[]) : Promise<GenericResponse> => {
  const itemsToInsert = items;

  await ItemModel.bulkWrite(itemsToInsert.map((item) => ({
    updateOne: {
      filter: { name: item.name },
      update: item,
      upsert: true,
    },
  })));
  return <GenericResponse>{ isSuccess: true };
};

export default {};
