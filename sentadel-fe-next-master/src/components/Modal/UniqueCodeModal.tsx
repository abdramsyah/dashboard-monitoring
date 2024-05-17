import React, { useState } from "react";
import { Modal } from "antd";
import ButtonComponent from "../Button/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "..";

interface UniqueCodeModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  onSuccess: (code: string) => void;
  mode?: "validate" | "validateBurn";
  onFailed?: (err: string) => void;
}

const modeData = {
  validate: {
    action: "uniqueCodeGenerator/VALIDATE",
    title: "Unique Code Validation",
  },
  validateBurn: {
    action: "uniqueCodeGenerator/VALIDATE_AND_BURN",
    title: "Unique Code Validation & Burn",
  },
};

const UniqueCodeModal = (props: UniqueCodeModalProps) => {
  const {
    isModalOpen,
    setIsModalOpen,
    onSuccess,
    mode = "validate",
    onFailed,
  } = props;
  const dispatch = useDispatch();
  const [uniqueCode, setUniqueCode] = useState<string>("");
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const { loading } = useSelector(
    ({ uniqueCodeGenerator }) => uniqueCodeGenerator
  );

  const onFinished = (validated: boolean) => {
    if (validated) {
      setIsModalOpen(false);
      if (onSuccess && uniqueCode) {
        onSuccess(uniqueCode);
      }
    } else {
      setIsModalOpen(false);
      setUniqueCode("");
    }
  };

  return (
    <>
      <Modal
        className="modalEdit"
        open={isModalOpen}
        onOk={handleOk}
        width="540px"
        onCancel={handleCancel}
        bodyStyle={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
        footer={null}
      >
        <h4>{modeData[mode].title}</h4>
        <div className="formInput">
          <div className="fieldBox">
            <label htmlFor="unique_code">Unique Code</label>
            <Input
              placeholder="Unique Code"
              className="form"
              value={uniqueCode}
              onChange={(e) => setUniqueCode(e.target.value)}
            />
          </div>
        </div>
        <ButtonComponent
          className="submitButton"
          disabled={!uniqueCode || loading}
          loading={loading}
          onClick={() => {
            dispatch({
              type: modeData[mode].action,
              param: { uniqueCode, onFinished },
            });
          }}
        >
          Validasi
        </ButtonComponent>
      </Modal>
    </>
  );
};

export default UniqueCodeModal;
