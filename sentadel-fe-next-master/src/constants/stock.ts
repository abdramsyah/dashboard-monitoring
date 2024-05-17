import { ChipSelectorOption } from "@/components/ChipSelector";
import { InvoiceStatusType } from "@/types/invoice";
import { GetStockListNewParams } from "@/types/stock";

export const invoiceStatusOptions: ChipSelectorOption[] = [
  {
    label: "Dalam Proses",
    value: "ON_PROGRESS",
    selected: false,
  },
  {
    label: "Selesai",
    value: "FINISHED",
    selected: false,
  },
  {
    label: "Belum Diinvoice",
    value: "NOT_YET_INVOICED",
    selected: false,
  },
];

export type invoiceStatusSimplifiedKey =
  | "ON_PROGRESS"
  | "FINISHED"
  | "NOT_YET_INVOICED";

export const invoiceStatusSimplified: {
  [K in invoiceStatusSimplifiedKey]: InvoiceStatusType[];
} = {
  ON_PROGRESS: ["APPROVED", "ON_PROGRESS"],
  FINISHED: ["PRINTED", "CONFIRMED_BY_COORDINATOR"],
  NOT_YET_INVOICED: ["NOT_YET_INVOICED"],
};

export const goodsStatusOptions: ChipSelectorOption[] = [
  {
    label: "Dalam Proses",
    value: "ON_PROGRESS",
    selected: false,
  },
  {
    label: "Menunggu",
    value: "WAITING_TO_VALIDATE",
    selected: false,
  },
  {
    label: "Validasi",
    value: "VALIDATED",
    selected: false,
  },
  {
    label: "Ditolak",
    value: "REJECTED",
    selected: false,
  },
  {
    label: "Ditolak (Gul)",
    value: "REJECTED_BY_GROUPING",
    selected: false,
  },
];
