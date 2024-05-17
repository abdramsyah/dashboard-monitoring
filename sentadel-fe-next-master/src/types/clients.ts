export interface ClientModel {
  id: number;
  client_name: string;
  code: string;
  status: string;
  company: string;
  created_at: string;
  last_updated_date: string;
  grade_list: string[];
  address_list?: AddressModel[];
}

export enum ClientModelRequestEnum {
  ID = "id",
  CLIENT_NAME = "client_name",
  CODE = "code",
  COMPANY = "company",
}

export type ClientModelRequestProps = {
  [ClientModelRequestEnum.ID]?: number;
  [ClientModelRequestEnum.CLIENT_NAME]: string;
  [ClientModelRequestEnum.CODE]: string;
};

export interface AddressModel {
  id?: number;
  client_id?: number;
  address?: string;
}
