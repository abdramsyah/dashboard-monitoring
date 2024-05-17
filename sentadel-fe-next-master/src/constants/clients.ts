import {
  AddressModel,
  ClientModel,
  ClientModelRequestEnum,
} from "@/types/clients";
import { ReactFormType } from "@/types/reactForm";

export enum CompanyEnum {
  LAMPION = "LAMPION",
  TALENTA = "TALENTA",
}

export const clientManagementFormList: ReactFormType<
  ClientModelRequestEnum,
  CompanyEnum[]
>[] = [
  {
    name: ClientModelRequestEnum.ID,
    formType: {
      type: "notShown",
    },
  },
  {
    name: ClientModelRequestEnum.CLIENT_NAME,
    formType: {
      type: "input",
      label: "Nama Client",
      placeholder: "Nama Client",
    },
    rules: { required: "Nama Client tidak boleh kosong" },
  },
  {
    name: ClientModelRequestEnum.CODE,
    formType: {
      type: "input",
      label: "Kode Client",
      placeholder: "Kode Client",
    },
    rules: { required: "Kode Client tidak boleh kosong" },
  },
  {
    name: ClientModelRequestEnum.COMPANY,
    formType: {
      type: "select",
      label: "Pilih Nama Perusahaan (LAMPION/TALENTA)",
      selectData: [CompanyEnum.LAMPION, CompanyEnum.TALENTA],
    },
    rules: { required: "Pilih salah satu dari LAMPION atau TALENTA" },
  },
];

export const addressManagementFormList: (
  clientList: ClientModel[]
) => ReactFormType<keyof AddressModel>[] = (clientList) => [
  {
    name: "id",
    formType: {
      type: "notShown",
    },
  },
  // {
  //   name: "client_id",
  //   formType: {
  //     type: "select",
  //     label: "Client",
  //     selectData: clientList,
  //     customLabel: { keyList: ["code", "client_name"] },
  //   },
  //   rules: { required: "Nama Client tidak boleh kosong" },
  // },
  {
    name: "address",
    formType: {
      type: "input",
      inputType: "TEXTAREA",
      label: "Alamat",
      placeholder: "Alamat",
    },
    rules: { required: "Alamat tidak boleh kosong" },
  },
];
