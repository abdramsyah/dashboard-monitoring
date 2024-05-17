import { CoordinatorModelRequestEnum } from "@/types/coordinators";
import { ReactFormType } from "@/types/reactForm";
import { UserModelRequestEnum } from "@/types/users";

export const coordinatorManagementFormCreateList: {
  title: string;
  form: ReactFormType<
    | CoordinatorModelRequestEnum
    | Exclude<
        UserModelRequestEnum,
        UserModelRequestEnum.ID | UserModelRequestEnum.ROLES
      >
  >[][];
}[] = [
  {
    title: "Data Pengguna",
    form: [
      [
        {
          name: UserModelRequestEnum.NAME,
          formType: {
            type: "input",
            label: "Nama",
            placeholder: "Nama",
          },
          rules: { required: "Nama tidak boleh kosong" },
        },
        {
          name: UserModelRequestEnum.PHONE_NUMBER,
          formType: {
            type: "input",
            label: "No. HP",
            placeholder: "0812********",
          },
          rules: { required: "No. HP tidak boleh kosong" },
        },
      ],
      [
        {
          name: UserModelRequestEnum.USERNAME,
          formType: {
            type: "input",
            label: "Username",
            placeholder: "Username",
          },
          rules: { required: "Username tidak boleh kosong" },
        },
        {
          name: UserModelRequestEnum.PASSWORD,
          formType: {
            type: "input",
            label: "Password",
            placeholder: "Password",
          },
          rules: { required: "Password tidak boleh kosong" },
        },
      ],
    ],
  },
  {
    title: "Data Koordinator",
    form: [
      [
        {
          name: CoordinatorModelRequestEnum.ID,
          formType: { type: "notShown" },
        },
        {
          name: CoordinatorModelRequestEnum.QUOTA,
          formType: {
            type: "input",
            label: "Kuota",
            placeholder: "Kuota",
          },
          rules: { required: "Kuota tidak boleh kosong" },
        },
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
      ],
    ],
  },
];

export const coordinatorManagementFormEditList: {
  title: string;
  form: ReactFormType<
    | CoordinatorModelRequestEnum
    | Exclude<
        UserModelRequestEnum,
        UserModelRequestEnum.ID | UserModelRequestEnum.ROLES
      >
  >[][];
}[] = [
  {
    title: "Data Koordinator",
    form: [
      [
        {
          name: CoordinatorModelRequestEnum.ID,
          formType: { type: "notShown" },
        },
        {
          name: CoordinatorModelRequestEnum.QUOTA,
          formType: {
            type: "input",
            label: "Kuota",
            placeholder: "Kuota",
          },
          rules: { required: "Kuota tidak boleh kosong" },
        },
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
      ],
    ],
  },
];
