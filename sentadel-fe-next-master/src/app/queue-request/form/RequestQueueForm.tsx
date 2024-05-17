import React from "react";
import { useDispatch } from "react-redux";
import { Modal } from "antd";
import { useFieldArray, useForm } from "react-hook-form";
import nProgress from "nprogress";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import { QueueRequestEnum, QueueRequestProps } from "@/types/queue";
import { queueFormList } from "@/constants/queue";

interface ModalRequestQueueFormProps {
  isModalOpen: boolean;
  params: any;
  onClose: () => void;
  // methods: UseFormReturn<QueueRequestProps>;
}

const ModalRequestQueueForm: React.FC<ModalRequestQueueFormProps> = (
  props: ModalRequestQueueFormProps
) => {
  const { isModalOpen, params, onClose } = props;

  const methods = useForm<QueueRequestProps>({
    defaultValues: {
      queues: [
        {
          farmer: "",
          product_type: "",
          request_quantity: 0,
        },
      ],
    },
  });

  const queueFields = useFieldArray({
    control: methods.control,
    name: QueueRequestEnum.QUEUES,
  });

  const dispatch = useDispatch();

  const onSuccessSaga = () => {
    dispatch({
      type: "queueRequest/GET_DATA",
      param: params,
    });
  };

  const onFinishSaga = onClose;

  const submitRequest = (form: QueueRequestProps) => {
    nProgress.start();
    dispatch({
      type: "queueRequest/POST_DATA",
      param: { body: form, onFinishSaga, onSuccessSaga },
    });
  };

  return (
    <Modal
      className="modal-edit modal-mobile"
      footer={null}
      open={isModalOpen}
      onCancel={onClose}
    >
      <div>
        <h4>Tambah Antrian</h4>
        <p>Antrian baru akan ditambahkan ke database</p>
        {/* <ReactFormBuilder
          methods={methods}
          wrapped={false}
          grouped={false}
          formList={(_) => queueFormList(queueFields)}
          onSubmit={submitRequest}
          buttonProps={{
            title: "Buat Antrian",
            customClassName: "button-custom",
            loading: nProgress.isStarted(),
          }}
        /> */}
      </div>
    </Modal>
  );
};

export default ModalRequestQueueForm;
