import React from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import {
  CoordinatorManagementModel,
  CoordinatorModelRequestEnum,
  CoordinatorModelRequestProps,
  CoordinatorManagementPayload,
} from "@/types/coordinators";
import { useForm } from "react-hook-form";
import nProgress from "nprogress";
import { UserModelRequestEnum } from "@/types/users";
import { RoleEnum, RoleModulesType } from "@/types/auth";
import {
  coordinatorManagementFormCreateList,
  coordinatorManagementFormEditList,
} from "@/constants/coordinators";

interface CoordinatorManagementFormProps {
  isOpen: boolean;
  onClose: () => void;
  coordinatorListParams: any;
  coordinatorData?: CoordinatorManagementModel;
}

const CoordinatorManagementForm: React.FC<CoordinatorManagementFormProps> = (
  props: CoordinatorManagementFormProps
) => {
  const { isOpen, onClose, coordinatorListParams, coordinatorData } = props;

  const methods = useForm<CoordinatorModelRequestProps>({
    defaultValues: {
      id: `${coordinatorData?.id}`,
      quota: `${coordinatorData?.quota}`,
      code: coordinatorData?.code,
    },
    mode: "onBlur",
  });

  const dispatch = useDispatch();
  const isEditMode = !!coordinatorData;

  const { rolesData }: { rolesData: { data: RoleModulesType[] } } = useSelector(
    ({ userRoles }) => userRoles
  );

  const onSuccessSaga = () => {
    dispatch({
      type: "coordinatorManagement/GET_COORDINATOR_LIST",
      param: coordinatorListParams,
    });
  };

  const onFinishSaga = () => {
    nProgress.done();
    onClose();
  };

  const submitRequest = (formData: CoordinatorModelRequestProps) => {
    nProgress.start();

    const coordinatorRoles = rolesData.data.find(
      (role) => role.role_name === RoleEnum.COORDINATOR
    );

    let newForm: CoordinatorManagementPayload;

    if (isEditMode) {
      newForm = {
        isEditMode,
        data: {
          coordinator_param: {
            id:
              typeof formData[CoordinatorModelRequestEnum.ID] === "string"
                ? parseInt(formData[CoordinatorModelRequestEnum.ID])
                : "0",
            quota: parseInt(formData[CoordinatorModelRequestEnum.QUOTA] || "1"),
            code: formData[CoordinatorModelRequestEnum.CODE],
          },
        },
      };
    } else {
      newForm = {
        isEditMode: false,
        data: {
          user_param: {
            name: formData[UserModelRequestEnum.NAME],
            phone_number: formData[UserModelRequestEnum.PHONE_NUMBER],
            username: formData[UserModelRequestEnum.USERNAME],
            password: formData[UserModelRequestEnum.PASSWORD],
            roles: [coordinatorRoles?.role_id ?? 0],
            modules:
              coordinatorRoles?.modules.map((module) => module.module_id) ?? [],
            email:
              formData[UserModelRequestEnum.USERNAME] + "@lampiongroup.com",
          },
          coordinator_param: {
            quota: parseInt(formData[CoordinatorModelRequestEnum.QUOTA] || "1"),
            code: formData[CoordinatorModelRequestEnum.CODE],
          },
        },
      };
    }

    dispatch({
      type: isEditMode
        ? "coordinatorManagement/UPDATE_COORDINATOR"
        : "coordinatorManagement/CREATE_COORDINATOR",
      param: { body: newForm.data, onFinishSaga, onSuccessSaga },
    });
  };

  return (
    <Modal
      className="modalEdit"
      open={isOpen}
      onCancel={onClose}
      styles={{
        body: { overflowY: "auto", maxHeight: "calc(100vh - 200px)" },
      }}
      width={700}
      footer={null}
    >
      <div>
        <h4>{isEditMode ? "Edit Koordinator" : "Tambah Koordinator"}</h4>
        <div>
          <ReactFormBuilder
            grouped
            wrapped
            methods={methods}
            formList={(_) =>
              isEditMode
                ? coordinatorManagementFormEditList
                : coordinatorManagementFormCreateList
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

export default CoordinatorManagementForm;
