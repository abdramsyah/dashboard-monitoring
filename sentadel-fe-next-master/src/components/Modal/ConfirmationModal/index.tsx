import { Modal, ModalProps } from "antd";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import { CSSProperties } from "react";

export interface ConfirmationModalProps {
  open: boolean;
  confirm?: string;
  onConfirm: () => void;
  cancel?: string;
  onCancel?: () => void;
  title: string;
  subTitle?: string;
  cancelFocused?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  width?: string | number;
  className?: string;
  styles?: ModalProps["styles"];
  closable?: boolean;
  onClose: () => void;
}

const ConfirmationModal = (props: ConfirmationModalProps) => {
  const {
    open,
    confirm,
    onConfirm,
    cancel,
    onCancel,
    title,
    subTitle,
    cancelFocused,
    children,
    loading,
    disabled,
    width,
    className,
    styles,
    closable,
    onClose,
  } = props;

  return (
    <>
      <Modal
        className={`modal-confirmation ${className}`}
        centered
        closable={closable}
        open={open}
        footer={null}
        width={width}
        styles={styles}
        onCancel={onClose}
      >
        <h4>{title}</h4>
        <p>{subTitle}</p>
        <div>{children}</div>
        <div className="action">
          <ReactButton
            type="button"
            theme={cancelFocused ? "solid-red" : "outlined-red"}
            customClassName={`modal-confirmation-base-button`}
            onClick={onCancel ? onCancel : onClose}
            disabled={loading}
            title={cancel || "Cancel"}
          />

          <ReactButton
            type="button"
            theme={cancelFocused ? "outlined-red" : "solid-blue"}
            customClassName={`modal-confirmation-base-button`}
            onClick={onConfirm}
            loading={loading}
            disabled={disabled}
            title={confirm || "Confirm"}
          />
        </div>
      </Modal>
    </>
  );
};

export default ConfirmationModal;
