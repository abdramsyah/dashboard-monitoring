export enum LoanManagementRequestEnum {
  LOAN_ID = "id",
  LOAN_PRINCIPAL = "loan_principal",
  TOTAL = "total",
  REFERENCE_TYPE = "reference_type",
  REFERENCE_ID = "reference_id",
  DESCRIPTION = "description",
}

export enum LOAN_REFERENCE_TYPE_ENUM {
  COORDINATOR = "COORDINATOR",
  PARTNER = "PARTNER",
}

export type LoanManagementFormProps = {
  [LoanManagementRequestEnum.LOAN_ID]?: number;
  [LoanManagementRequestEnum.LOAN_PRINCIPAL]?: number;
  [LoanManagementRequestEnum.TOTAL]?: number;
  [LoanManagementRequestEnum.REFERENCE_TYPE]?: LOAN_REFERENCE_TYPE_ENUM;
  [LoanManagementRequestEnum.REFERENCE_ID]?: number;
  [LoanManagementRequestEnum.DESCRIPTION]?: string;
};

export type LoanModel = {
  id: number;
  code: string;
  loan_principal: number;
  total: number;
  reference_type: LOAN_REFERENCE_TYPE_ENUM;
  reference_id: number;
  reference_name: string;
  coordinator_code: string;
  coordinator_name?: string;
  description?: string;
  created_at: string;
  created_by: string;
};

export type AddNewRepaymentDataPayload = {
  loan_id: number;
  value: number;
  description: string;
};

export type AddNewRepaymentPayload = {
  data: AddNewRepaymentDataPayload[];
  invoice_id?: number;
};
