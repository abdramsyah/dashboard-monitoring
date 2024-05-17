import { InvoiceStatusType } from "@/types/invoice";

export const invoiceStatusChipLabel: {
  [K in InvoiceStatusType]?: { label: string; color: string };
} = {
  ON_PROGRESS: {
    label: "Proses",
    color: "#0B2250",
  },
  APPROVED: {
    label: "Diterima",
    color: "#6796f7",
  },
  REJECTED: {
    label: "Ditolak",
    color: "#e03224",
  },
  PRINTED: {
    label: "Admin",
    color: "#58a571",
  },
  CONFIRMED_BY_COORDINATOR: {
    label: "Koordinator",
    color: "#58a571",
  },
};

export const latestInvoiceStatusID: {
  [K: string]: string;
} = {
  APPROVED: "Diterima",
  PRINTED: "Sudah dicetak",
};
