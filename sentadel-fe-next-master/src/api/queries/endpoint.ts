export const API_VERSION = {
  V1: "/api/v1/one-gate",
};

const GROUP = {
  PARTNERSHIP: "/partnership",
  COORDINATOR: "/coordinator",
  LOAN_MANAGEMENT: "/loan-management",
  PURCHASE: "/purchase",
  INVOICE: "/invoice",
  STOCK: "/stock",
  GRADE_MANAGEMENT: "/grade-management",
  CLIENT_MANAGEMENT: "/client-management",
  BARCODE_SYSTEM: "/barcode-system",
  OPERATIONAL: "/operational",
  SALES: "/sales",
};

export const ENDPOINT = {
  // client management
  CLIENT_MANAGEMENT: `${API_VERSION.V1}${GROUP.CLIENT_MANAGEMENT}`,
  ADDRESS: `${API_VERSION.V1}${GROUP.CLIENT_MANAGEMENT}/address`,
  // partnership
  PARTNERSHIP: `${API_VERSION.V1}${GROUP.PARTNERSHIP}`,
  GET_GROUPED_PARTNER: `${API_VERSION.V1}${GROUP.PARTNERSHIP}/grouped`,
  COORDINATOR: `${API_VERSION.V1}${GROUP.COORDINATOR}`,
  LOAN_MANAGEMENT: `${API_VERSION.V1}${GROUP.LOAN_MANAGEMENT}`,
  // admin & coordinator - queue
  CREATE_QUEUE: `${API_VERSION.V1}/queue-request`,
  // admin Pembelian
  GET_GOODS_INFO: `${API_VERSION.V1}/operational/goods-info`,
  PAYMENT_MANAGEMENT: `${API_VERSION.V1}${GROUP.PURCHASE}/payment-management`,
  REPAYMENT: `${API_VERSION.V1}${GROUP.LOAN_MANAGEMENT}/repayment`,
  PENDING_VALIDATION: `${API_VERSION.V1}${GROUP.PURCHASE}/pending-validation`,
  // invoice
  INVOICE_MANAGEMENT: `${API_VERSION.V1}${GROUP.INVOICE}`,
  // stock
  STOCK_LIST: `${API_VERSION.V1}${GROUP.STOCK}/list`,
  GET_ALL_GRADE: `${API_VERSION.V1}${GROUP.GRADE_MANAGEMENT}/all`,
  GET_SALES_BARCODE: `${API_VERSION.V1}${GROUP.BARCODE_SYSTEM}`,
  STOCK_UPDATE_GRADE: `${API_VERSION.V1}${GROUP.STOCK}/list/grade-info`,
  STOCK_SUMMARY: `${API_VERSION.V1}${GROUP.STOCK}/summary`,
  // Sales
  GROUPING: `${API_VERSION.V1}${GROUP.SALES}/grouping`,
};
