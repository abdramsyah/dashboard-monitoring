import { Modal } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import ButtonComponent from "../Button/CustomButton";
import { useDispatch } from "react-redux";
import { DeleteModalProps } from "@/components/Modal/DeleteModal";

interface RejectModalProps extends DeleteModalProps {
  setBody: (val: any) => void;
}

const RejectModal = (props: RejectModalProps) => {
  const { action, id, isModalOpen, setIsModalOpen, params, setBody } = props;
  const dispatch = useDispatch();

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleReject = () => {
    dispatch({ type: action, param: { id, setIsModalOpen, params, setBody } });
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        className="modalDelete"
        centered
        closable={false}
        open={isModalOpen}
        onOk={handleOk}
        footer={null}
      >
        <CloseCircleFilled className="alertIcon" />

        <h4>Are you sure you want to reject this data?</h4>
        <p>You can&#96;t undo this action</p>
        <div className="action">
          <ButtonComponent className="cancelButton" onClick={handleCancel}>
            Cancel
          </ButtonComponent>

          <ButtonComponent className="deleteButton" onClick={handleReject}>
            Reject
          </ButtonComponent>
        </div>
      </Modal>
    </>
  );
};

export default RejectModal;
