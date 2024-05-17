export const API_VERSION = {
  V1: '/api/v1/one-gate'
};

const GROUP = {
  PARTNERSHIP: '/partnership',
  COORDINATOR: '/coordinator',
  LOAN_MANAGEMENT: '/loan-management',
  PURCHASE: '/purchase',
  INVOICE: '/invoice',
  BARCODE_SYSTEM: '/barcode-system',
  QUEUE_REQUEST: '/queue-request',
  OPERATIONAL: '/operational',
  GRADE_MANAGEMENT: '/grade-management',
  CLIENT_MANAGEMENT: '/client-management'
};

export const ENDPOINT = {
  //auth
  LOGIN: `${API_VERSION.V1}/auth/login`,
  // Operational - pour out
  POUR_OUT: `${API_VERSION.V1}${GROUP.QUEUE_REQUEST}/pour-out`,
  GET_BARCODE_DETAIL: `${API_VERSION.V1}${GROUP.QUEUE_REQUEST}/bucket`,
  // Operational - grading
  GET_SALES_BARCODE: `${API_VERSION.V1}${GROUP.BARCODE_SYSTEM}`,
  GET_ALL_GRADE: `${API_VERSION.V1}${GROUP.GRADE_MANAGEMENT}/all`,
  GRADING: `${API_VERSION.V1}${GROUP.OPERATIONAL}/grading`,
  GET_GOODS_INFO: `${API_VERSION.V1}${GROUP.OPERATIONAL}/goods-info`,
  // Operational - weigh
  SET_WEIGHT: `${API_VERSION.V1}${GROUP.OPERATIONAL}/weigh-info`,
  // Operational - grouping
  GROUPING: `${API_VERSION.V1}${GROUP.OPERATIONAL}/grouping`,
  // Operational - shipment
  GET_CLIENTS: `${API_VERSION.V1}${GROUP.CLIENT_MANAGEMENT}`,
  // Coordinator - queue
  PARTNERSHIP: `${API_VERSION.V1}${GROUP.PARTNERSHIP}`,
  QUEUE_GROUP: `${API_VERSION.V1}${GROUP.QUEUE_REQUEST}/group`,
  QUEUE_GROUP_DETAIL: `${API_VERSION.V1}${GROUP.QUEUE_REQUEST}/group-detail`,
  CREATE_QUEUE: `${API_VERSION.V1}${GROUP.QUEUE_REQUEST}`,
  // Coordinator - invoice
  INVOICE_MANAGEMENT: `${API_VERSION.V1}${GROUP.INVOICE}`
};
