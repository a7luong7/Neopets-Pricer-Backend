/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-unused-vars */
import cheerio from 'cheerio';
import axios from 'axios';
import ItemModel from '../models/item';
import {
  GenericResponse, Item, ItemInsertRequest, ItemInsertDTO, ItemDTO, Shop,
} from '../types';
import { waitRandom } from '../utils';

const waitMsMin = 1500;
const waitMsMax = 2500;

const convertItems = (items:Item[]) : ItemDTO[] => {
  const dtoList = items.map((x) => ({
    name: x.name,
    price: x.price,
  }));
  return dtoList;
};

export const getItems = async (shopJellyID:number, itemNames:string[]) : Promise<ItemDTO[]> => {
  const items:Item[] = await ItemModel.find({
    shopID: shopJellyID,
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

const convertPrice = (priceStr:string) : number => Number(priceStr.replace(/[^0-9]+/g, ''));

const getJellyIDFromLink = (link:string) : Number => {
  const regExp = /\/item\/(\d+)\//gm;
  const matches = regExp.exec(link);
  return matches && matches.length > 0
    ? Number(matches[1])
    : 0;
};

const getPriceFromJellyHistory = (npText:string) : Number | null => {
  const regExp = /([\d,]+) NP/gm;
  const matches = regExp.exec(npText);
  return matches && matches.length > 0
    ? Number(matches[1].replace(/[^0-9]+/g, ''))
    : null;
};

const parseJellyItemHTML = (html:string, jellyID:number) : any => {
  const $ = cheerio.load(html);

  const title = $('h1').text();
  const item:any = {
    name: title,
    jellyID,
    price: null,
    hasInflationNotice: false,
  };
  const hasInflationNotice = $('.alert-box.inflated').length !== 0;
  if (hasInflationNotice) {
    // Inflated price might not be accurate, use last known stable price
    item.hasInflationNotice = true;
    const oldPriceRows = $('.price-row.older-price');
    if ($(oldPriceRows).length > 0) {
      const textNode = $(oldPriceRows[0]).contents().filter(function () {
        return this.nodeType === 3;
      });
      item.price = getPriceFromJellyHistory($(textNode).text());
    }
  } else {
    const priceRows = $('.price-row');
    if ($(priceRows).length > 0) {
      const textNode = $(priceRows[0]).contents().filter(function () {
        return this.nodeType === 3;
      });
      item.price = getPriceFromJellyHistory($(textNode).text());
    }
  }

  return item;
};

export const getJellyItem = async (itemJellyID:number) => {
  const url = `https://items.jellyneo.net/item/${itemJellyID}`;
  const result = await axios.get(url);
  // return parseJellyItemHTML(sampleItem, itemJellyID);
  return parseJellyItemHTML(result.data, itemJellyID);
};

const parseJellyItemsHTML = (html:string) : any => {
  const $ = cheerio.load(html);

  const items:any = [];
  $('.content-wrapper .large-block-grid-5 li').each((i:number, elem:any) => {
    const links = $(elem).find('a');
    const titleLink = $(links)[1];

    const title:string = $(titleLink).text() || '';
    if (!title) { return; }

    const item:any = {
      name: title,
      jellyID: getJellyIDFromLink($(titleLink).attr('href') as string),
      price: null,
      hasInflationNotice: false,
    };

    if ($(links).length > 1) {
      const priceStr = $($(links)[2]).text() || '';
      const isInflationNotice = priceStr === 'Inflation Notice';
      if (isInflationNotice) {
        item.hasInflationNotice = true;
      } else if (priceStr.length > 0) {
        item.price = convertPrice(priceStr);
      }
    }

    items.push(item);
  });
  return items;
};

export const getJellyItems = async (shopjellyID:number, page:number): Promise<any> => {
  const start = (page - 1) * 50;
  const url = 'https://items.jellyneo.net/search/'
    + `?cat[]=${shopjellyID}`
    + '&min_rarity=1'
    + '&max_rarity=100' // r101 and above not sold in normal shops
    + '&status=1' // status Active (as defined by jellyneo)
    + `&start=${start}`;

  // console.log('getting jelly items url', url);

  const result = await axios.get(url);
  const jellyItems = parseJellyItemsHTML(result.data as string);

  // Individual lookups must be done for potentially inflated items
  const inflatedItems = jellyItems.filter((x:any) => x.hasInflationNotice);
  for (let i = 0; i < inflatedItems.length; i++) {
    await waitRandom(waitMsMin, waitMsMax);
    const inflatedItem = await getJellyItem(inflatedItems[0].jellyID);
    if (inflatedItem) {
      inflatedItems[i].price = inflatedItem.price;
    }
  }

  return jellyItems;
};

const convertJellyItems = (shop:Shop, items:any) : ItemInsertRequest[] => {
  const convertedItems = items
    .map((item: any) => ({
      name: item.name,
      shopID: shop.jellyID,
      jellyID: item.jellyID,
      price: item.price == null ? null : item.price,
      isActive: true,
    }));
  return convertedItems;
};

export const updateItemsFromJelly = async (shop:Shop) : Promise<GenericResponse> => {
  let page = 1;
  const maxPages = 150;
  let jellyItems:any = [];

  while (page <= maxPages) {
    await waitRandom(waitMsMin, waitMsMax);
    const jellyItemsPage = await getJellyItems(shop.jellyID, page);
    if (!jellyItemsPage || jellyItemsPage.length === 0) {
      break; // End of pages
    }
    jellyItems = jellyItems.concat(jellyItemsPage);
    page++;
  }

  if (jellyItems.length === 0) {
    return <GenericResponse>{ isSuccess: false, message: 'Could not get items from jellyneo' };
  }

  const convertedItems = convertJellyItems(shop, jellyItems);
  if (convertedItems.length === 0) {
    return <GenericResponse>{ isSuccess: true, message: 'No updates needed for item database' };
  }

  return insertOrUpdateItems(convertedItems);
};

export default {};
