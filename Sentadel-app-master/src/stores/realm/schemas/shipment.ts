import Realm, { ObjectSchema } from 'realm';
import { GropuingQueueGoodsData, GroupingQueueData } from './grouping';

type ShipmentQueueType = 'GROUPING' | 'GOODS';

export class ShipmentQueueData extends Realm.Object<ShipmentQueueData> {
  _id!: string;
  shipment_id?: number;
  shipment_number?: string;
  shipment_client_number?: string;
  shipment_type?: ShipmentQueueType;
  client_id?: number;
  client_code?: string;
  address_id?: number;
  address_text?: string;
  license_plate?: string;
  driver?: string;
  pic?: string;
  grouping_data_list?: GroupingQueueData[];
  goods_data_list?: GropuingQueueGoodsData[];

  static schema: ObjectSchema = {
    name: 'ShipmentQueueData',
    properties: {
      _id: 'string',
      shipment_id: 'int?',
      shipment_number: 'string?',
      shipment_client_number: 'string?',
      shipment_type: 'string?',
      client_id: 'int?',
      client_code: 'string?',
      address_id: 'int?',
      address_text: 'string?',
      license_plate: 'string?',
      driver: 'string?',
      pic: 'string?',
      grouping_data_list: {
        type: 'list',
        objectType: 'GroupingQueueData',
        default: []
      },
      goods_data_list: {
        type: 'list',
        objectType: 'GropuingQueueGoodsData',
        default: []
      }
    },
    primaryKey: '_id'
  };
}
