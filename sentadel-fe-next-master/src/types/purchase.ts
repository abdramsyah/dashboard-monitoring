import { InvoiceStatusListType, InvoiceStatusType } from "./invoice";

export type InvoiceLastStatusType = {
  invoice_id: number;
  invoice_number: string;
  status: InvoiceStatusType;
  status_date: string;
};

export type DeliveryWithStatusAccumModel = {
  delivery_id: number;
  delivery_number: string;
  scheduled_arrival_date: string;
  delivery_created_at: string;
  total_queue: number;
  total_bucket: number;
  status_accum: DeliveryStatusAccumModel;
  invoice_list: InvoiceLastStatusType[];
};

export type DeliveryStatusAccumModel = {
  VALIDATED: number;
  WAITING_TO_VALIDATE: number;
  ON_PROGRESS: number;
  WEIGH: number;
  GRADE: number;
  POUR_OUT: number;
  REJECT: number;
  NOT_DELIVERED: number;
};

export type BucketData = {
  bucket_id: number;
  coordinator_name: string;
  farmer_name: string;
  partner_id: number;
  product_type: string;
  serial_number: string;
  goods_id: number;
  goods_date: number;
  grade_info_id: number;
  sales_code: string;
  client_name: string;
  client_company: "LAMPION" | "LENTERA";
  client_code: string;
  grade: string;
  unit_price: number;
  grade_price: number;
  weight_info_id: number;
  gross_weight: number;
  purchase_id?: number;
  purchase_grade_info_id: number;
  purchase_sales_code: string;
  purchase_client_name: string;
  purchase_client_company: "LAMPION" | "LENTERA";
  purchase_client_code: string;
  purchase_grade: string;
  purchase_unit_price: number;
  purchase_grade_price: number;
  purchase_gross_weight: number;
  purchase_net_weight: number;
  purchase_date: number;
  grade_information_excl_id?: number[];
  weight_information_excl_id?: number[];
  status?: string;
  invoice_id?: number;
  invoice_number?: string;
  purchase_price?: number;
  status_list?: InvoiceStatusListType[];
  latest_status?: string;
  latest_status_at?: string;
};

export type DeliveryDetail = {
  delivery_number: string;
  delivery_id: number;
  delivery_date: string;
  coordinator_name: string;
  bucket_quantity: number;
  bucket_list: BucketData[];
};

export type ValidateGoodsPayload = {
  delivery_number: string;
  delivery_id: number;
  goods_list: GoodsDataModel[];
};

export type GoodsDataModel = {
  purchase_id?: number | null;
  goods_id: number;
  grade_info_id: number;
  weight_info_id: number;
};
