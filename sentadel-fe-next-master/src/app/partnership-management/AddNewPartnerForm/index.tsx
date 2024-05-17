import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import { Modal } from "antd";
import nProgress from "nprogress";
import React from "react";
import { useForm } from "react-hook-form";
import { partnershipManagementFormList } from "@/constants/partnership";
import { MUTATION_KEY } from "@/api/queries/key";
import { useMutation } from "@tanstack/react-query";
import { addNewPartner, updatePartner } from "@/api/queries/fetch";
import { ErrorResponseType } from "@/types/global";
import {
  PartnershipFormProps,
  PartnershipRequestEnum,
} from "@/types/partnership";
import { toast } from "react-toastify";
import MessageError from "@/components/Notification/MessageError";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import "react-toastify/dist/ReactToastify.css";
import { CoordinatorManagementModel } from "@/types/coordinators";

interface AddNewPartnerFormProps {
  isModalOpen: boolean;
  coordinatorList?: CoordinatorManagementModel[];
  refetch: () => void;
  onClose: () => void;
  obj?: PartnershipFormProps;
}

const AddNewPartnerForm: React.FC<AddNewPartnerFormProps> = (
  props: AddNewPartnerFormProps
) => {
  const { isModalOpen, coordinatorList, refetch, onClose, obj } = props;

  const methods = useForm<PartnershipFormProps>({
    mode: "onBlur",
    defaultValues: obj,
  });

  const onSuccess = () => {
    toast.success(<MessageSuccess msg={"Sukses menambah mitra"} />, {
      className: "toast-message-success",
    });
    refetch();
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
    mutationKey: [MUTATION_KEY.ADD_NEW_PARTNER],
    mutationFn: obj?.[PartnershipRequestEnum.PARTNER_ID]
      ? updatePartner
      : addNewPartner,
    onSuccess,
    onError,
  });

  const submitRequest = (formData: PartnershipFormProps) => {
    nProgress.start();
    mutate(formData);
  };

  return (
    <Modal
      className="modal-edit modal-mobile"
      footer={null}
      open={isModalOpen}
      onCancel={onClose}
    >
      <div>
        <h4>Tambah Barcode Penjualan</h4>
        <ReactFormBuilder
          wrapped={false}
          grouped={false}
          methods={methods}
          onSubmit={submitRequest}
          formList={(_) => partnershipManagementFormList([])}
          buttonProps={{
            title: obj?.[PartnershipRequestEnum.PARTNER_ID]
              ? "Edit Mitra"
              : "Tambahkan Mitra",
            customClassName: "button-custom",
            loading: nProgress.isStarted(),
          }}
        />
      </div>
    </Modal>
  );
};

export default AddNewPartnerForm;
