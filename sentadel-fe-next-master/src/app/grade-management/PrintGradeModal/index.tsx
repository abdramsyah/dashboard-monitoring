import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import styles from "./styles.module.scss";
import Barcode from "react-barcode";
import { GradeManagementModel, GroupedGradeModel } from "@/types/grades";

type promiseResolveType = (value?: any) => void;

interface PrintGradeModalProps {
  isOpen: boolean;
  params: GradeManagementModel["grouped_grade"];
  onClose: () => void;
}

const PrintGradeModal: React.FC<PrintGradeModalProps> = (
  props: PrintGradeModalProps
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

  const renderLabelCard = useCallback((item: GroupedGradeModel) => {
    return (
      <div key={item.grade} className={styles.labelCard}>
        <div className={styles.barcodeSection}>
          <Barcode
            value={item.grade}
            format="CODE128"
            displayValue
            width={2.5}
            height={50}
          />
        </div>
      </div>
    );
  }, []);

  return (
    <ConfirmationModal
      open={isOpen}
      title={`Cetak ${params.reduce(
        (prev, val) => prev + val.grades.length,
        0
      )} grade`}
      confirm="Cetak"
      cancel="Kembali"
      onConfirm={handlePrint}
      onClose={onClose}
      width={"230mm"}
    >
      <div className={`${styles.pageContainer} ${styles.modalView}`}>
        {params.map((e) => e.grades?.map(renderLabelCard))}
      </div>
      {isPrinting && (
        <div className="display-none">
          <div
            ref={printRef}
            className={`${styles.pageContainer} ${styles.printView}`}
          >
            {params.map((e) => e.grades?.map(renderLabelCard))}
          </div>
        </div>
      )}
    </ConfirmationModal>
  );
};

export default PrintGradeModal;
