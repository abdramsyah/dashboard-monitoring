export enum PartnershipRequestEnum {
  PARTNER_ID = "partner_id",
  NAME = "name",
  QUOTA = "quota",
  COORDINATOR_ID = "coordinator_id",
}

export type PartnershipFormProps = {
  [PartnershipRequestEnum.PARTNER_ID]?: number;
  [PartnershipRequestEnum.NAME]?: string;
  [PartnershipRequestEnum.QUOTA]?: number;
  [PartnershipRequestEnum.COORDINATOR_ID]?: number;
};

export type PartnerModel = {
  partner_id: number;
  partner_name: string;
  partner_quota: number;
  coordinator_id?: number;
  coordinator_name?: string;
  coordinator_code?: string;
};

export type GroupedPartnerModel = {
  key?: number;
  coordinator_id: number;
  coordinator_name: string;
  coordinator_code: string;
  partner_data: PartnerModel[];
};
