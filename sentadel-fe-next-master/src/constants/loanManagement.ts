import { CoordinatorManagementModel } from "@/types/coordinators";
import {
  LoanManagementRequestEnum,
  LOAN_REFERENCE_TYPE_ENUM,
} from "@/types/loan-management";
import { PartnerModel } from "@/types/partnership";
import { ReactFormType } from "@/types/reactForm";

export const loanManagementFormList: (
  coordinatorData: CoordinatorManagementModel[],
  partnerData: PartnerModel[]
) => ReactFormType<LoanManagementRequestEnum>[] = (
  coordinatorData,
  partnerData
) => [
  { name: LoanManagementRequestEnum.LOAN_ID, formType: { type: "notShown" } },
  {
    name: LoanManagementRequestEnum.LOAN_PRINCIPAL,
    formType: {
      type: "input",
      label: "Jumlah Pokok",
      placeholder: "Jumlah Pokok",
      reactInputType: "number",
    },
    rules: {
      required: "Jumlah pinjaman harus diisi",
      min: { value: 1000000, message: "Minimal 1 Juta" },
    },
  },
  {
    name: LoanManagementRequestEnum.TOTAL,
    formType: {
      type: "input",
      label: "Total yang harus dibayar",
      placeholder: "Total yang harus dibayar",
      reactInputType: "number",
    },
    rules: {
      required: "Jumlah pinjaman harus diisi",
      min: { value: 1000000, message: "Minimal 1 Juta" },
    },
  },
  {
    name: LoanManagementRequestEnum.REFERENCE_TYPE,
    formType: {
      type: "select",
      label: "Pilih Jenis",
      selectData: Object.values(LOAN_REFERENCE_TYPE_ENUM),
    },
    rules: { required: "Jenis peminjam harus dipilih" },
  },
  {
    name: LoanManagementRequestEnum.REFERENCE_ID,
    formType: {
      type: "dynamic",
      form1: {
        type: "select",
        label: "Pilih Mitra",
        selectData: partnerData,
        returnedKey: "partner_id",
        customLabel: {
          keyList: ["partner_name", "coordinator_name"],
        },
      },
      form2: {
        type: "select",
        label: "Pilih Koordinator",
        selectData: coordinatorData,
        returnedKey: "id",
        customLabel: {
          keyList: ["code", "name"],
        },
      },
      listenTo: LoanManagementRequestEnum.REFERENCE_TYPE,
      condition: LOAN_REFERENCE_TYPE_ENUM.PARTNER,
    },
    rules: { required: "Peminjam harus dipilih" },
  },
  {
    name: LoanManagementRequestEnum.DESCRIPTION,
    formType: {
      type: "input",
      label: "Keterangan",
      placeholder: "Keterangan",
    },
  },
];
