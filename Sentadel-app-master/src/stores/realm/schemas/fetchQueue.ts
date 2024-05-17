import Realm, { ObjectSchema } from 'realm';
import { GradingQueueData } from './grading';
import { GroupingQueueData } from './grouping';
import { ShipmentQueueData } from './shipment';

export type FetchQueueStatus =
  | 'COMPLETED'
  | 'QUEUED'
  | 'PAUSED'
  | 'ON_PROGRESS';

export type FetchQueueType =
  | 'GRADING'
  | 'GRADING_UPDATE'
  | 'GROUPING'
  | 'SHIPMENT'
  | 'RECLASS';

class FetchQueue extends Realm.Object<FetchQueue> {
  _id!: string;
  type!: FetchQueueType;
  gradingData?: GradingQueueData[];
  groupingData?: GroupingQueueData;
  shipmentData?: ShipmentQueueData;
  status!: FetchQueueStatus;
  trx_timestamp: number = Math.round(new Date().getTime() / 1000);

  static schema: ObjectSchema = {
    name: 'FetchQueue',
    properties: {
      _id: 'string',
      type: 'string',
      gradingData: {
        type: 'list',
        objectType: 'GradingQueueData',
        default: []
      },
      groupingData: 'GroupingQueueData?',
      shipmentData: 'ShipmentQueueData?',
      status: 'string',
      trx_timestamp: {
        type: 'int',
        default: () => Math.round(new Date().getTime() / 1000)
      }
    },
    primaryKey: '_id'
  };
}

export { FetchQueue };
