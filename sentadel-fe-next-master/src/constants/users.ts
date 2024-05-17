import { ChipSelectorOption } from "@/components/ChipSelector";
import { RoleEnum, RoleModulesType } from "@/types/auth";
import { ReactFormType } from "@/types/reactForm";
import { UserManagementModel, UserModelRequestEnum } from "@/types/users";

type UserManagementFormListProps = {
  roleOption: ChipSelectorOption[];
  roleModules: RoleModulesType[];
  userData?: UserManagementModel;
};

export const userManagementFormList: (
  props: UserManagementFormListProps
) => ReactFormType<UserModelRequestEnum | RoleEnum>[] = (
  props: UserManagementFormListProps
) => [
  {
    name: UserModelRequestEnum.ID,
    formType: {
      type: "notShown",
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
  {
    name: UserModelRequestEnum.PHONE_NUMBER,
    formType: {
      type: "input",
      label: "No. HP",
      placeholder: "0812********",
    },
    rules: { required: "No. HP tidak boleh kosong" },
  },
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
  {
    name: UserModelRequestEnum.ROLES,
    formType: {
      type: "chipSelector",
      isMultiple: true,
      title: "Pilih Role",
      options: props.roleOption,
    },
    rules: { required: "Pilih satu atau lebih role" },
  },
  ...optionalForm(props.roleModules, props.userData),
];

const optionalForm: (
  roleModules: RoleModulesType[],
  userData?: UserManagementModel
) => ReactFormType<RoleEnum>[] = (roleModules, userData) => {
  let modulesFormObject: {
    [K in RoleEnum]?: ReactFormType<RoleEnum>;
  } = {};
  roleModules?.forEach((e: RoleModulesType) => {
    const moduleOption = e.modules.map((module) => ({
      value: module.module_id,
      enum: module.module_name,
      label: module.module_description,
      selected:
        userData?.modules
          ?.map((uMod) => uMod.module_name)
          .includes(module.module_name) || false,
    }));

    modulesFormObject[e.role_name] = {
      name: e.role_name,
      formType: {
        type: "autoHide",
        form: {
          type: "chipSelector",
          isMultiple: true,
          title: `Pilih ${e.role_description} Module`,
          options: moduleOption,
        },
        listenTo: UserModelRequestEnum.ROLES,
        targetType: "chipSelector",
        targetKey: "enum",
        condition: e.role_name,
      },
    };
  });

  return Object.values(modulesFormObject);
};
