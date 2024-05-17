import React, { useCallback } from "react";
import styles from "./styles.module.scss";
import { Modal, Skeleton } from "antd";
import { getStockDetail } from "@/api/queries/fetch";
import { QUERY_KEY } from "@/api/queries/key";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDateTime } from "@/util/commons";
import {
  GetStockDetailModel,
  GradeInfoDataModel,
  PurchaseInfoDataModel,
  WeightInfoDataModel,
} from "@/types/stock";

interface StockDetailModalProps {
  isOpen: boolean;
  serialNumber: string;
  onClose: () => void;
}

const headerValueList = (stokDetail?: GetStockDetailModel) => [
  {
    title: "Koordinator",
    value: stokDetail?.coordinator_name,
  },
  {
    title: "Petani",
    value: stokDetail?.farmer_name,
  },
  {
    title: "Nomor Seri",
    value: stokDetail?.serial_number,
  },
];

const StockDetailModal: React.FC<StockDetailModalProps> = (
  props: StockDetailModalProps
) => {
  const { isOpen, serialNumber, onClose } = props;

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getStockDetail(serialNumber),
    queryKey: [QUERY_KEY.GET_STOCK_DETAIL],
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const renderGradeItem = useCallback(
    (item: GradeInfoDataModel, idx: number) => {
      return (
        <tr
          key={idx.toString()}
          className={`${idx % 2 !== 0 ? styles.evenRow : ""}`}
        >
          <td>{idx + 1}</td>
          <td>{formatDateTime(item.created_at)}</td>
          <td>
            {item.grade} - {item.client_code}
          </td>
          <td>{item.sales_code}</td>
          <td>
            {`${formatCurrency(item.unit_price, true)} / ${formatCurrency(
              item.grade_price,
              true
            )}`}
          </td>
          <td>{item.grader}</td>
          <td>{item.created_by}</td>
        </tr>
      );
    },
    []
  );

  const renderWeightItem = useCallback(
    (item: WeightInfoDataModel, idx: number) => {
      return (
        <tr
          key={idx.toString()}
          className={`${idx % 2 !== 0 ? styles.evenRow : ""}`}
        >
          <td>{idx + 1}</td>
          <td>{formatDateTime(item.created_at)}</td>
          <td>{item.gross_weight / 1000}</td>
          <td>{item.created_by}</td>
        </tr>
      );
    },
    []
  );

  const renderPurchaseItem = useCallback(
    (item: PurchaseInfoDataModel, idx: number) => {
      return (
        <tr
          key={idx.toString()}
          className={`${idx % 2 !== 0 ? styles.evenRow : ""}`}
        >
          <td>{idx + 1}</td>
          <td>{formatDateTime(item.created_at)}</td>
          <td>
            {item.grade} - {item.client_code}
          </td>
          <td>{item.sales_code}</td>
          <td>
            {`${formatCurrency(item.unit_price, true)} / ${formatCurrency(
              item.grade_price,
              true
            )}`}
          </td>
          <td>{item.grader}</td>
          <td>{item.purchase_gross_weight / 1000}</td>
          <td>{item.purchase_net_weight / 1000}</td>
          <td>{item.invoice_number || "-"}</td>
          <td>{item.created_by}</td>
        </tr>
      );
    },
    []
  );

  return (
    <Modal
      className={`modal-confirmation`}
      centered
      maskClosable
      open={isOpen}
      footer={null}
      width={"360mm"}
      onCancel={onClose}
      styles={{
        body: {
          height: "92vh",
          overflow: "hidden",
        },
      }}
    >
      {isFetching ? (
        <Skeleton />
      ) : (
        <div className={styles.deliveryContainer}>
          <div className={styles.header}>
            <div className={styles.params}>
              {headerValueList(data?.data.data).map((e, idx) => (
                <div key={idx.toString()} className={styles.rowParam}>
                  <div className={styles.title}>{e.title}</div>
                  <div>: {e.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className={styles.tableTitle}>Data Pembelian</div>
            <div className={`${styles.tableWrapper} no-scrollbar`}>
              <table className={styles.tableQueue}>
                <thead className={styles.thead}>
                  <tr>
                    <th className={styles.thNo}>No</th>
                    <th className={styles.thSeri}>Tanggal Beli</th>
                    <th className={styles.thSeri}>Grade</th>
                    <th className={styles.thFarmer}>Barcode Penjualan</th>
                    <th className={styles.thPrice}>Harga</th>
                    <th className={styles.thPrice}>Grader</th>
                    <th className={styles.thPrice}>BB</th>
                    <th className={styles.thPrice}>BK</th>
                    <th className={styles.thPrice}>Invoice</th>
                    <th className={styles.thPrice}>Pengguna</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.data.purchase_info_data_list?.map(
                    renderPurchaseItem
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              gap: "20px",
            }}
          >
            <div className={styles.flex3}>
              <div className={styles.tableTitle}>Data Grading</div>
              <div className={`${styles.tableWrapper} no-scrollbar`}>
                <table className={styles.tableQueue}>
                  <thead className={styles.thead}>
                    <tr>
                      <th className={styles.thNo}>No</th>
                      <th className={styles.thSeri}>Tanggal Grade</th>
                      <th className={styles.thSeri}>Grade</th>
                      <th className={styles.thFarmer}>Barcode Penjualan</th>
                      <th className={styles.thPrice}>Harga</th>
                      <th className={styles.thPrice}>Grader</th>
                      <th className={styles.thPrice}>Pengguna</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data.data.grade_info_data_list?.map(renderGradeItem)}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.flex15}>
              <div className={styles.tableTitle}>Data Timbangan</div>
              <div className={`${styles.tableWrapper} no-scrollbar`}>
                <table className={styles.tableQueue}>
                  <thead className={styles.thead}>
                    <tr>
                      <th className={styles.thNo}>No</th>
                      <th className={styles.thSeri}>Tanggal Timbang</th>
                      <th className={styles.thSeri}>Berat Timbangan</th>
                      <th className={styles.thPrice}>Pengguna</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data.data.weight_info_data_list?.map(
                      renderWeightItem
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StockDetailModal;
