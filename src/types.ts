export interface GenericResponse {
  isSuccess: boolean,
  message: string
}

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

export type ItemInsertRequest = Omit<Item, 'id' | 'dateAdded' | 'dateUpdated'>;
export type ItemInsertDTO = Omit<Item, 'id'>;
export type ItemDTO = Pick<Item, 'name' | 'price'>;
