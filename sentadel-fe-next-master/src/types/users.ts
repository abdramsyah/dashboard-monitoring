import { ChipSelectorOption } from "@/components/ChipSelector";
import { ModuleType, RoleEnum, RoleModulesType } from "./auth";

export enum UserModelRequestEnum {
  ID = "id",
  NAME = "name",
  PHONE_NUMBER = "phoneNumber",
  ROLES = "roles",
  USERNAME = "username",
  PASSWORD = "password",
}

export type UserModelRequestProps = {
  [UserModelRequestEnum.ID]?: number;
  [UserModelRequestEnum.NAME]: string;
  [UserModelRequestEnum.PHONE_NUMBER]: string;
  [UserModelRequestEnum.ROLES]: ChipSelectorOption[];
  [RoleEnum.ACCOUNTING_ADMINISTRATOR]?: ChipSelectorOption[];
  [RoleEnum.COORDINATOR]?: ChipSelectorOption[];
  [RoleEnum.COORDINATOR_ADMINISTRATOR]?: ChipSelectorOption[];
  [RoleEnum.GENERAL]?: ChipSelectorOption[];
  [RoleEnum.OPERATIONAL_ADMINISTRATOR]?: ChipSelectorOption[];
  [RoleEnum.PURCHASE_ADMINISTRATOR]?: ChipSelectorOption[];
  [RoleEnum.REMUNERATION_ADMINISTRATOR]?: ChipSelectorOption[];
  [RoleEnum.SALES_ADMINISTRATOR]?: ChipSelectorOption[];
  [RoleEnum.STOCK_ADMINISTRATOR]?: ChipSelectorOption[];
  [RoleEnum.SUPERADMIN]?: ChipSelectorOption[];
  [UserModelRequestEnum.USERNAME]: string;
  [UserModelRequestEnum.PASSWORD]: string;
};

export type UserManagementModel = {
  id: number;
  number_id: string;
  name: string;
  email: string;
  phone_number: string;
  username: string;
  photo: string;
  roles: Omit<RoleModulesType, "modules">[];
  modules: ModuleType[];
  status: string;
  created_at: string;
  updated_at: string;
};
