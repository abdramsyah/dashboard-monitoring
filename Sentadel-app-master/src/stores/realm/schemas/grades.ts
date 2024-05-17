import Realm, { ObjectSchema } from 'realm';

export class GradeStorageModel extends Realm.Object<GradeStorageModel> {
  model_id!: string;
  id!: number;
  grade!: string;
  price!: number;
  quota!: number;
  client_id!: number;
  client_sales_code_initial!: string;
  client_code!: string;
  client_name!: string;
  ub?: number;

  static schema: ObjectSchema = {
    name: 'GradeStorageModel',
    properties: {
      model_id: 'string',
      id: 'int',
      grade: 'string',
      price: 'int',
      quota: 'int',
      client_id: 'int',
      client_sales_code_initial: 'string',
      client_code: 'string',
      client_name: 'string',
      ub: 'int'
    },
    primaryKey: 'model_id'
  };
}

export class GradeStorage extends Realm.Object<GradeStorage> {
  _id!: string;
  grades?: GradeStorageModel[];
  timestamp?: number = Math.round(new Date().getTime() / 1000);

  static schema: ObjectSchema = {
    name: 'GradeStorage',
    properties: {
      _id: 'string',
      grades: 'GradeStorageModel[]',
      timestampt: {
        type: 'int',
        default: () => Math.round(new Date().getTime() / 1000)
      }
    },
    primaryKey: '_id'
  };
}
