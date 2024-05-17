import React from "react";
import { Modal } from "antd";
import { ClientModel, ClientModelRequestProps } from "@/types/clients";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import { useForm } from "react-hook-form";
import { clientManagementFormList } from "@/constants/clients";
import nProgress from "nprogress";
import { useDispatch } from "react-redux";

interface ClientManagementFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientListParams: any;
  clientData?: ClientModel;
}

const ClientManagementForm: React.FC<ClientManagementFormProps> = (
  props: ClientManagementFormProps
) => {
  const { isOpen, onClose, clientListParams, clientData } = props;

  const methods = useForm<ClientModelRequestProps>({
    defaultValues: {
      id: clientData?.id,
      client_name: clientData?.client_name,
      code: clientData?.code,
    },
    mode: "onBlur",
  });

  const dispatch = useDispatch();
  const isEditMode = !!clientData;

  const onSuccessSaga = () => {
    dispatch({ type: "clientManagement/GET_DATA", param: clientListParams });
  };

  const onFinishSaga = () => {
    nProgress.done();
    onClose();
  };

  const submitRequest = (formData: ClientModelRequestProps) => {
    nProgress.start();
    dispatch({
      type: isEditMode
        ? "clientManagement/PUT_DATA"
        : "clientManagement/CREATE_CLIENT",
      param: { body: formData, onFinishSaga, onSuccessSaga },
    });
  };

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
        <h4>{isEditMode ? "Edit Client" : "Tambah Client"}</h4>
        <div>
          <ReactFormBuilder
            grouped={false}
            wrapped={false}
            methods={methods}
            formList={(_) => clientManagementFormList}
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

export default ClientManagementForm;
