import { RoleEnum } from "@/types/auth";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import { barcodeSellingFormList } from "@/constants/barcodeSystem";
import {
  BarcodeSellingForm,
  BarcodeSellingPayload,
  BarcodeSellingPayloadEnum,
  ClientBarcodeGroupModel,
  ClientBarcodeModel,
} from "@/types/barcodeSystem";
import { ClientModel } from "@/types/clients";
import { UserManagementModel } from "@/types/users";
import { Modal } from "antd";
import nProgress from "nprogress";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles.module.scss";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";

type promiseResolveType = (value?: any) => void;

interface BarcodeSellingCreateFormProps {
  isModalOpen: boolean;
  params: any;
  onClose: () => void;
}

const BarcodeSellingCreateForm: React.FC<BarcodeSellingCreateFormProps> = (
  props: BarcodeSellingCreateFormProps
) => {
  const { isModalOpen, params, onClose } = props;

  const dispatch = useDispatch();

  const printRef = useRef<HTMLDivElement | null>(null);
  const promiseResolveRef = useRef<promiseResolveType | null>(null);

  const [printData, setPrintData] = useState<ClientBarcodeGroupModel>();
  const [isPrinting, setIsPrinting] = useState(false);

  const { adminEntry } = useSelector(({ barcodeSystem }) => barcodeSystem);

  const { clientData } = useSelector(
    ({ clientManagement }) => clientManagement
  );

  const methods = useForm<BarcodeSellingForm>({
    mode: "onBlur",
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        promiseResolveRef.current = resolve;
        setIsPrinting(true);
        nProgress.done();
      });
    },
    onAfterPrint: () => {
      promiseResolveRef.current = null;
      setIsPrinting(false);
      onClose();
    },
  });

  const onSuccessSaga = (data: ClientBarcodeGroupModel) => {
    console.log("asdad - onSuccessSaga - data", data);
    setPrintData(data);
    // dispatch({ type: "userManagement/GET_USER_LIST", param: userListParams });
  };

  const onFinishSaga = () => {
    handlePrint();
  };

  const submitRequest = (formData: BarcodeSellingForm) => {
    const newForm: BarcodeSellingPayload = {
      assignee_id: JSON.parse(formData[BarcodeSellingPayloadEnum.ASSIGNEE_ID])
        .id,
      client_id: JSON.parse(formData[BarcodeSellingPayloadEnum.CLIENT_ID]).id,
      quantity: parseInt(formData[BarcodeSellingPayloadEnum.QUANTITY]),
    };

    nProgress.start();
    dispatch({
      type: "barcodeSystem/CREATE_BARCODE_SALES",
      param: { body: newForm, onFinishSaga, onSuccessSaga },
    });
  };

  useEffect(() => {
    dispatch({ type: "barcodeSystem/GET_ADMIN_ENTRY" });
    dispatch({ type: "clientManagement/GET_DATA" });
  }, [dispatch]);

  useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      promiseResolveRef.current();
    }
  }, [isPrinting]);

  const renderLabelCard = useCallback((model: ClientBarcodeModel) => {
    return (
      <div key={model.code_id.toString()} className={styles.labelCard}>
        <div className={styles.barcodeSection}>
          <Barcode
            value={model.code}
            format="CODE128"
            displayValue
            width={1.5}
            height={60}
          />
        </div>
      </div>
    );
  }, []);

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
          formList={(_) =>
            barcodeSellingFormList({
              assignee_id: adminEntry?.data as UserManagementModel[],
              client_id: clientData?.data as ClientModel[],
            })
          }
          onSubmit={submitRequest}
          buttonProps={{
            title: "Buat Antrian",
            customClassName: "button-custom",
            loading: nProgress.isStarted(),
          }}
        />
      </div>
      {printData && isPrinting && (
        <div className="display-none">
          <div
            ref={printRef}
            className={`${styles.pageContainer} ${styles.printView}`}
          >
            {printData?.codes?.map(renderLabelCard)}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BarcodeSellingCreateForm;
