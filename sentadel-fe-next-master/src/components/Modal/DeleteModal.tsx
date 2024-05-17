import { Modal } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import ButtonComponent from "../Button/CustomButton";
import { useDispatch } from "react-redux";

export interface DeleteModalProps {
  action?: string;
  id?: number;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  params?: any;
}

const DeleteModal = (props: DeleteModalProps) => {
  const { action, id, isModalOpen, setIsModalOpen, params } = props;
  const dispatch = useDispatch();

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    dispatch({ type: action, param: { id, setIsModalOpen, params } });
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

        <h4>Are you sure you want to delete this data?</h4>
        <p>You can&#96;t undo this action</p>
        <div className="action">
          <ButtonComponent className="cancelButton" onClick={handleCancel}>
            Cancel
          </ButtonComponent>

          <ButtonComponent className="deleteButton" onClick={handleDelete}>
            Delete
          </ButtonComponent>
        </div>
      </Modal>
    </>
  );
};

export default DeleteModal;
