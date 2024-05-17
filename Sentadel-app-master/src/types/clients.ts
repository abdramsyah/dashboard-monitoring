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

export interface AddressModel {
  id?: number;
  client_id?: number;
  address?: string;
}
