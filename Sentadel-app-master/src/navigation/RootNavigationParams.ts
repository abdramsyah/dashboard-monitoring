import { QueueGroupModel } from '@sentadell-src/types/queue';

export enum routes {
  SPLASH_SCREEN = 'SPLASH_SCREEN',
  LOGIN_SCREEN = 'LOGIN_SCREEN',
  COORDINATOR_QUEUE_REQUEST_TABLE = 'QUEUE_REQUEST_TABLE',
  COORDINATOR_QUEUE_REQUEST_FORM = 'QUEUE_REQUEST_FORM',
  COORDINATOR_QUEUE_REQUEST_DETAIL = 'QUEUE_REQUEST_DETAIL',
  COORDINATOR_INVOICE_LIST = 'COORDINATOR_INVOICE_LIST',
  COORDINATOR_INVOICE_DETAIL = 'COORDINATOR_INVOICE_DETAIL',
  OPERATIONAL_POUR_OUT = 'POUR_OUT',
  OPERATIONAL_POUR_OUT_SCANNER = 'POUR_OUT_SCANNER',
  OPERATIONAL_GRADING = 'GRADING',
  OPERATIONAL_GRADING_SCAN = 'GRADING_SCAN',
  OPERATIONAL_WEIGH = 'WEIGH',
  OPERATIONAL_WEIGH_SCAN = 'WEIGH_SCAN',
  OPERATIONAL_FETCH_QUEUE = 'OPERATIONAL_FETCH_QUEUE',
  OPERATIONAL_GROUPING = 'OPERATIONAL_GROUPING',
  OPERATIONAL_GROUPING_SCAN = 'OPERATIONAL_GROUPING_SCAN',
  OPERATIONAL_GROUPING_DETAIL = 'OPERATIONAL_GROUPING_DETAIL',
  OPERATIONAL_SHIPMENT = 'OPERATIONAL_SHIPMENT',
  OPERATIONAL_SHIPMENT_SCAN = 'OPERATIONAL_SHIPMENT_SCAN',
  OPERATIONAL_SHIPMENT_DETAIL = 'OPERATIONAL_SHIPMENT_DETAIL'
  // OPERATIONAL_SCANNER = 'SCANNER'
}

export type RootNavigationParams = {
  [routes.SPLASH_SCREEN]: undefined;
  [routes.LOGIN_SCREEN]: undefined;
  [routes.COORDINATOR_QUEUE_REQUEST_TABLE]: { title?: string };
  [routes.COORDINATOR_QUEUE_REQUEST_FORM]?: { title?: string };
  [routes.COORDINATOR_QUEUE_REQUEST_DETAIL]?: {
    title?: string;
    data?: QueueGroupModel;
  };
  [routes.COORDINATOR_INVOICE_LIST]?: { title?: string };
  [routes.COORDINATOR_INVOICE_DETAIL]: { invoiceNumber: string };
  [routes.OPERATIONAL_POUR_OUT]: { title?: string };
  [routes.OPERATIONAL_POUR_OUT_SCANNER]: undefined;
  [routes.OPERATIONAL_GRADING]: { title?: string };
  [routes.OPERATIONAL_GRADING_SCAN]: undefined;
  [routes.OPERATIONAL_WEIGH]: { title?: string };
  [routes.OPERATIONAL_WEIGH_SCAN]: undefined;
  [routes.OPERATIONAL_FETCH_QUEUE]: undefined;
  [routes.OPERATIONAL_GROUPING]: { title?: string };
  [routes.OPERATIONAL_GROUPING_SCAN]?: { fetchQueueId?: string };
  [routes.OPERATIONAL_GROUPING_DETAIL]:
    | { groupingId: number; groupingNumber?: undefined }
    | { groupingId?: undefined; groupingNumber: string };
  [routes.OPERATIONAL_SHIPMENT]?: { title?: string };
  [routes.OPERATIONAL_SHIPMENT_SCAN]?: { fetchQueueId?: string };
  [routes.OPERATIONAL_SHIPMENT_DETAIL]?:
    | { shipmentId: number; shipmentNumber?: undefined }
    | { shipmentId?: undefined; shipmentNumber: string };
};
