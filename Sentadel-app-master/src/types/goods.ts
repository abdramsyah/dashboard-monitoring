import { FilterSortParamsType } from './global';

export type GetGoodsModel = {
  coordinator_name: string;
  coordinator_code: string;
  farmer_name: string;
  product_type: string;
  goods_id: number;
  pour_out_date: string;
  user_grading_name: string;
  serial_number: string;
  grading_data: GetGoodsGradingModel[];
  weigh_data: GetGoodsWeighModel[];
};

export type GetGoodsGradingModel = {
  sales_code: string;
  grade: string;
  grade_price: number;
  unit_price: number;
  grading_date: string;
  grader_name: string;
  grading_by: string;
};

export type GetGoodsWeighModel = {
  gross_weight: number;
  weigh_date: string;
  weigh_by: string;
};

export interface GoodsInformationListPayload extends FilterSortParamsType {
  limit: number;
  page: number;
  keyword?: string;
}
