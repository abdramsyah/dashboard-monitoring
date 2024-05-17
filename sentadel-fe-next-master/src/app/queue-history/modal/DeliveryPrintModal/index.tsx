import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { QueuePrintParams } from "../../page";
import styles from "./styles.module.scss";
import Barcode from "react-barcode";
import moment from "moment";

type promiseResolveType = (value?: any) => void;

interface BarcodePrintModalProps {
  isOpen: boolean;
  params: QueuePrintParams;
  onClose: () => void;
}

const DeliveryPrintModal: React.FC<BarcodePrintModalProps> = (
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

  const renderBody = () => {
    return (
      <div className={styles.deliveryContainer}>
        <div className={styles.kopTitle}>SURAT DO PENGIRIMAN</div>
        <div className={styles.header}>
          <div className={styles.params}>
            <div className={styles.rowParam}>
              <div className={styles.title}>Tanggal</div>
              <div>: {moment(params.deliveryDate).format("DD MMM YYYY")}</div>
            </div>
            <div className={styles.rowParam}>
              <div className={styles.title}>Nama</div>
              <div>: {params.coordinatorName}</div>
            </div>
            <div className={styles.rowParam}>
              <div className={styles.title}>Jumlah Keranjang</div>
              <div>
                :{" "}
                {params.data.reduce(
                  (prev, val) => prev + (val.serial_codes?.length || 0),
                  0
                )}
              </div>
            </div>
            <div className={styles.rowParam}>
              <div className={styles.title}>Berlaku Sampai</div>
              <div>: -</div>
            </div>
          </div>
          <div>
            <Barcode
              value={params.deliveryNumber || ""}
              format="CODE128"
              displayValue
              width={1.2}
              height={50}
            />
          </div>
        </div>
        <table className={styles.tableQueue}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.thNo}>No</th>
              <th className={styles.thSeri}>Seri</th>
              <th className={styles.thFarmer}>Nama Petani</th>
              <th className={styles.thProductType}>Jenis Produk</th>
              <th className={styles.thStatus}>Status</th>
              <th className={styles.thInvoice}>No. Invoice</th>
              <th className={styles.thDesc}>Ket</th>
            </tr>
          </thead>
          <tbody>
            {params.data.map((e, idx) => {
              return e.serial_codes?.map((code, cIdx) => {
                const num = () => {
                  if (idx === 0) return (cIdx + 1).toString();

                  if (params.data[idx - 1]) {
                    const sumNum = params.data
                      .slice(0, idx)
                      .reduce(
                        (prev, val) => prev + (val.serial_codes?.length || 0),
                        0
                      );
                    return (sumNum + cIdx + 1).toString();
                  }
                };

                return (
                  <tr key={num()}>
                    <td>{num()}</td>
                    <td>{code}</td>
                    <td>{e.farmer_name}</td>
                    <td>{e.product_type}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <ConfirmationModal
      open={isOpen}
      title={`Apakah kamu yakin akan mencetak DO dengan nomor ${params.deliveryNumber}?`}
      confirm="Cetak"
      cancel="Kembali"
      onConfirm={handlePrint}
      onClose={onClose}
      width={"230mm"}
    >
      {
        <div ref={printRef} className={`${styles.modalView}`}>
          {renderBody()}
        </div>
      }
      {/* <div className={`${styles.pageContainer} ${styles.modalView}`}>
        {params.data.map((e) =>
          e.serial_codes?.map((e1, idx) => renderLabelCard(e1, idx, e))
        )}
      </div> */}
      {isPrinting && (
        <div className="display-none">
          <div ref={printRef} className={`${styles.printView}`}>
            {renderBody()}
          </div>
        </div>
      )}
    </ConfirmationModal>
  );
};

export default DeliveryPrintModal;
