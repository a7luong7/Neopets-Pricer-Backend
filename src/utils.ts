import { ItemInsertRequest, ShopInsertRequest } from './types';

export const wait = (ms:number) => new Promise(
  (resolve) => setTimeout(resolve, ms),
);

export const waitRandom = (minMs:number, maxMs:number) => {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs);
  return wait(ms);
};

const isString = (param : unknown) : param is string => typeof param === 'string' || param instanceof String;
const parseString = (param : unknown, name : string) : string => {
  if (!param || !isString(param)) { throw new Error(`Incorrect or missing field: ${name}`); }
  return param;
};

const isNumber = (param : unknown) : param is number => typeof param === 'number' || param instanceof Number;
const parseNumber = (param : unknown, name : string) : number => {
  if (param == null || !isNumber(param)) { throw new Error(`Incorrect or missing field: ${name}`); }
  return param;
};

const isBoolean = (param : unknown) : param is boolean => typeof param === 'boolean' || param instanceof Boolean;
const parseBoolean = (param : unknown, name : string) : boolean => {
  if (param == null || !isBoolean(param)) { throw new Error(`Incorrect or missing field: ${name}`); }
  return param;
};

type ItemInsertRequestFields = {
  name: unknown,
  shopID: unknown,
  jellyID: unknown,
  price?: unknown,
  isActive: unknown,
};
export const toItemInsertRequest = (object : ItemInsertRequestFields) : ItemInsertRequest => {
  const request: ItemInsertRequest = {
    name: parseString(object.name, 'name'),
    shopID: parseNumber(object.shopID, 'shopID'),
    jellyID: parseNumber(object.jellyID, 'jellyID'),
    price: object.price == null ? undefined : parseNumber(object.price, 'price'),
    isActive: parseBoolean(object.isActive, 'isActive'),
  };
  return request;
};

type ShopInsertRequestFields = {
  title: unknown,
  neoID: unknown,
  jellyID:unknown,
  isActive:unknown,
};
export const toShopInsertRequest = (object : ShopInsertRequestFields) : ShopInsertRequest => {
  const request: ShopInsertRequest = {
    title: parseString(object.title, 'title'),
    neoID: parseNumber(object.neoID, 'neoID'),
    jellyID: parseNumber(object.jellyID, 'jellyID'),
    isActive: parseBoolean(object.isActive, 'isActive'),
  };
  return request;
};

export default {};
