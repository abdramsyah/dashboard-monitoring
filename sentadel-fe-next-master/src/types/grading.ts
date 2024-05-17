import { GradeModel } from "./grades";

export type GradingQueueDataStatus =
  | "SUCCESS"
  | "FAILED"
  | "ON_PROGRESS"
  | "VALIDATED"
  | "USED"
  | "UPDATED"
  | "CREATED";

export type GradingQueueData = {
  index?: number;
  serial_number?: string;
  grade_data?: GradeModel;
  unit_price?: string;
  grader_name?: string;
  sales_code?: string;
  // sales_code_data?: BarcodeSalesR;
  reference_data?: GradingQueueReferenceData;
  status?: GradingQueueDataStatus;
  message?: string;
};

export type GradingQueueReferenceData = {
  serial_number?: string;
  grader_name?: string;
  grade?: string;
  unit_price?: number;
  grade_price?: number;
  sales_code?: string;
};

export type GradingQueueResModel =
  | {
      index: number;
      serial_number: string;
      sales_code: string;
      client_id: number;
      reference_data?: GradingQueueReferenceData;
      status: Exclude<GradingQueueDataStatus, "UPDATED">;
      message: string;
    }
  | {
      index: number;
      serial_number: string;
      sales_code: string;
      client_id: number;
      reference_data?: GradingQueueReferenceData;
      status: "UPDATED";
      message: string;
      withBarcode?: boolean;
    };
