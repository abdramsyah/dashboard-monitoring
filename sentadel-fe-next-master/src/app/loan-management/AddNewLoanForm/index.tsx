import { addNewLoan, updateLoan } from "@/api/queries/fetch";
import { MUTATION_KEY } from "@/api/queries/key";
import MessageError from "@/components/Notification/MessageError";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import { loanManagementFormList } from "@/constants/loanManagement";
import { CoordinatorManagementModel } from "@/types/coordinators";
import { ErrorResponseType, SuccessResponseType } from "@/types/global";
import {
  LOAN_REFERENCE_TYPE_ENUM,
  LoanManagementFormProps,
  LoanManagementRequestEnum,
} from "@/types/loan-management";
import { PartnerModel } from "@/types/partnership";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "antd";
import nProgress from "nprogress";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface AddNewLoanFormProps {
  isModalOpen: boolean;
  coordinatorList?: CoordinatorManagementModel[];
  partnerList?: PartnerModel[];
  refetch: () => void;
  onClose: () => void;
  obj?: LoanManagementFormProps;
}

const AddNewLoanForm: React.FC<AddNewLoanFormProps> = (
  props: AddNewLoanFormProps
) => {
  const { isModalOpen, coordinatorList, partnerList, refetch, onClose, obj } =
    props;

  const methods = useForm<LoanManagementFormProps>({
    mode: "onBlur",
    defaultValues: {
      reference_type: LOAN_REFERENCE_TYPE_ENUM.PARTNER,
      ...obj,
    },
  });

  const onSuccess = (data: SuccessResponseType<unknown>) => {
    toast.success(<MessageSuccess msg={"Sukses menambah pinjaman"} />, {
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
    mutationKey: [MUTATION_KEY.ADD_NEW_LOAN],
    mutationFn: obj?.[LoanManagementRequestEnum.LOAN_ID]
      ? updateLoan
      : addNewLoan,
    onSuccess,
    onError,
  });

  const submitRequest = (formData: LoanManagementFormProps) => {
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
          methods={methods}
          onSubmit={submitRequest}
          formList={(_) =>
            loanManagementFormList(coordinatorList || [], partnerList || [])
          }
          buttonProps={{
            title: obj?.[LoanManagementRequestEnum.LOAN_ID]
              ? "Edit Pinjaman"
              : "Tambahkan Pinjaman",
            // title: "Tambahkan Pinjaman",
            customClassName: "button-custom",
            loading: nProgress.isStarted(),
          }}
        />
      </div>
    </Modal>
  );
};

export default AddNewLoanForm;
