import { SearchFilterSortParamsOpt } from './global';

export type GoodsDataForGroupingModel = {
  index: number;
  goods_id: number;
  grade_info_id: number;
  weight_info_id: number;
  serial_number: string;
  sales_code: string;
  product_type: string;
  farmer_name: string;
  coordinator_name: string;
  client_name: string;
  client_code: string;
  grade: string;
  ub: number;
  grader: string;
  djarum_grade?: string;
  grading_date: string;
  grading_by: string;
  grouping_number?: string;
  grouping_date?: string;
  grouping_by?: string;
};

export type GoodsDataForGroupingParams = {
  index: number;
  serial_number_or_code: string;
  djarum_grade: string;
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
  total_goods: number;
  last_updated: string;
  created_at: string;
  created_by: string;
};

export interface GroupingDetailPayload extends SearchFilterSortParamsOpt {
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
};

export type GroupingAndGoodsModel = {
  type: 'GROUP' | 'GOODS';
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
  product_type: 'Kemitraan' | 'Lokal' | 'Dagang';
  coordinator_name: string;
  coordinator_code: string;
  client_weight: number;
  gross_weight: number;
};
