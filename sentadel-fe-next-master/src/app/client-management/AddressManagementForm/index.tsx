import React from "react";
import { Modal } from "antd";
import { AddressModel } from "@/types/clients";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import { useForm } from "react-hook-form";
import { addressManagementFormList } from "@/constants/clients";
import nProgress from "nprogress";
import { manageAddress } from "@/api/queries/fetch";
import { MUTATION_KEY } from "@/api/queries/key";
import MessageError from "@/components/Notification/MessageError";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import { ErrorResponseType } from "@/types/global";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface AddressManagementFormProps {
  isOpen: boolean;
  onClose: () => void;
  addressData: AddressModel;
  onSuccessManage: () => void;
}

const AddressManagementForm: React.FC<AddressManagementFormProps> = (
  props: AddressManagementFormProps
) => {
  const { isOpen, onClose, addressData, onSuccessManage } = props;

  const methods = useForm<AddressModel>({
    defaultValues: {
      id: addressData.id,
      client_id: addressData.client_id,
      address: addressData.address,
    },
    mode: "onBlur",
  });
  const isEditMode = !!addressData.id;

  const onSuccess = () => {
    toast.success(<MessageSuccess msg={"Validasi sukses"} />, {
      className: "toast-message-success",
    });
    onSuccessManage();
    onClose();
    nProgress.done();
  };

  const onError = (
    err: ErrorResponseType<{ data?: unknown; message?: string }>
  ) => {
    toast.error(
      <MessageError msg={`Terjadi kesalahan, ${err.response?.data || err}`} />,
      { className: "toast-message-error" }
    );
    nProgress.done();
  };

  const { mutate } = useMutation({
    mutationFn: manageAddress,
    mutationKey: [MUTATION_KEY.MANAGE_ADDRESS],
    onSuccess,
    onError,
  });

  const submitRequest = (formData: AddressModel) => {
    nProgress.start();
    mutate(formData);
  };

  return (
    <Modal
      className="modalEdit"
      open={isOpen}
      width={350}
      onCancel={onClose}
      styles={{
        body: { overflowY: "auto", maxHeight: "calc(100vh - 200px)" },
      }}
      footer={null}
    >
      <div>
        <h4>{isEditMode ? "Edit Alamat" : "Tambah Alamat"}</h4>
        <div>
          <ReactFormBuilder
            methods={methods}
            formList={() => addressManagementFormList([])}
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

export default AddressManagementForm;
