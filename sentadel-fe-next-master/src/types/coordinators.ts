import { RoleEnum } from "./auth";
import { UserModelRequestEnum, UserModelRequestProps } from "./users";

export type CoordinatorManagementModel = {
  id: number;
  user_id: number;
  name: string;
  quota: number;
  code: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export enum CoordinatorModelRequestEnum {
  ID = "id",
  QUOTA = "quota",
  CODE = "code",
}

export interface CoordinatorModelRequestProps
  extends Omit<
    UserModelRequestProps,
    UserModelRequestEnum.ID | UserModelRequestEnum.ROLES | RoleEnum
  > {
  [CoordinatorModelRequestEnum.ID]?: string | number;
  [CoordinatorModelRequestEnum.QUOTA]?: string;
  [CoordinatorModelRequestEnum.CODE]: string;
}

export type CoordinatorManagementPayload =
  | {
      isEditMode: true;
      data: CoordinatorEditPayload;
    }
  | {
      isEditMode: false;
      data: CoordinatorCreatePayload;
    };

export type CoordinatorCreatePayload = {
  user_param: {
    [UserModelRequestEnum.NAME]: string;
    phone_number: string;
    [UserModelRequestEnum.USERNAME]: string;
    [UserModelRequestEnum.PASSWORD]: string;
    [UserModelRequestEnum.ROLES]: number[];
    modules: number[];
    email: string;
  };
  coordinator_param: {
    [CoordinatorModelRequestEnum.CODE]: string;
    [CoordinatorModelRequestEnum.QUOTA]: number;
  };
};

type CoordinatorEditPayload = {
  coordinator_param: {
    [CoordinatorModelRequestEnum.ID]: string | number;
    [CoordinatorModelRequestEnum.CODE]: string;
    [CoordinatorModelRequestEnum.QUOTA]: number;
  };
};
