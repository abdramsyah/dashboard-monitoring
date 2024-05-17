import Realm, { ObjectSchema } from 'realm';

export class PartnerModelR extends Realm.Object<PartnerModelR> {
  partner_id!: number;
  partner_name!: string;
  partner_quota!: number;
  coordinator_id?: number;
  coordinator_name?: string;
  coordinator_code?: string;

  static schema: ObjectSchema = {
    name: 'PartnerModelR',
    properties: {
      partner_id: { type: 'int' },
      partner_name: { type: 'string' },
      partner_quota: { type: 'int' },
      coordinator_id: { type: 'int' },
      coordinator_name: { type: 'string' },
      coordinator_code: { type: 'string' }
    },
    primaryKey: 'partner_id'
  };
}
