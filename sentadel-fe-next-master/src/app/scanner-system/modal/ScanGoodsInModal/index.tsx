import { Modal } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import ScannerBarcode from "@/assets/svg/icon/barcode";
import styles from "./styles.module.scss";
import Table, { ColumnsType } from "antd/es/table";
import { useDispatch } from "react-redux";
import { BarcodeScannerCamera } from "@/components/BarcodeScannerCamera";
import { useMediaQuery } from "@/util/hooks/useMediaQuery";
import Chip from "@/components/Chip";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import nProgress from "nprogress";
import moment from "moment";
import {
  ScannedStatusEnum,
  BarcodeScanListType,
  ConfirmationModalCtrlType,
  CreateGoodsResModel,
} from "@/types/queue";
import { bucketStatusTheme, bucketStatusTranslate } from "@/constants/queue";

moment.locale("id");

interface ScanGoodsInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScanGoodsInModal = (props: ScanGoodsInModalProps) => {
  const { isOpen, onClose } = props;

  const dispatch = useDispatch();

  const isXs = useMediaQuery(800);

  const [barcodeScanList, setBarcodeScanList] = useState<BarcodeScanListType[]>(
    []
  );
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [confirmationModalCtrl, setConfrimationModalCtrl] =
    useState<ConfirmationModalCtrlType>({
      open: false,
    });

  const getStatusMessage = (res: CreateGoodsResModel) => {
    switch (res.current_status) {
      case ScannedStatusEnum.AlreadyApproved:
        return `Sudah diterima pada ${moment(res.transaction_date || "").format(
          "D MMM YYYY HH:mm"
        )}`;

      case ScannedStatusEnum.AlreadyRejected:
        return `Sudah ditolak pada ${moment(res.transaction_date || "").format(
          "D MMM YYYY HH:mm"
        )}`;

      default:
        break;
    }
  };

  const onFinishSaga = () => {
    setConfrimationModalCtrl({ open: false });
    nProgress.done();
  };

  const onSuccess = (res: CreateGoodsResModel) => {
    setBarcodeScanList((state) => {
      const message = getStatusMessage(res);
      const newBarcode: BarcodeScanListType = {
        key: state.length + 1,
        serial_number: res.serial_number || "",
        status: res.current_status,
        message,
      };

      return [newBarcode, ...state];
    });
  };

  const onClickStatus = (status: ScannedStatusEnum) => {
    nProgress.start();
    dispatch({
      type: "queueRequest/POUR_OUT_BUCKET",
      param: {
        body: {
          data: [
            {
              serial_number: confirmationModalCtrl.serialNumber,
              status,
            },
          ],
        },
        onSuccess,
        onFinishSaga,
      },
    });
  };

  const columns: ColumnsType<BarcodeScanListType> = [
    {
      title: "No",
      dataIndex: "key",
    },
    {
      title: "Barcode",
      dataIndex: "serial_number",
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   render: (item: BarcodeScanListType["status"]) => (
    //     <span>
    //       {item === ScannedStatusEnum.Loading ? (
    //         <ClipLoader
    //           loading={item === ScannedStatusEnum.Loading}
    //           size={20}
    //           color="#eee"
    //         />
    //       ) : (
    //         item
    //       )}
    //     </span>
    //   ),
    // },
    {
      title: "Catatan",
      dataIndex: "message",
    },
  ];

  const renderScannedBucketCard = useCallback(
    (item: BarcodeScanListType, idx: number) => {
      return (
        <div key={idx.toString()} className={styles.barcodeCard}>
          <div className={styles.barcode}>
            {item.status && item.serial_number && (
              <Chip theme={bucketStatusTheme[item.status]}>
                {item.serial_number}
              </Chip>
            )}
          </div>
          {item.message && <div className={styles.message}>{item.message}</div>}
          <div className={styles.status}>
            {item.status && (
              <Chip theme={bucketStatusTheme[item.status]}>
                {bucketStatusTranslate[item.status]}
              </Chip>
            )}
          </div>
        </div>
      );
    },
    []
  );

  const renderResult = () => {
    if (isXs) {
      return (
        <div className={styles.barcodeListContainer}>
          {barcodeScanList.map(renderScannedBucketCard)}
        </div>
      );
    }

    return <Table columns={columns} dataSource={barcodeScanList} />;
  };

  const renderCamera = useMemo(
    () => (
      <BarcodeScannerCamera
        onResult={(result) =>
          setConfrimationModalCtrl((state) => {
            if (state.open) {
              // return state;
            }
            return {
              open: true,
              serialNumber: result.getText(),
            };
          })
        }
        onError={(error) =>
          console.log("barcode-scanner - error", error.message)
        }
        timeBetweenDecodingAttempts={2000}
        className={styles.halfCamera}
      />
    ),
    []
  );

  const renderBody = () => {
    if (isCameraOpen) {
      return (
        <>
          {renderCamera}
          <div>{renderResult()}</div>
        </>
      );
    }

    return (
      <>
        <div>Pindai menggunakan pemindai eksternal</div>
        <div>atau</div>
        <div
          className={`${styles.selectionCard} ${styles.sectionTouchable}`}
          onClick={() => {
            setCameraOpen(true);
          }}
        >
          <ScannerBarcode fill="#fff" width={200} height={200} opacity={0.8} />
          <div>Buka Camera</div>
        </div>
      </>
    );
  };

  return (
    <div>
      <Modal
        open={isOpen}
        className={`modal-full`}
        footer={null}
        onCancel={onClose}
      >
        <div
          className={`${styles.modalFull} ${
            isCameraOpen ? styles.onScanContainer : "centered-content"
          }`}
        >
          {renderBody()}
        </div>
        {confirmationModalCtrl.open && (
          <ConfirmationModal
            open={confirmationModalCtrl.open}
            onConfirm={() => onClickStatus(ScannedStatusEnum.Approve)}
            confirm="Terima"
            onClose={() => onClickStatus(ScannedStatusEnum.Reject)}
            cancel="Tolak"
            title="Proses barang ini"
            loading={nProgress.isStarted()}
          />
        )}
      </Modal>
    </div>
  );
};

export default ScanGoodsInModal;
