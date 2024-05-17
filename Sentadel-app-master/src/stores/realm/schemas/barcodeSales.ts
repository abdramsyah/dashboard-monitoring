import Realm, { ObjectSchema } from 'realm';

export type barcodeSalesR = {
  code: string;
  status?: 'free' | 'used' | 'assigned';
  timestamp?: number;
};

export class BarcodeSalesR extends Realm.Object<BarcodeSalesR> {
  code!: string;
  status?: 'free' | 'used' | 'assigned';
  timestamp?: number = Math.round(new Date().getTime() / 1000);

  static schema: ObjectSchema = {
    name: 'BarcodeSalesR',
    properties: {
      code: { type: 'string' },
      status: { type: 'string' },
      timestampt: {
        type: 'int',
        default: () => Math.round(new Date().getTime() / 1000)
      }
    }
  };
}

export type clientBarcodeSalesR = {
  client_id: number;
  client_code: string;
  client_name: string;
  codes: BarcodeSalesR[];
};

export class ClientBarcodeSalesR extends Realm.Object<ClientBarcodeSalesR> {
  client_id!: number;
  client_code?: string;
  client_name?: string;
  codes!: BarcodeSalesR[];

  static schema: ObjectSchema = {
    name: 'ClientBarcodeSalesR',
    properties: {
      client_id: { type: 'int' },
      client_code: { type: 'string' },
      client_name: { type: 'string' },
      codes: { type: 'list', objectType: 'BarcodeSalesR' }
    }
    // primaryKey: 'client_id'
  };
}

export type barcodeSalesDaily = {
  _id: string;
  list?: ClientBarcodeSalesR[];
  timestamp?: number;
};

export class BarcodeSalesDaily extends Realm.Object<BarcodeSalesDaily> {
  _id!: string;
  list?: ClientBarcodeSalesR[];
  timestamp?: number = Math.round(new Date().getTime() / 1000);

  static schema: ObjectSchema = {
    name: 'BarcodeSalesDaily',
    properties: {
      _id: { type: 'string' },
      list: { type: 'list', objectType: 'ClientBarcodeSalesR' },
      timestampt: {
        type: 'int',
        default: () => Math.round(new Date().getTime() / 1000)
      }
    },
    primaryKey: '_id'
  };
}
