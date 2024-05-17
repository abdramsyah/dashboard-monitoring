import { BucketData } from "./purchase";
import { AddNewRepaymentDataPayload } from "./loan-management";

export type InvoiceDetail = {
  invoice_id: number;
  invoice_number: string;
  delivery_number: string;
  invoice_date: string;
  coordinator_name: string;
  coordinator_code: string;
  bucket_quantity?: number;
  purchase_price_accum?: number;
  bucket_list?: BucketData[];
  loan_list?: LoanDataModel[];
  repayment_list?: RepaymentDataModel[];
  invoice_status_list?: InvoiceStatusListType[];
  tax_value?: number;
  fee_value?: number;
  tax_price?: number;
  fee_price?: number;
  repayment_accum?: number;
  invoiced_by?: string;
};

export type InvoiceStatusListType = {
  status?: InvoiceStatusType;
  status_date?: string;
};

export type LoanDataModel = {
  loan_id: number;
  reference_name: string;
  loan_code: string;
  loan_principal: number;
  loan_total: number;
  reference_type: "COORDINATOR" | "PARTNER";
  reference_id: number;
  purchase_price_accum: number;
  repayment_accum: number;
  quantity_bucket: number;
};

export type RepaymentDataModel = {
  loan_id: number;
  loan_code: string;
  reference_name: string;
  value: number;
};

export interface RepaymentListValue extends AddNewRepaymentDataPayload {
  reference_name: string;
  loan_code: string;
}

export type InvoiceStatusType =
  | "ON_PROGRESS"
  | "APPROVED"
  | "REJECTED"
  | "PRINTED"
  | "CONFIRMED_BY_COORDINATOR"
  | "NOT_YET_INVOICED";

export type ManageInvoiceStatusPayload = {
  invoice_id: number;
  status: InvoiceStatusType;
};
