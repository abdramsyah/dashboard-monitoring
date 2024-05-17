import { FilterParamsType } from './global';
import { InvoiceStatusModel } from './invoices';
import { PartnerModel } from './partner';

export enum ScannedStatusEnum {
  Reject = 'REJECT',
  Approve = 'APPROVE',
  AlreadyRejected = 'ALREADY_REJECTED',
  AlreadyApproved = 'ALREADY_APPROVED'
}

export enum QueueRequestEnum {
  QUEUES = 'queues',
  COORDINATOR_ID = 'coordinator_id',
  IS_NOT_MEMBER = 'is_not_member',
  COORDINATOR_USER_DATA = 'coordinator_user_data'
}

export enum QueueRequestDataEnum {
  FARMER = 'farmer',
  PARTNER_ID = 'partner_id',
  PRODUCT_TYPE = 'product_type',
  REQUEST_QUANTITY = 'request_quantity'
}

export enum ProgressStatus {
  ON_PROGRESS = 'ON_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type PourOutPayloadType = {
  data: {
    serial_number: string;
    status: ScannedStatusEnum;
  }[];
};

export type CreateGoodsResModel = {
  goods_id?: number;
  bucket_id: number;
  serial_number?: string;
  current_status?: ScannedStatusEnum;
  status?: ScannedStatusEnum;
  transaction_date?: string;
};

export type BarcodeScanListType = {
  key?: number;
  serial_number: string;
  status?: ScannedStatusEnum;
  message?: string;
};

export interface PourOutConfirmationModalCtrlType extends BarcodeDetailModel {
  open: boolean;
}

export interface QueueGroupPayload extends FilterParamsType {
  limit: number;
  page: number;
  keyword?: string;
  current_date?: string;
}

export type QueueGroupModel = {
  coordinator_name: string;
  coordinator_code: string;
  delivery_number?: string;
  queue_data: QueueModel[];
  quantity_bucket: number;
  accum_bucket: number;
  last_created_at: string;
  status: ProgressStatus;
  scheduled_arrival_date?: string;
};

export type QueueModel = {
  queue_id: number;
  queue_delivery_id: number;
  delivery_number: string;
  farmer_name: string;
  product_type: string;
  serial_codes: string[];
  quantity_bucket: number;
  created_at: string;
  status: ProgressStatus;
  status_date: string;
  printed_at?: string;
  printed_by?: number;
};

export type QueueRequestDataProps = {
  [QueueRequestDataEnum.FARMER]: string | PartnerModel;
  [QueueRequestDataEnum.PARTNER_ID]?: number;
  [QueueRequestDataEnum.PRODUCT_TYPE]: string;
  [QueueRequestDataEnum.REQUEST_QUANTITY]: number | string;
};

export type QueueRequestProps = {
  [QueueRequestEnum.QUEUES]: QueueRequestDataProps[];
};

export enum GroupByQueueGroupDetailEnum {
  INVOICE = 'INVOICE',
  FARMER = 'FARMER',
  PRODUCT = 'PRODUCT'
}

export type InvoiceCardType = {
  title: string;
  value?: number | string;
  suffix?: string;
};

export type QueueGroupDetailPayload = {
  delivery_number: string;
  group_by: GroupByQueueGroupDetailEnum;
  keyword?: string;
};

export type QueueDetailModel = {
  bucket_id: number;
  farmer_name: string;
  product_type: string;
  serial_number: string;
  gross_weight: number;
  purchase_gross_weight: number;
  purchase_net_weight: number;
  purchase_price: number;
  invoice_number: string;
  status_list: InvoiceStatusModel[];
  status: ProgressStatus;
  unit_price?: number;
};

export type QueueGroupDetailModel = {
  delivery_id: number;
  delivery_number: number;
  filter_param: number;
  queue_data: QueueDetailModel[];
  purchase_price_accum: number;
};

export type BarcodeDetailModel = {
  serial_number?: string;
  coordinator_name?: string;
  farmer_name?: string;
  product_type?: string;
};
