import { NormalParams } from "./global";
import { InvoiceStatusType } from "./invoice";
import { DeliveryStatusAccumModel } from "./purchase";

export type GetStockListNewParams = {
  goods_status?: string;
  invoice_status?: string;
  client_code?: string;
  goods_status_list?: (keyof DeliveryStatusAccumModel)[];
  invoice_status_list?: InvoiceStatusType[];
  client_code_list?: string[];
  goods_date?: string;
  purchase_date?: string;
  goods_date_to?: string;
  purchase_date_to?: string;
  sort_by?: string;
};

export interface GetStockListParams
  extends NormalParams,
    GetStockListNewParams {}

export type GradeInfoDataModel = {
  grade_info_id: number;
  grade: string;
  unit_price: number;
  grade_price: number;
  sales_code: string;
  client_name: string;
  client_code: string;
  grader: string;
  created_at: string;
  created_by: string;
  deleted_at?: string;
  deleted_reason?: string;
};

export type WeightInfoDataModel = {
  weight_info_id: number;
  gross_weight: number;
  created_at: string;
  created_by: string;
  deleted_at: string;
  deleted_reason: string;
};

export type InvoiceStatusModel = {
  status: string;
  status_date: string;
  created_by: string;
};

export type PurchaseInfoDataModel = {
  purchase_info_id: number;
  grade_info_id: number;
  grade: string;
  unit_price: number;
  grade_price: number;
  sales_code: string;
  client_name: string;
  client_code: string;
  grader: string;
  weight_info_id: number;
  gross_weight: number;
  purchase_gross_weight: number;
  purchase_net_weight: number;
  invoice_number: string;
  status_list: InvoiceStatusModel[];
  created_at: string;
  created_by: string;
  deleted_at: string;
  deleted_reason: string;
};

export type GetStockDetailModel = {
  bucket_id: number;
  serial_number: string;
  coordinator_name: string;
  farmer_name: string;
  goods_id: number;
  grade_info_data_list: GradeInfoDataModel[];
  weight_info_data_list: WeightInfoDataModel[];
  purchase_info_data_list: PurchaseInfoDataModel[];
};

export type SummaryGeneralValues = {
  total_goods?: number;
  average_price?: number;
  total_net_weight?: number;
  total_gross_weight?: number;
  total_purchase_price?: number;
};

export interface GetStockSummaryModel extends SummaryGeneralValues {
  parents_total_goods: number;
  client_group_list?: SummaryClientGroup[];
  coordinator_group_list?: SummaryCoordinatorGroup[];
  status_group_list?: SummaryStatusGroup[];
  invoice_status_group_list?: SummaryInvoiceStatusGroup[];
}

export interface SummaryClientGroup extends SummaryGeneralValues {
  client_code: string;
  client_name: string;
  grade_recap_list: SummaryGradeClientGroup[];
}

export interface SummaryGradeClientGroup extends SummaryGeneralValues {
  grade: string;
}

export interface SummaryCoordinatorGroup extends SummaryGeneralValues {
  coordinator_code: string;
  coordinator_name: string;
  client_grade_recap_list: SummaryClientGroup[];
}

export type SummaryStatusGroup = {
  status: string;
  total_goods: number;
};

export type SummaryInvoiceStatusGroup = {
  status: string;
  total_goods: number;
};
