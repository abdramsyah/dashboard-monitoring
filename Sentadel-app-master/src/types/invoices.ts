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
  invoice_status_list?: InvoiceStatusModel[];
  tax_value?: number;
  fee_value?: number;
  tax_price?: number;
  fee_price?: number;
  repayment_accum?: number;
  invoiced_by?: string;
};

export type InvoiceStatusType =
  | 'ON_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'PRINTED'
  | 'CONFIRMED_BY_COORDINATOR';

export type InvoiceStatusModel = {
  status: InvoiceStatusType;
  status_date: string;
};

export type BucketData = {
  goods_id: number;
  farmer_name: string;
  partner_id: number;
  product_type: string;
  serial_number: string;
  sales_code: string;
  client_name: string;
  client_company: 'LAMPION' | 'LENTERA';
  client_code: string;
  grade_info_id: number;
  grade: string;
  unit_price: number;
  grade_price: number;
  weight_info_id: number;
  gross_weight: number;
  purchase_id?: number;
  purchase_gross_weight: number;
  purchase_net_weight: number;
  grade_information_excl_id?: number[];
  weight_information_excl_id?: number[];
  status?: string;
  invoice_id?: number;
  invoice_number?: string;
  purchase_price?: number;
  status_list?: InvoiceStatusModel[];
};

export type LoanDataModel = {
  loan_id: number;
  reference_name: string;
  loan_code: string;
  loan_principal: number;
  loan_total: number;
  reference_type: 'COORDINATOR' | 'PARTNER';
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
