import {
  GradingQueueData,
  GradingQueueDataStatus,
  GradingQueueReferenceData
} from '@sentadell-src/stores/realm/schemas/grading';
import { BarcodeSalesR } from '@sentadell-src/stores/realm/schemas/barcodeSales';

export enum GradingQueueEnum {
  BUCKETS = 'buckets'
}

// export interface gradingBucketData extends GradingQueueData;

export type GradingQueueProps = {
  [GradingQueueEnum.BUCKETS]: GradingQueueData[];
};

export type ClientBarcodeModel = {
  code_id: number;
  code: string;
  created_at: string;
  created_by_id: number;
  created_by_name: string;
};

export type ClientBarcodeGroupedByInitialModel = {
  initial: string;
  codes?: BarcodeSalesR[];
};

export type ClientBarcodeGroupModel = {
  key?: number;
  user_id: number;
  user_name: string;
  client_id: number;
  client_code: string;
  client_name: string;
  codes?: ClientBarcodeModel[];
  code_data?: ClientBarcodeGroupedByInitialModel[];
};

export type ClientBarcodeMode = {
  mode: 'GRADING' | 'BARCODE_SELLING_SYSTEM' | 'STOCK';
};

export type GradingQueueResModel =
  | {
      index: number;
      serial_number: string;
      sales_code: string;
      client_id: number;
      reference_data?: GradingQueueReferenceData;
      status: Exclude<GradingQueueDataStatus, 'UPDATED'>;
      message: string;
    }
  | {
      index: number;
      serial_number: string;
      sales_code: string;
      client_id: number;
      reference_data?: GradingQueueReferenceData;
      status: 'UPDATED';
      message: string;
      withBarcode?: boolean;
    };

export type StoredGraderType = {
  grader: 'Evan' | 'Jopie';
  exp: number;
};

export type SelectedGradeType = { id: string; index: number };
