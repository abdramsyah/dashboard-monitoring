import { ChipTheme } from "@/components/Chip";
import { ChipSelectorOption } from "@/components/ChipSelector";
import {
  CoordinatorManagementModel,
  CoordinatorModelRequestEnum,
} from "@/types/coordinators";
import { PartnerModel } from "@/types/partnership";
import {
  QueueRequestDataEnum,
  QueueRequestEnum,
  QueueRequestProps,
  RequestModeEnum,
  ScannedStatusEnum,
  queueDataBodyType,
  queueStatusEnum,
} from "@/types/queue";
import { ReactFormType } from "@/types/reactForm";
import { UserModelRequestEnum } from "@/types/users";
import moment from "moment";
import { UseFieldArrayReturn } from "react-hook-form";

type QueueFormListProps = {
  queueFields: UseFieldArrayReturn<
    QueueRequestProps,
    QueueRequestEnum.QUEUES,
    "id"
  >;
  fieldArrayStyle: {
    farmerInput: string;
    partnerSelect: string;
    typeSelect: string;
    totalInput: string;
  };
  isNewFarmer: boolean;
  coordinatorList?: CoordinatorManagementModel[];
  partnerList?: PartnerModel[];
};

export const queueFormList: (props: QueueFormListProps) => ReactFormType[] = ({
  queueFields,
  fieldArrayStyle,
  isNewFarmer,
  coordinatorList,
  partnerList,
}) => [
  ...coordinatorSection(isNewFarmer, coordinatorList),
  {
    name: QueueRequestEnum.QUEUES,
    formType: {
      type: "fieldArray",
      fieldArray: queueFields,
      title: "Tambah Antrian",
      max: 40,
      shouldFocus: false,
      useIndex: true,
      form: [
        {
          name: QueueRequestDataEnum.FARMER,
          formType: {
            type: "dynamic",
            form1: {
              type: "select",
              label: "Mitra",
              selectData: partnerList || [],
              customLabel: { keyList: ["coordinator_code", "partner_name"] },
              customStyle: {
                containerClassName: fieldArrayStyle.partnerSelect,
              },
            },
            form2: {
              type: "input",
              label: "Nama Petani",
              className: fieldArrayStyle.farmerInput,
            },
            listenTo: QueueRequestDataEnum.PRODUCT_TYPE,
            condition: "Kemitraan",
          },
          rules: { required: "Nama petani tidak boleh kosong" },
        },
        {
          name: QueueRequestDataEnum.PRODUCT_TYPE,
          formType: {
            type: "select",
            label: "Jenis Produk",
            selectData: ["Kemitraan", "Lokal", "Dagang"],
            customStyle: { containerClassName: fieldArrayStyle.typeSelect },
          },
          rules: { required: "Pilih salah satu jenis produk" },
        },
        {
          name: QueueRequestDataEnum.REQUEST_QUANTITY,
          formType: {
            type: "input",
            label: "Jumlah Keranjang",
            reactInputType: "number",
            className: fieldArrayStyle.totalInput,
          },
          rules: {
            required: "Jumlah keranjang tidak boleh kosong",
            min: { value: 1, message: "Jumlah keranjang harus 1 atau lebih" },
          },
        },
      ],
    },
  },
];

const coordinatorSection = (
  isNew: boolean,
  coordinatorList?: CoordinatorManagementModel[]
) => {
  if (isNew) return newCoordinator;

  return existedCoordinator(coordinatorList);
};

const newCoordinator = [
  {
    name: CoordinatorModelRequestEnum.CODE,
    formType: {
      type: "input",
      label: "Kode Koordinator",
      placeholder: "Kode Koordinator",
    },
    rules: {
      required: "Kode Koordinator tidak boleh kosong",
      minLength: {
        value: 2,
        message: "Kode Koordinator tidak boleh kurang dari 2 karakter",
      },
      maxLength: {
        value: 4,
        message: "Kode Koordinator tidak boleh lebih dari 4 karakter",
      },
    },
  },
  {
    name: UserModelRequestEnum.NAME,
    formType: {
      type: "input",
      label: "Nama",
      placeholder: "Nama",
    },
    rules: { required: "Nama tidak boleh kosong" },
  },
] as ReactFormType<
  CoordinatorModelRequestEnum.CODE | UserModelRequestEnum.NAME
>[];

const existedCoordinator = (coordinatorList?: CoordinatorManagementModel[]) =>
  [
    {
      name: QueueRequestEnum.COORDINATOR_ID,
      formType: {
        type: "select",
        label: "Pilih Coordinator",
        selectData: coordinatorList || [],
        customLabel: {
          separator: " - ",
          keyList: ["code", "name"],
        },
        returnedKey: "id",
      },
    },
  ] as ReactFormType<QueueRequestEnum>[];

export const queueStatusColor = {
  [queueStatusEnum.APPROVED]: "#307656",
  [queueStatusEnum.ON_PROGRESS]: "#18A0FB",
  [queueStatusEnum.REJECTED]: "#F5222D",
};

export const queueStatusTheme: { [K in queueStatusEnum]: ChipTheme } = {
  [queueStatusEnum.APPROVED]: "outlined-green",
  [queueStatusEnum.ON_PROGRESS]: "outlined-blue",
  [queueStatusEnum.REJECTED]: "outlined-red",
};

export const initialQueueBody: queueDataBodyType = {
  date: moment().add(1, "day").format("YYYY-MM-DD"),
  list: [],
  total: 0,
  code: "",
  accumBucket: 0,
};
export const bucketStatusTheme: {
  [K in ScannedStatusEnum]: ChipTheme;
} = {
  [ScannedStatusEnum.Approve]: "outlined-green",
  [ScannedStatusEnum.AlreadyApproved]: "outlined-red",
  [ScannedStatusEnum.Reject]: "outlined-green",
  [ScannedStatusEnum.AlreadyRejected]: "outlined-red",
};

export const bucketStatusTranslate: {
  [K in ScannedStatusEnum]: string;
} = {
  [ScannedStatusEnum.Approve]: "Diterima",
  [ScannedStatusEnum.AlreadyApproved]: "Kesalahan",
  [ScannedStatusEnum.Reject]: "Ditolak",
  [ScannedStatusEnum.AlreadyRejected]: "Kesalahan",
};

export const requestModeOptions: ChipSelectorOption<RequestModeEnum>[] = [
  {
    value: "newCoordinator",
    enum: "newCoordinator",
    label: "Petani Baru",
    selected: false,
  },
  {
    value: "existedCoordinator",
    enum: "existedCoordinator",
    label: "Petani Lama",
    selected: true,
  },
];
