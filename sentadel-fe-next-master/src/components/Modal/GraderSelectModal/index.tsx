import React, { useState } from "react";
import styles from "./styles.module.scss";
import { Modal } from "antd";
import SelectComponent from "@/components/Select";

export type GraderType = "Jopie" | "Evan";

interface GraderSelectModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSelect: (grader: GraderType) => void;
  value?: GraderType;
}

const GraderSelectModal: React.FC<GraderSelectModalProps> = (
  props: GraderSelectModalProps
) => {
  const { isOpen, onClose, onSelect, value } = props;

  const [selectedValue, setSelectedValue] = useState<GraderType>();

  return (
    <Modal
      className={`modal-confirmation`}
      centered
      maskClosable
      open={isOpen}
      footer={null}
      onCancel={onClose}
    >
      <div className={styles.deliveryContainer}>
        <SelectComponent
          title="Pilih Grader"
          data={["Jopie", "Evan"]}
          placeholder="Pilih grader terlebih dahulu"
          value={selectedValue || value}
          onChange={(val: GraderType) => {
            setSelectedValue(val);
            onSelect(val);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
};

export default GraderSelectModal;
