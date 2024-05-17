import { ChipSelectorOption } from "@/components/ChipSelector";
import { BarcodeSellingPayloadEnum } from "@/types/barcodeSystem";
import { ClientModel } from "@/types/clients";
import { ReactFormType } from "@/types/reactForm";
import { UserManagementModel } from "@/types/users";

type BarcodeSellingFormData = {
  [BarcodeSellingPayloadEnum.ASSIGNEE_ID]: UserManagementModel[];
  [BarcodeSellingPayloadEnum.CLIENT_ID]: ClientModel[];
};

export const barcodeSellingFormList: (
  dataList: BarcodeSellingFormData
) => ReactFormType<BarcodeSellingPayloadEnum>[] = (data) => [
  {
    name: BarcodeSellingPayloadEnum.ASSIGNEE_ID,
    formType: {
      type: "select",
      label: "Pilih Admin Operasional (Grade)",
      selectData: data[BarcodeSellingPayloadEnum.ASSIGNEE_ID],
      customLabel: {
        separator: " - ",
        keyList: ["number_id", "name"],
      },
    },
    rules: { required: "Admin tidak boleh kosong" },
  },
  {
    name: BarcodeSellingPayloadEnum.CLIENT_ID,
    formType: {
      type: "select",
      label: "Pilih Client",
      selectData: data[BarcodeSellingPayloadEnum.CLIENT_ID],
      customLabel: {
        keyList: ["client_name"],
      },
    },
    rules: { required: "Client tidak boleh kosong" },
  },
  {
    name: BarcodeSellingPayloadEnum.QUANTITY,
    formType: {
      type: "input",
      label: "Jumlah yang ingin dibuat",
      reactInputType: "number",
    },
    rules: {
      required: "Kuantitas harus lebih dari 0",
      min: {
        value: 1,
        message: "Kuantitas harus lebih dari 0",
      },
    },
  },
];
