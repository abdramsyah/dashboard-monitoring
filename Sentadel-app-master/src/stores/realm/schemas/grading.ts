import Realm, { ObjectSchema } from 'realm';
import { GradeStorageModel } from './grades';
import { BarcodeSalesR } from './barcodeSales';

export class GradingQueueReferenceData extends Realm.Object<GradingQueueReferenceData> {
  serial_number?: string;
  grader_name?: string;
  grade?: string;
  unit_price?: number;
  grade_price?: number;
  sales_code?: string;

  static schema: ObjectSchema = {
    name: 'GradingQueueReferenceData',
    properties: {
      serial_number: 'string?',
      grader_name: 'string?',
      grade: 'string?',
      unit_price: 'int?',
      grade_price: 'int?',
      sales_code: 'string?'
    }
  };
}

export type GradingQueueDataStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'ON_PROGRESS'
  | 'VALIDATED'
  | 'USED'
  | 'UPDATED'
  | 'CREATED';

export class GradingQueueData extends Realm.Object<GradingQueueData> {
  index?: number;
  serial_number?: string;
  grade_data?: GradeStorageModel;
  unit_price?: string;
  grader_name?: string;
  sales_code?: string;
  sales_code_data?: BarcodeSalesR;
  reference_data?: GradingQueueReferenceData;
  status!: GradingQueueDataStatus;
  message!: string;

  static schema: ObjectSchema = {
    name: 'GradingQueueData',
    properties: {
      index: { type: 'int', default: -1 },
      serial_number: 'string',
      grade_data: 'GradeStorageModel',
      unit_price: 'string',
      grader_name: 'string',
      sales_code: { type: 'string', default: '' },
      sales_code_data: 'BarcodeSalesR',
      reference_data: 'GradingQueueReferenceData?',
      status: { type: 'string', default: 'ON_PROGRESS' },
      message: { type: 'string', default: '' }
    }
  };
}
