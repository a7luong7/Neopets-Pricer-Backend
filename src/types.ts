export interface Item {
  id: string,
  name: string,
  shopID: number,
  jellyID: number,
  price?: number,
  isActive: boolean,
  dateAdded: string,
  dateUpdated: string
}

export type ItemDTO = Pick<Item, 'name' | 'price'>;
