import { MetaType, SearchFilterSortParams } from "./global";
import { GradeModel } from "./grades";

export type GradeRecapModel = {
  grade: string;
  total: number;
};

export type FarmerRecapModel = {
  partner_id: string;
  farmer: string;
  total: number;
};

export type GroupingModel = {
  grouping_id: number;
  grouping_number: string;
  grouping_client_number?: string;
  client_id: number;
  client_name: string;
  client_code: string;
  grade_initial: string;
  ub: number;
  grouping_created_at: string;
  grouping_created_by: string;
  grade_recap_list: GradeRecapModel[];
  farmer_recap_list: FarmerRecapModel[];
  goods_total: number;
  client_price_total: number;
  client_net_weight_total: number;
};

export interface GroupingDetailPayload extends SearchFilterSortParams {
  is_edit?: boolean;
}

export type GroupingDetailModel = {
  grouping_id: number;
  grouping_number: string;
  grouping_client_number?: string;
  client_id: number;
  client_name: string;
  client_code: string;
  grade_initial: string;
  ub: number;
  grouping_data_json?: GroupingAndGoodsModel[];
  goods_data_json?: GroupingAndGoodsModel[];
  meta: MetaType;
};

export type GroupingAndGoodsModel = {
  type: "GROUP" | "GOODS";
  grouping_list_id: number;
  goods_id: number;
  grade_information_id: number;
  weight_information_id: number;
  serial_number: string;
  sales_code: string;
  grade: string;
  grade_price: number;
  unit_price: number;
  grader: string;
  farmer_name: string;
  product_type: "Kemitraan" | "Lokal" | "Dagang";
  coordinator_name: string;
  coordinator_code: string;
  client_weight: number;
  gross_weight: number;
};

export type UpdateGroupingParamsDto = {
  new_data: GroupingAndGoodsModel[];
  reject_data: GroupingAndGoodsModel[];
  changed_grade: { item: GroupingAndGoodsModel; new_grade: GradeModel }[];
  data_to_remove: number[];
  grouping_id: number;
};
