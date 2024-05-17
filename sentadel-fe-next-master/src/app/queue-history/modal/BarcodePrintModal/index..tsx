import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import styles from "./styles.module.scss";
import { queueDataType } from "@/types/queue";
import moment from "moment";
// import { QRCode } from "react-qrcode-logo";
import Barcode from "react-barcode";
import { QueuePrintParams } from "../../page";

type promiseResolveType = (value?: any) => void;

interface BarcodePrintModalProps {
  isOpen: boolean;
  params: QueuePrintParams;
  onClose: () => void;
}

const BarcodePrintModal: React.FC<BarcodePrintModalProps> = (
  props: BarcodePrintModalProps
) => {
  const { isOpen, params, onClose } = props;
  const dispatch = useDispatch();

  const printRef = useRef<HTMLDivElement | null>(null);
  const promiseResolveRef = useRef<promiseResolveType | null>(null);

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        promiseResolveRef.current = resolve;
        setIsPrinting(true);
        dispatch({
          type: "",
          param: {
            body: null,
          },
        });
      });
    },
    onAfterPrint: () => {
      promiseResolveRef.current = null;
      setIsPrinting(false);
    },
  });

  useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      promiseResolveRef.current();
    }
  }, [isPrinting]);

  const renderLabelCard = useCallback(
    (barcode: string, idx: number, e: queueDataType) => {
      return (
        <div key={idx.toString()} className={styles.labelCard}>
          <div className={styles.barcodeSection}>
            <Barcode
              value={barcode}
              format="CODE128"
              displayValue
              width={1.2}
              height={50}
            />
          </div>
          <div className={styles.rowInformation}>
            <div>T. Pengajuan</div>
            <div>{moment(e.created_at).format("DD-MMM-YYYY")}</div>
          </div>
        </div>
      );
    },
    []
  );

  return (
    <ConfirmationModal
      open={isOpen}
      title={`Apakah kamu yakin akan mencetak barcode untuk ${params.data.length} antrian`}
      confirm="Cetak"
      cancel="Kembali"
      onConfirm={handlePrint}
      onClose={onClose}
      width={"230mm"}
    >
      <div className={`${styles.pageContainer} ${styles.modalView}`}>
        {params.data.map((e) =>
          e.serial_codes?.map((e1, idx) => renderLabelCard(e1, idx, e))
        )}
      </div>
      {isPrinting && (
        <div className="display-none">
          <div
            ref={printRef}
            className={`${styles.pageContainer} ${styles.printView}`}
          >
            {params.data.map((e) =>
              e.serial_codes?.map((e1, idx) => renderLabelCard(e1, idx, e))
            )}
          </div>
        </div>
      )}
    </ConfirmationModal>
  );
};

export default BarcodePrintModal;
