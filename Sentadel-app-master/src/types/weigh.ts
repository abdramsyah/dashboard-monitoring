import { BarcodeDetailModel } from './queue';

export interface GoodsDetailModel extends BarcodeDetailModel {
  sales_code?: string;
  gross_weight?: number;
  goods_id?: number;
}

export type WeightConfirmationModalCtrlType = {
  open: boolean;
  data?: GoodsDetailModel;
};

export type SetWeightModel = {
  goods_id: number;
  gross_weight: number;
};
