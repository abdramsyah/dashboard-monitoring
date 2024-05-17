import React, { memo } from "react";
import Barcode from "react-barcode";
import dayjs from "dayjs";
import {
  getPurchaseInvoiceDetail,
  manageInvoiceStatus,
} from "@/api/queries/fetch";
import { MUTATION_KEY, QUERY_KEY } from "@/api/queries/key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/util/commons";
import { BucketData } from "@/types/purchase";
import { toast } from "react-toastify";
import MessageError from "@/components/Notification/MessageError";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import nProgress from "nprogress";
import { ErrorResponseType } from "@/types/global";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import styles from "./styles.module.scss";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  invoiceId: number;
  onClose: () => void;
  refectMain: () => void;
}

const RenderItem = ({ item, idx }: { item: BucketData; idx: number }) => {
  return (
    <tr
      key={idx.toString()}
      className={`${idx % 2 !== 0 ? styles.evenRow : ""}`}
    >
      <td>{idx + 1}</td>
      <td>{item.serial_number}</td>
      <td>{item.farmer_name}</td>
      <td>
        {item.purchase_gross_weight
          ? (item.purchase_gross_weight / 1000).toFixed(2)
          : ""}
      </td>
      <td>
        {item.purchase_net_weight
          ? (item.purchase_net_weight / 1000).toFixed(2)
          : ""}
      </td>
      <td>{item.unit_price ? formatCurrency(item.unit_price, true) : ""}</td>
      <td>
        {item.unit_price ? formatCurrency(item.purchase_price, true) : ""}
      </td>
    </tr>
  );
};

const MemoizeItem = memo(RenderItem);

const InvoiceApprovalModal: React.FC<InvoiceDetailModalProps> = (
  props: InvoiceDetailModalProps
) => {
  const { isOpen, invoiceId, onClose, refectMain } = props;

  const { data, isFetching } = useQuery({
    queryFn: () => getPurchaseInvoiceDetail(invoiceId),
    queryKey: [QUERY_KEY.GET_PURCHASE_INVOICE_DETAIL],
    refetchInterval: false,
  });

  const onSuccess = () => {
    toast.success(<MessageSuccess msg={"Validasi sukses"} />, {
      className: "toast-message-success",
    });
    refectMain();
    onClose();
    nProgress.done();
  };

  const onError = (
    err: ErrorResponseType<{ data?: unknown; message?: string }>
  ) => {
    toast.error(
      <MessageError msg={`Terjadi kesalahan, ${err.response?.data || err}`} />,
      { className: "toast-message-error" }
    );
    nProgress.done();
  };

  const { mutate } = useMutation({
    mutationFn: manageInvoiceStatus,
    mutationKey: [MUTATION_KEY.MANAGE_INVOICE_STATUS],
    onSuccess,
    onError,
  });

  const headerValueList = [
    {
      title: "Tanggal",
      value: dayjs(data?.data.data.invoice_date || "").format("DD MMM YYYY"),
    },
    {
      title: "Nama",
      value: data?.data.data.coordinator_name,
    },
    {
      title: "Jumlah Keranjang",
      value: data?.data.data.bucket_quantity,
    },
  ];

  const receivedValue = () => {
    const accumInvoiceRepayment = data?.data.data.repayment_list?.reduce(
      (prev, curr) => prev + curr.value,
      0
    );

    return (
      (data?.data.data.purchase_price_accum || 0) -
      (data?.data.data.tax_price || 0) -
      (data?.data.data.fee_price || 0) -
      (accumInvoiceRepayment || 0)
    );
  };

  const renderBody = () => {
    return (
      <div className={styles.deliveryContainer}>
        <div className={styles.header}>
          <div className={styles.params}>
            {headerValueList.map((e, idx) => (
              <div key={idx.toString()} className={styles.rowParam}>
                <div className={styles.title}>{e.title}</div>
                <div>: {isFetching ? "-" : e.value}</div>
              </div>
            ))}
          </div>
          <div>
            <Barcode
              value={data?.data.data.invoice_number || "-"}
              format="CODE128"
              displayValue
              width={1.2}
              height={50}
            />
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.tableQueue}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.thNo}>No</th>
                <th className={styles.thSeri}>Seri</th>
                <th className={styles.thFarmer}>Petani</th>
                <th className={styles.thBK}>BK</th>
                <th className={styles.thBK}>BB</th>
                <th className={styles.thPrice}>Harga</th>
                <th className={styles.thPrice}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.data.bucket_list?.map((item, idx) => {
                return (
                  <MemoizeItem key={idx.toString()} item={item} idx={idx} />
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className={styles.footTitle}>
                  Jumlah
                </td>
                <td className={styles.footTotal}>
                  {formatCurrency(data?.data.data.purchase_price_accum, true)}
                </td>
              </tr>
            </tfoot>
          </table>
          <div className={styles.taxAndFeeContainer}>
            <div className={styles.invoiceRepaymentRow}>
              <div className={`${styles.flex15} ${styles.textWeight600}`}>
                Potongan
              </div>
              <div className={styles.flex2}>{`${
                data?.data.data.bucket_quantity
              } x ${formatCurrency(data?.data.data.fee_value, true)}`}</div>
              <div className={`${styles.flex2} ${styles.textAlignEnd}`}>
                {formatCurrency(data?.data.data.fee_price, true)}
              </div>
            </div>
            <div className={styles.invoiceRepaymentRow}>
              <div className={`${styles.flex15} ${styles.textWeight600}`}>
                Pajak
              </div>
              <div className={styles.flex2}>{`${formatCurrency(
                data?.data.data.purchase_price_accum,
                true
              )} x ${data?.data.data.tax_value}%`}</div>
              <div className={`${styles.flex2} ${styles.textAlignEnd}`}>
                {formatCurrency(data?.data.data.tax_price, true)}
              </div>
            </div>
          </div>
          <div className={styles.invoiceRpaymentTitle}>Potongan Pinjaman</div>
          <div className={styles.invoiceRpaymentContainer}>
            {data?.data.data.repayment_list?.map((item) => {
              return (
                <div
                  className={styles.invoiceRepaymentRow}
                  key={item.loan_code}
                >
                  <div className={styles.flex15}>- {item.loan_code}</div>
                  <div className={styles.flex2}>{item.reference_name}</div>
                  <div className={`${styles.flex2} ${styles.textAlignEnd}`}>
                    {formatCurrency(item.value, true)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.horizontalLine}></div>
          <div className={styles.receivedValueContainer}>
            <div className={`${styles.flex15} ${styles.textWeight700}`}>
              Jumlah Diterima
            </div>
            <div className={styles.flex2}></div>
            <div
              className={`${styles.flex2} ${styles.textAlignEnd} ${styles.textWeight700}`}
            >
              {formatCurrency(receivedValue(), true)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ConfirmationModal
      open={isOpen}
      closable
      width={"240mm"}
      title="Invoice Approval"
      onConfirm={() => {
        if (data?.data.data.invoice_id) {
          mutate({
            invoice_id: data?.data.data.invoice_id,
            status: "APPROVED",
          });
        }
      }}
      confirm="Terima"
      onCancel={() => {
        if (data?.data.data.invoice_id) {
          mutate({
            invoice_id: data?.data.data.invoice_id,
            status: "REJECTED",
          });
        }
      }}
      cancel="Tolak"
      styles={{
        body: {
          height: "92vh",
          overflow: "hidden",
        },
      }}
      onClose={onClose}
    >
      <div className={styles.invoiceDetail}>{renderBody()}</div>
    </ConfirmationModal>
  );
};

export default InvoiceApprovalModal;
