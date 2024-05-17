import React from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  CreateGradeResponseData,
  GradeManagementModelRequstProps,
  GradeModelEnum,
  GradeRequestModelEnum,
} from "@/types/grades";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import { useFieldArray, useForm } from "react-hook-form";
import nProgress from "nprogress";
import { gradeManagementFormEditList } from "@/constants/grades";
import { ClientModel } from "@/types/clients";
import styles from "./styles.module.scss";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import { toast } from "react-toastify";

interface CreateGradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  gradeListParams: any;
}

const CreateGradeForm: React.FC<CreateGradeFormProps> = (
  props: CreateGradeFormProps
) => {
  const { isOpen, onClose, gradeListParams } = props;

  const methods = useForm<GradeManagementModelRequstProps>({
    defaultValues: {
      grades: [{}],
    },
    mode: "onBlur",
  });

  const gradesFields = useFieldArray({
    name: GradeRequestModelEnum.GRADES,
    control: methods.control,
  });

  const dispatch = useDispatch();

  const { clientData }: { clientData: { data?: ClientModel[] } } = useSelector(
    ({ clientManagement }) => clientManagement
  );

  const onSuccessSaga = (data?: CreateGradeResponseData) => {
    if (
      data?.[GradeRequestModelEnum.CREATED] ||
      data?.[GradeRequestModelEnum.DUPLICATE]
    ) {
      data?.[GradeRequestModelEnum.CREATED]?.forEach((e) => {
        const index = e[GradeModelEnum.INDEX];
        if (index) {
          methods.setError(`grades.${index - 1}.grade`, {
            message: "Grade sudah ada",
          });
        }
      });
      data?.[GradeRequestModelEnum.DUPLICATE]?.forEach((e) => {
        const index = e[GradeModelEnum.INDEX];
        if (index) {
          methods.setError(`grades.${index - 1}.grade`, {
            message: "Duplikat di form yang sama",
          });
        }
      });
    } else {
      onClose();
      toast.success(
        <MessageSuccess msg={"Semua grade berhasil ditambahkan"} />,
        {
          className: "toast-message-success",
        }
      );
    }

    const failResLen =
      (data?.[GradeRequestModelEnum.CREATED]?.length || 0) +
      (data?.[GradeRequestModelEnum.DUPLICATE]?.length || 0);

    if (failResLen !== data?.[GradeRequestModelEnum.GRADES].length)
      dispatch({
        type: "gradeDictionary/GET_GRADE_LIST",
        param: gradeListParams,
      });
  };

  const onFinishSaga = () => {
    nProgress.done();
    // onClose();
  };

  const submitRequest = (formData: GradeManagementModelRequstProps) => {
    nProgress.start();

    console.log("asdad - formData", formData);

    dispatch({
      type: "gradeDictionary/CREATE_GRADE",
      param: { body: formData, onFinishSaga, onSuccessSaga },
    });
  };

  return (
    <Modal
      className="modalEdit"
      open={isOpen}
      onCancel={onClose}
      styles={{
        body: { overflowY: "auto", maxHeight: "calc(100vh - 200px)" },
      }}
      width={1000}
      footer={null}
    >
      <div>
        <h4>{"Tambah Grade"}</h4>
        <div>
          <ReactFormBuilder
            grouped={false}
            wrapped={false}
            methods={methods}
            formList={(_) =>
              gradeManagementFormEditList(
                clientData?.data || [],
                gradesFields,
                {
                  gradeInput: styles.gradeInput,
                  quotaInput: styles.quotaInput,
                  priceInput: styles.priceInput,
                }
              )
            }
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

export default CreateGradeForm;
