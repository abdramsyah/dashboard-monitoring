import React, { ReactNode } from "react";
import { Modal } from "antd";
import ButtonComponent from "../Button/CustomButton";

interface EditModalProps {
  open: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  desc?: string;
  loading?: boolean;
  disabled?: boolean;
  modalWidth?: number;
}

const EditModal: React.FC<EditModalProps> = (props: EditModalProps) => {
  const {
    open,
    onSubmit,
    onClose,
    children,
    title,
    desc,
    loading,
    disabled,
    modalWidth,
  } = props;

  return (
    <>
      <Modal
        className="modalEdit"
        open={open}
        width={modalWidth}
        onCancel={onClose}
        styles={{
          body: { overflowY: "auto", maxHeight: "calc(100vh - 200px)" },
        }}
        footer={null}
      >
        <div>
          <h4>{title}</h4>
          <p>{desc}</p>
          {children}
        </div>
        <ButtonComponent
          className="submitButton"
          disabled={disabled || loading}
          loading={loading}
          onClick={onSubmit}
        >
          Submit
        </ButtonComponent>
      </Modal>
    </>
  );
};

export default EditModal;
