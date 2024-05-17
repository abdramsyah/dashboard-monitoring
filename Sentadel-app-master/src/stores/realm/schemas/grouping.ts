import Realm, { ObjectSchema } from 'realm';

type GropuingQueueGoodsDataStatus =
  | 'NOT_YET_POURED_OUT'
  | 'NOT_YET_GRADED'
  | 'NOT_YET_WEIGHED'
  | 'READY'
  | 'GROUPED_ALREADY';

export class GropuingQueueGoodsData extends Realm.Object<GropuingQueueGoodsData> {
  index?: number;
  grouping_list_id?: number;
  shipment_goods_id?: number;
  goods_id?: number;
  grade_info_id?: number;
  weight_info_id?: number;
  serial_number?: string;
  sales_code?: string;
  djarum_grade?: string;
  product_type?: string;
  farmer_name?: string;
  coordinator_name?: string;
  client_id?: number;
  client_name?: string;
  client_code?: string;
  grade?: string;
  ub?: number;
  grader?: string;
  grading_date?: string;
  grading_by?: string;
  grouping_number?: string;
  grouping_date?: string;
  grouping_by?: string;
  status?: GropuingQueueGoodsDataStatus;

  static schema: ObjectSchema = {
    name: 'GropuingQueueGoodsData',
    properties: {
      index: 'int?',
      grouping_list_id: 'int?',
      shipment_goods_id: 'int?',
      goods_id: 'int?',
      grade_info_id: 'int?',
      weight_info_id: 'int?',
      serial_number: 'string?',
      sales_code: 'string?',
      djarum_grade: 'string?',
      product_type: 'string?',
      farmer_name: 'string?',
      coordinator_name: 'string?',
      client_id: 'int?',
      client_name: 'string?',
      client_code: 'string?',
      grade: 'string?',
      ub: 'int?',
      grader: 'string?',
      grading_date: 'string?',
      grading_by: 'string?',
      grouping_number: 'string?',
      grouping_date: 'string?',
      grouping_by: 'string?',
      status: 'string?'
    }
  };
}

export class GroupingQueueData extends Realm.Object<GroupingQueueData> {
  _id!: string;
  grouping_id?: number;
  grouping_number?: string;
  grouping_client_number?: string;
  client_id?: string;
  client_code?: string;
  bucket_total?: string;
  client_net_weight_total?: string;
  grouping_list?: GropuingQueueGoodsData[];
  message?: string;

  static schema: ObjectSchema = {
    name: 'GroupingQueueData',
    properties: {
      _id: 'string',
      grouping_id: 'int?',
      grouping_number: 'string?',
      grouping_client_number: 'string?',
      client_id: 'int?',
      client_code: 'string?',
      grouping_list: {
        type: 'list',
        objectType: 'GropuingQueueGoodsData',
        default: []
      },
      message: { type: 'string', default: '' }
    },
    primaryKey: '_id'
  };
}
