import Realm, { ObjectSchema } from 'realm';

export type ScaleServerType = {
  host: string;
  portGroup: string;
  portList: number[];
  currPortIdx: number;
};

export class ScaleServer extends Realm.Object<ScaleServer> {
  host!: string;
  portGroup!: string;
  portList!: number[];
  currPortIdx!: number;

  static schema: ObjectSchema = {
    name: 'ScaleServer',
    properties: {
      host: 'string',
      portGroup: 'string',
      portList: 'int[]',
      currPortIdx: 'int'
    }
  };
}
