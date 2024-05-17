import { SearchFilterSortParams } from "./global";

export type BarcodeTableData = {
  coordinator_name: string;
  queue_supplies_id: number;
  product_type: string;
  farmer_name: string;
  is_printed: boolean;
  created_at: Date;
  barcode_data: BarcodeData[];
};

export type BarcodeData = {
  barcode_id: number;
  company_barcode: string;
  date_in: null;
};

export enum BarcodeSellingPayloadEnum {
  ASSIGNEE_ID = "assignee_id",
  CLIENT_ID = "client_id",
  QUANTITY = "quantity",
}

export type BarcodeSellingForm = {
  [BarcodeSellingPayloadEnum.ASSIGNEE_ID]: string;
  [BarcodeSellingPayloadEnum.CLIENT_ID]: string;
  [BarcodeSellingPayloadEnum.QUANTITY]: string;
};

export type BarcodeSellingPayload = {
  [BarcodeSellingPayloadEnum.ASSIGNEE_ID]: number;
  [BarcodeSellingPayloadEnum.CLIENT_ID]: number;
  [BarcodeSellingPayloadEnum.QUANTITY]: number;
};

export type ClientBarcodeModel = {
  code_id: number;
  code: string;
  created_at: string;
  created_by_id: number;
  created_by_name: string;
};

export type ClientBarcodeWithStatusModel = {
  code: string;
  status?: "free" | "used" | "assigned";
  timestamp?: number;
};

export type ClientBarcodeGroupedByInitialModel = {
  initial: string;
  codes?: ClientBarcodeWithStatusModel[];
};

export type ClientBarcodeGroupModel = {
  key?: number;
  user_id: number;
  user_name: string;
  client_id: number;
  client_name: string;
  codes?: ClientBarcodeModel[];
  code_data?: ClientBarcodeGroupedByInitialModel[];
};

export interface BarcodeFilterSortParams extends SearchFilterSortParams {
  current_date?: string;
}
