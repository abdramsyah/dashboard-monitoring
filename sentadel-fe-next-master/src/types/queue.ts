import {
  CoordinatorCreatePayload,
  CoordinatorModelRequestProps,
} from "./coordinators";

export enum queueStatusEnum {
  ON_PROGRESS = "ON_PROGRESS",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum QueueRequestEnum {
  QUEUES = "queues",
  COORDINATOR_ID = "coordinator_id",
  IS_NOT_MEMBER = "is_not_member",
  COORDINATOR_USER_DATA = "coordinator_user_data",
}

export enum QueueRequestDataEnum {
  FARMER = "farmer",
  PRODUCT_TYPE = "product_type",
  REQUEST_QUANTITY = "request_quantity",
  PARTNER_ID = "partner_id",
}

export type queueDataBodyType = {
  date?: string;
  list: queueDataType[];
  total: number;
  code?: string;
  accumBucket?: number;
};

export type queueDataType = {
  queue_id: number;
  queue_delivery_id: number;
  farmer_name: string;
  product_type: string;
  quantity_bucket: number;
  serial_codes?: string[];
  created_at: string;
  status: queueStatusEnum;
  status_date: string;
  printed_at: string;
  printed_by: string;
};

export type queueGroupType = {
  coordinator_name: string;
  coordinator_code: string;
  delivery_number: string;
  queue_data: queueDataType[];
  quantity_bucket: number;
  accum_bucket: number;
  last_created_at: string;
  scheduled_arrival_date?: string;
  key?: number;
};

export type QueueRequestDataProps = {
  [QueueRequestDataEnum.FARMER]: string;
  [QueueRequestDataEnum.PARTNER_ID]?: number;
  [QueueRequestDataEnum.PRODUCT_TYPE]: string;
  [QueueRequestDataEnum.REQUEST_QUANTITY]: number;
};

export interface QueueRequestProps
  extends Omit<CoordinatorModelRequestProps, "quota"> {
  [QueueRequestEnum.QUEUES]: QueueRequestDataProps[];
  [QueueRequestEnum.COORDINATOR_ID]?: number;
  [QueueRequestEnum.IS_NOT_MEMBER]: boolean;
}

export type QueueRequestManagementPayload =
  | {
      [QueueRequestEnum.IS_NOT_MEMBER]: false;
      [QueueRequestEnum.COORDINATOR_ID]: number;
      [QueueRequestEnum.QUEUES]: QueueRequestDataProps[];
    }
  | {
      [QueueRequestEnum.IS_NOT_MEMBER]: true;
      [QueueRequestEnum.COORDINATOR_USER_DATA]: CoordinatorCreatePayload;
      [QueueRequestEnum.QUEUES]: QueueRequestDataProps[];
    };

export type RequestModeEnum = "newCoordinator" | "existedCoordinator";

export enum ScannedStatusEnum {
  Reject = "REJECT",
  Approve = "APPROVE",
  AlreadyRejected = "ALREADY_REJECTED",
  AlreadyApproved = "ALREADY_APPROVED",
}

export type BarcodeScanListType = {
  key?: number;
  serial_number: string;
  status?: ScannedStatusEnum;
  message?: string;
};

export type CreateGoodsResModel = {
  goods_id?: number;
  bucket_id: number;
  serial_number?: string;
  current_status?: ScannedStatusEnum;
  status?: ScannedStatusEnum;
  transaction_date?: string;
};

export type ConfirmationModalCtrlType = {
  open: boolean;
  serialNumber?: string;
};
