import React, { useCallback, useEffect, useMemo } from "react";
import { ChipSelectorOption } from "@/components/ChipSelector";
import { RoleEnum, RoleModulesType } from "@/types/auth";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import { UseFormWatch, useForm } from "react-hook-form";
import {
  UserManagementModel,
  UserModelRequestEnum,
  UserModelRequestProps,
} from "@/types/users";
import { Modal } from "antd";
import nProgress from "nprogress";
import { userManagementFormList } from "@/constants/users";
import { useDispatch, useSelector } from "react-redux";
import { ReactFormType } from "@/types/reactForm";

interface UserManagementFormProps {
  isOpen: boolean;
  onClose: () => void;
  userListParams: any;
  userData?: UserManagementModel;
}

const UserManagementForm: React.FC<UserManagementFormProps> = (
  props: UserManagementFormProps
) => {
  const { isOpen, onClose, userListParams, userData } = props;

  const { rolesData }: { rolesData: { data?: RoleModulesType[] } } =
    useSelector(({ userRoles }) => userRoles);

  const roleOption: ChipSelectorOption[] = useMemo(() => {
    let rolesChipObject: {
      [K in RoleEnum]?: ChipSelectorOption;
    } = {};
    rolesData?.data?.forEach((e: RoleModulesType) => {
      if (e.role_name !== RoleEnum.COORDINATOR) {
        rolesChipObject[e.role_name] = {
          value: e.role_id,
          enum: e.role_name,
          label: e.role_description,
          selected:
            userData?.roles?.map((e1) => e1.role_name).includes(e.role_name) ||
            false,
        };
      }
    });

    return Object.values(rolesChipObject);
  }, [rolesData?.data, userData?.roles]);

  const methods = useForm<UserModelRequestProps>({
    defaultValues: {
      id: userData?.id,
      name: userData?.name,
      phoneNumber: userData?.phone_number,
      username: userData?.username,
    },
    mode: "onBlur",
  });

  const dispatch = useDispatch();
  const isEditMode = !!userData;

  const onSuccessSaga = () => {
    dispatch({ type: "userManagement/GET_USER_LIST", param: userListParams });
  };

  const onFinishSaga = () => {
    nProgress.done();
    onClose();
  };

  const submitRequest = (formData: UserModelRequestProps) => {
    let modules: number[] = [];
    let roles: number[] = [];

    formData[UserModelRequestEnum.ROLES].forEach((e) => {
      if (e.selected) {
        roles.push(e.value as number);

        if (e.enum) {
          formData[e.enum as RoleEnum]?.forEach((mod) => {
            modules.push(mod.value as number);
          });
        }
      }
    });

    const newForm = {
      ...formData,
      phone_number: formData[UserModelRequestEnum.PHONE_NUMBER],
      roles,
      modules,
      email: formData[UserModelRequestEnum.USERNAME] + "@lampiongroup.com",
    };

    console.log("asdad - submitRequest - newForm", newForm);

    nProgress.start();
    dispatch({
      type: isEditMode
        ? "userManagement/UPDATE_USER"
        : "userManagement/CREATE_USER",
      param: { body: newForm, onFinishSaga, onSuccessSaga },
    });
  };

  useEffect(() => {
    if (rolesData.data && userData?.modules) {
      rolesData.data?.forEach((e: RoleModulesType) => {
        const moduleOption = e.modules.map((module) => ({
          value: module.module_id,
          enum: module.module_name,
          label: module.module_description,
          selected:
            userData?.modules
              ?.map((uMod) => uMod.module_name)
              .includes(module.module_name) || false,
        }));

        if (e.modules.length)
          methods.setValue(
            e.role_name,
            moduleOption.filter((chip) => chip.selected)
          );
      });

      console.log("asdad - set roleModules");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesData.data, userData?.modules]);

  return (
    <Modal
      className="modalEdit"
      open={isOpen}
      width={600}
      onCancel={onClose}
      styles={{
        body: { overflowY: "auto", maxHeight: "calc(100vh - 200px)" },
      }}
      footer={null}
    >
      <div>
        <h4>{isEditMode ? "Edit User" : "Tambah User"}</h4>
        <div>
          <ReactFormBuilder
            methods={methods}
            formList={(_) =>
              userManagementFormList({
                roleOption,
                roleModules: rolesData?.data || [],
                userData,
              })
            }
            onSubmit={submitRequest}
            buttonProps={{
              title: "Submit",
              customClassName: "button-custom",
              loading: nProgress.isStarted(),
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default UserManagementForm;
