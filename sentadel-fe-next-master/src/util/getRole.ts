import { MenuDataType, RoleEnum } from "@/types/auth";

const getCSSRole = () => ({
  [RoleEnum.SUPERADMIN]: "superadmin",
  [RoleEnum.OPERATIONAL_ADMINISTRATOR]: "superadmin",
  [RoleEnum.COORDINATOR_ADMINISTRATOR]: "superadmin",
  [RoleEnum.PURCHASE_ADMINISTRATOR]: "superadmin",
  [RoleEnum.STOCK_ADMINISTRATOR]: "superadmin",
  [RoleEnum.SALES_ADMINISTRATOR]: "superadmin",
  [RoleEnum.ACCOUNTING_ADMINISTRATOR]: "superadmin",
  [RoleEnum.GENERAL]: "superadmin",
  [RoleEnum.REMUNERATION_ADMINISTRATOR]: "superadmin",
  [RoleEnum.COORDINATOR]: "superadmin",
  // [RoleEnum.COORDINATOR]: "coordinator",
  // [RoleEnum.OWNER]: "owner",
  // [RoleEnum.ADMINISTRATOR_SUPPLY_CHAIN]: "supply-chain",
  // [RoleEnum.ADMINISTRATOR_SUPPLY_ENTRY]: "supply-entry",
  // [RoleEnum.ADMINISTRATOR_SALES]: 'sales',
  // [RoleEnum.ADMINISTRATOR_PAYMENT]: 'payment',
  // [RoleEnum.ADMINISTRATOR_PURCHASING]: 'purchasing',
});

const getNavigate = (role: string, menuData?: MenuDataType) => {
  const selectedMenu = menuData && menuData[role as RoleEnum];

  console.log("asdad - selectedMenu", role, menuData, selectedMenu);
  if (selectedMenu) {
    const pathRoute = selectedMenu[0]?.module_path;
    if (pathRoute) return pathRoute;
  }

  return "/";
};

export { getCSSRole, getNavigate };
