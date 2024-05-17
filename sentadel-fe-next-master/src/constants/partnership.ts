import { CoordinatorManagementModel } from "@/types/coordinators";
import { PartnershipRequestEnum } from "@/types/partnership";
import { ReactFormType } from "@/types/reactForm";

export const partnershipManagementFormList: (
  coordinatorData: CoordinatorManagementModel[]
) => ReactFormType<PartnershipRequestEnum>[] = (coordinatorData) => [
  { name: PartnershipRequestEnum.PARTNER_ID, formType: { type: "notShown" } },
  {
    name: PartnershipRequestEnum.COORDINATOR_ID,
    formType: {
      type: "select",
      label: "Pilih Koordinator",
      selectData: coordinatorData,
      returnedKey: "id",
      customLabel: {
        keyList: ["code", "name"],
      },
    },
    rules: { required: "Koordinator wajib dipilih" },
  },
  {
    name: PartnershipRequestEnum.NAME,
    formType: {
      type: "input",
      label: "Nama Mitra",
      placeholder: "Nama Mitra",
    },
    rules: { required: "Nama Mitra tidak boleh kosong" },
  },
  {
    name: PartnershipRequestEnum.QUOTA,
    formType: {
      type: "input",
      reactInputType: "number",
      label: "Kuota",
      placeholder: "Kuota",
    },
    rules: { required: "Kode Client tidak boleh kosong" },
  },
];
