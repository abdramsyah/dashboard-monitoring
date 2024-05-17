import { ModuleEnum } from "@/types/auth";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import queueRequestIcon from "@/assets/svg/sidebar/queue_icon.svg";
import usergroupAddOutlined from "@/assets/svg/sidebar/user_group_add_outlined.svg";
import gradeOutlined from "@/assets/svg/sidebar/grade.svg";
import taxAndFee from "@/assets/svg/sidebar/tax-fee.svg";
import performance from "@/assets/svg/sidebar/performance.svg";
import unlock from "@/assets/svg/sidebar/unlock.svg";
import supply from "@/assets/svg/sidebar/supply.svg";
import barcodePrinterIcon from "@/assets/svg/sidebar/barcode-printer.svg";

export const moduleDataOption: {
  [K in ModuleEnum]?: {
    module_path: string;
    module_icon: string | StaticImport;
  };
} = {
  [ModuleEnum.CLIENT_MANAGEMENT]: {
    module_path: "/client-management",
    module_icon: usergroupAddOutlined,
  },
  [ModuleEnum.USER_MANAGEMENT]: {
    module_path: "/user-management",
    module_icon: usergroupAddOutlined,
  },
  [ModuleEnum.GRADE_MANAGEMENT]: {
    module_path: "/grade-management",
    module_icon: gradeOutlined,
  },
  [ModuleEnum.COORDINATOR_MANAGEMENT]: {
    module_path: "/coordinator-management",
    module_icon: usergroupAddOutlined,
  },
  [ModuleEnum.PARTNERSHIP_MANAGEMENT]: {
    module_path: "/partnership-management",
    module_icon: usergroupAddOutlined,
  },
  [ModuleEnum.LOAN_MANAGEMENT]: {
    module_path: "/loan-management",
    module_icon: usergroupAddOutlined,
  },
  [ModuleEnum.SUPPLY_POWER_MANAGEMENT]: {
    module_path: "/supply-power-management",
    module_icon: supply,
  },
  [ModuleEnum.COORDINATOR_PERFORMANCE]: {
    module_path: "/coordinator-performance",
    module_icon: performance,
  },
  [ModuleEnum.UNIQUE_CODE]: {
    module_path: "/unique-code",
    module_icon: unlock,
  },
  [ModuleEnum.TAX_AND_FEE]: {
    module_path: "/tax-and-fee",
    module_icon: taxAndFee,
  },
  [ModuleEnum.QUEUE_REQUEST]: {
    module_path: "/queue-request",
    module_icon: queueRequestIcon,
  },
  [ModuleEnum.COORDINATOR_INVOICE]: {
    module_path: "/coordinator-invoice",
    module_icon: queueRequestIcon,
  },
  [ModuleEnum.QUEUE_MANAGEMENT]: {
    module_path: "/queue-management",
    module_icon: queueRequestIcon,
  },
  [ModuleEnum.QUEUE_HISTORY]: {
    module_path: "/queue-history",
    module_icon: queueRequestIcon,
  },
  [ModuleEnum.BARCODE_SELLING_SYSTEM]: {
    module_path: "/barcode-selling-system",
    module_icon: barcodePrinterIcon,
  },
  [ModuleEnum.PAYMENT_MANAGEMENT]: {
    module_path: "/purchase-payment-management",
    module_icon: queueRequestIcon,
  },
  [ModuleEnum.PENDING_VALIDATION]: {
    module_path: "/purchase-pending-validation",
    module_icon: barcodePrinterIcon,
  },
  [ModuleEnum.INVOICE_APPROVAL]: {
    module_path: "/accounting-invoice-approval",
    module_icon: barcodePrinterIcon,
  },
  [ModuleEnum.GOODS_TABLE]: {
    module_path: "/stock-goods-list",
    module_icon: barcodePrinterIcon,
  },
  [ModuleEnum.STOCK_SUMMARY]: {
    module_path: "/stock-summary",
    module_icon: barcodePrinterIcon,
  },
  [ModuleEnum.GROUPING_MANAGEMENT]: {
    module_path: "/sales-grouping-management",
    module_icon: barcodePrinterIcon,
  },
};
