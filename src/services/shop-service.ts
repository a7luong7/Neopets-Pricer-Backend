import cheerio from 'cheerio';
import axios from 'axios';
import ShopModel from '../models/shop';
import sampleShops from '../data/sample-shops';
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

const getNeoIDFromLink = (link:string) : Number => {
  const regExp = /&obj_type=(\d+)$/gm;
  const matches = regExp.exec(link);
  return matches && matches.length > 0
    ? Number(matches[1])
    : 0;
};

const getJellyIDFromLink = (link:string) : Number => {
  const regExp = /\?cat\[]=(\d+)/gm;
  const matches = regExp.exec(link);
  return matches && matches.length > 0
    ? Number(matches[1])
    : 0;
};

const parseJellyShopsHTML = (html:string) : any => {
  const $ = cheerio.load(html);

  const excludeShopTypes = ['Other', 'Other2']; // Non-standard shops
  const excludeShops = ['Krawk Island Nippers', "Smuggler's Cove"]; // They don't take NP
  const shops:any = [];
  $('.box_content').each((i:number, elem:any) => {
    const shopType = $(elem).closest('.box_shell').prev('h2').attr('id');
    if (!shopType || excludeShopTypes.includes(shopType)) { return; }

    const tableCells = $(elem).find('td');
    tableCells.each((j:number, cell:any) => {
      const links = $(cell).find('a');
      const neoLink = links[0];
      const jellyLink = links[1];

      const shopName = $(neoLink).text().trim();
      if (excludeShops.includes(shopName)) return;

      const neoID = getNeoIDFromLink($(neoLink).attr('href') as string);
      const jellyLinkStr = $(jellyLink).attr('href') as string;
      const jellyID = getJellyIDFromLink(jellyLinkStr);

      const shop = {
        title: shopName,
        neoID,
        jellyID,
      };
      shops.push(shop);
    });
  });
  return shops;
};

export const getJellyShops = async (): Promise<any> => {
  const url = 'https://www.jellyneo.net/?go=shopsdirectory';
  const result = await axios.get(url);
  const jellyShops = parseJellyShopsHTML(result.data as string);
  return jellyShops;
};

export default {};
