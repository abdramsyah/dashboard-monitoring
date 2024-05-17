export type UsersDataType = {
  id: number;
  email?: string;
  username?: string;
  name?: string;
  phone_number?: string;
  photo?: string;
  token?: string;
};

export type DecodedTokenType = {
  exp: number;
  name: string;
  rolesModules: RoleModulesType[];
  userId: number;
};

export type ModuleType = {
  module_id: number;
  module_name: ModuleEnum;
  module_description: string;
  read_only: boolean;
};

export type RoleModulesType = {
  role_id: number;
  role_name: RoleEnum;
  role_description: string;
  modules: ModuleType[];
};

export enum ModuleEnum {
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  CLIENT_MANAGEMENT = 'CLIENT_MANAGEMENT',
  GRADE_MANAGEMENT = 'GRADE_MANAGEMENT',
  COORDINATOR_MANAGEMENT = 'COORDINATOR_MANAGEMENT',
  SUPPLY_POWER_MANAGEMENT = 'SUPPLY_POWER_MANAGEMENT',
  COORDINATOR_PERFORMANCE = 'COORDINATOR_PERFORMANCE',
  UNIQUE_CODE = 'UNIQUE_CODE',
  TAX_AND_FEE = 'TAX_AND_FEE',
  POUR_OUT = 'POUR_OUT',
  GRADING = 'GRADING',
  WEIGH = 'WEIGH',
  GROUPING = 'GROUPING',
  SHIPMENT = 'SHIPMENT',
  QUEUE_MANAGEMENT = 'QUEUE_MANAGEMENT',
  QUEUE_HISTORY = 'QUEUE_HISTORY',
  BARCODE_SELLING_SYSTEM = 'BARCODE_SELLING_SYSTEM',
  PAYMENT_MANAGEMENT = 'PAYMENT_MANAGEMENT',
  STOCK_SUMMARY = 'STOCK_SUMMARY',
  GOODS_TABLE = 'GOODS_TABLE',
  GROUPING_MANAGEMENT = 'GROUPING_MANAGEMENT',
  INVOICE_APPROVAL = 'INVOICE_APPROVAL',
  SELL_BUY_DIFFERENCES = 'SELL_BUY_DIFFERENCES',
  INFORMATION_CHECKER = 'INFORMATION_CHECKER',
  EMPLOYEE_MANAGEMENT = 'EMPLOYEE_MANAGEMENT',
  PRESENCE = 'PRESENCE',
  QUEUE_REQUEST = 'QUEUE_REQUEST',
  COORDINATOR_INVOICE = 'COORDINATOR_INVOICE'
}

export type UserRoleType = {
  exp: number;
  name: string;
  permissions: string[];
  roles: RoleEnum[];
  userId: number;
};

export enum RoleEnum {
  SUPERADMIN = 'SUPERADMIN',
  OPERATIONAL_ADMINISTRATOR = 'OPERATIONAL_ADMINISTRATOR',
  COORDINATOR_ADMINISTRATOR = 'COORDINATOR_ADMINISTRATOR',
  PURCHASE_ADMINISTRATOR = 'PURCHASE_ADMINISTRATOR',
  STOCK_ADMINISTRATOR = 'STOCK_ADMINISTRATOR',
  SALES_ADMINISTRATOR = 'SALES_ADMINISTRATOR',
  ACCOUNTING_ADMINISTRATOR = 'ACCOUNTING_ADMINISTRATOR',
  GENERAL = 'GENERAL',
  REMUNERATION_ADMINISTRATOR = 'REMUNERATION_ADMINISTRATOR',
  COORDINATOR = 'COORDINATOR'
}
export type LoginPayloadType = {
  username: string;
  password: string;
  is_mobile: true;
  message?: string;
};
