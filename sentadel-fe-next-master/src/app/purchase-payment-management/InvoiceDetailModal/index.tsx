import React, { Ref, memo, useEffect, useRef, useState } from "react";
import Barcode from "react-barcode";
import styles from "./styles.module.scss";
import dayjs from "dayjs";
import { Modal, Skeleton } from "antd";
import {
  getPurchaseInvoiceDetail,
  manageInvoiceStatus,
  postRepayment,
} from "@/api/queries/fetch";
import { MUTATION_KEY, QUERY_KEY } from "@/api/queries/key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deformatCurrency, formatCurrency } from "@/util/commons";
import { BucketData } from "@/types/purchase";
import { RepaymentListValue } from "@/types/invoice";
import { LoanDataModel } from "@/types/invoice";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import { Input } from "@/components";
import { toast } from "react-toastify";
import MessageError from "@/components/Notification/MessageError";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import nProgress from "nprogress";
import { ErrorResponseType } from "@/types/global";
import { useReactToPrint } from "react-to-print";
import InvoicePrint from "@/components/InvoicePrint";
import SelectComponent from "@/components/Select";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  invoiceId: number;
  onClose: () => void;
}

const printCopy = [
  { id: "ori", isCopy: false },
  { id: "copy", isCopy: true },
];

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

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = (
  props: InvoiceDetailModalProps
) => {
  const { isOpen, invoiceId, onClose } = props;

  const [repaymentList, setRepaymentList] = useState<{
    [K: number]: RepaymentListValue;
  }>({});
  const [selectedLoan, setSelectedLoan] = useState<LoanDataModel>();
  const [repaymentData, setRepaymentData] = useState({
    value: 0,
    default: 0,
    max: 0,
  });
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef(null);
  const promiseResolveRef = useRef<any>(null);

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getPurchaseInvoiceDetail(invoiceId),
    queryKey: [QUERY_KEY.GET_PURCHASE_INVOICE_DETAIL],
    refetchInterval: false,
  });

  const onClearLoan = () => {
    setSelectedLoan(undefined);
    setRepaymentData({ default: 0, value: 0, max: 0 });
  };

  const onChangeLoanSelect = (item: any) => {
    if (item) {
      const loanData: LoanDataModel = JSON.parse(item);
      setSelectedLoan(loanData);

      const finalPurchasePricePerLoan = getFinalPurchasePricePerLoan({
        reference_type: loanData.reference_type,
        reference_id: loanData.reference_id,
      });
      let totalRepayment = (loanData.loan_total * 10) / 100;

      if (finalPurchasePricePerLoan < totalRepayment) totalRepayment = 0;

      setRepaymentData({
        value: totalRepayment,
        default: totalRepayment,
        max:
          finalPurchasePricePerLoan ||
          (loanData?.loan_total || 0) - (loanData?.repayment_accum || 0),
      });
    }
  };

  const onSuccessAddRepayment = () => {
    toast.success(<MessageSuccess msg={"Validasi sukses"} />, {
      className: "toast-message-success",
    });
    refetch();
    onClearLoan();
    setRepaymentList({});
    nProgress.done();
  };

  const onErrorAddRepayment = (
    err: ErrorResponseType<{ data?: unknown; message?: string }>
  ) => {
    toast.error(
      <MessageError msg={`Terjadi kesalahan, ${err.response?.data || err}`} />,
      { className: "toast-message-error" }
    );
    nProgress.done();
  };

  const { mutate: addRepaymentMt } = useMutation({
    mutationFn: () =>
      postRepayment({
        invoice_id: invoiceId,
        data: Object.values(repaymentList),
      }),
    mutationKey: [MUTATION_KEY.ADD_NEW_REPAYMENT],
    onSuccess: onSuccessAddRepayment,
    onError: onErrorAddRepayment,
  });

  const onSuccessMarkAsPaid = () => {
    toast.success(<MessageSuccess msg={"Validasi sukses"} />, {
      className: "toast-message-success",
    });
    refetch();
    onClose();
    nProgress.done();
  };

  const onErrorMarkAsPaid = (
    err: ErrorResponseType<{ data?: unknown; message?: string }>
  ) => {
    toast.error(
      <MessageError msg={`Terjadi kesalahan, ${err.response?.data || err}`} />,
      { className: "toast-message-error" }
    );
    nProgress.done();
  };

  const { mutate: markAsPaidMt } = useMutation({
    mutationFn: () =>
      manageInvoiceStatus({
        invoice_id: invoiceId,
        status: "PRINTED",
      }),
    mutationKey: [MUTATION_KEY.MANAGE_INVOICE_STATUS],
    onSuccess: onSuccessMarkAsPaid,
    onError: onErrorMarkAsPaid,
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        promiseResolveRef.current = resolve;
        setIsPrinting(true);
      });
    },
    onAfterPrint: () => {
      promiseResolveRef.current = null;
      setIsPrinting(false);
      markAsPaidMt();
    },
  });

  useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      promiseResolveRef.current();
    }
  }, [isPrinting]);

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

  const getTaxPrice = (purchasePrice: number) => {
    if (!data?.data.data.tax_value) return 0;

    const tempTax = (purchasePrice * data.data.data.tax_value) / 100;

    if (tempTax % 1000 <= 0) return 0;

    return tempTax + (1000 - (tempTax % 1000));
  };

  const getFeePrice = (qty: number) => {
    if (!data?.data.data.fee_value) return 0;

    return data.data.data.fee_value * qty;
  };

  const getFinalPurchasePricePerLoan = (arg: {
    reference_type?: string;
    reference_id?: number;
  }) => {
    if (
      !data?.data.data.tax_value ||
      !data?.data.data.fee_value ||
      !data.data.data.bucket_list ||
      !arg.reference_type ||
      !arg.reference_type
    )
      return 0;

    let purchasePrice = 0;
    let qty = 0;
    if (arg.reference_type === "PARTNER") {
      for (const bucket of data.data.data.bucket_list) {
        if (
          arg.reference_id === bucket.partner_id &&
          bucket.product_type === "Kemitraan"
        ) {
          purchasePrice += bucket.purchase_price || 0;
          qty++;
        }
      }
    }

    if (!purchasePrice) return 0;

    return purchasePrice - getTaxPrice(purchasePrice) - getFeePrice(qty);
  };

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
        <div className={styles.kopTitle}>Detail Invoice</div>
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
              <div className={styles.flex2}>{`${formatCurrency(
                data?.data.data.fee_value,
                true
              )} x ${data?.data.data.bucket_quantity}`}</div>
              <div className={`${styles.flex2} ${styles.textAlignEnd}`}>
                {formatCurrency(data?.data.data.fee_price, true)}
              </div>
            </div>
            <div className={styles.invoiceRepaymentRow}>
              <div className={`${styles.flex15} ${styles.textWeight600}`}>
                Titipan (%)
              </div>
              <div
                className={styles.flex2}
              >{`${data?.data.data.tax_value?.toFixed(2)} % x ${formatCurrency(
                data?.data.data.purchase_price_accum,
                true
              )}`}</div>
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
            <div className={`${styles.flex15} ${styles.textWeight600}`}>
              Jumlah Diterima
            </div>
            <div className={styles.flex2}></div>
            <div
              className={`${styles.flex2} ${styles.textAlignEnd} ${styles.textWeight600}`}
            >
              {formatCurrency(receivedValue(), true)}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <div className={styles.invoiceRepaymentManagement}>
        <div className={styles.invoiceDetail}>{renderBody()}</div>
        <div className={styles.repaymentControl}>
          Pengaturan Pembayaran Utang
          <div className={styles.buttonWrapper}>
            <ReactButton
              title={"Submit Pembayaran Angsuran"}
              type="button"
              onClick={() => {
                console.log("bayar");
                addRepaymentMt();
              }}
              disabled={!Object.values(repaymentList).length}
            />
            <ReactButton
              title={"Cetak"}
              type="button"
              onClick={() => {
                console.log("print");
                handlePrint();
              }}
              disabled={
                !!data?.data.data.invoice_status_list?.find(
                  (e) => e.status === "PRINTED"
                ) || !data?.data.data.invoice_status_list
              }
            />
          </div>
          <div className={styles.paramsContainer}>
            <SelectComponent
              data={data?.data.data.loan_list || []}
              allowClear
              placeholder="Pilih pinjaman mitra/koordinator"
              disabled={
                (!isFetching && !data?.data.data.loan_list?.length) ||
                !!(
                  data?.data.data.loan_list?.length &&
                  data.data.data.loan_list[0].loan_id === 0
                ) ||
                !!data?.data.data.invoice_status_list
              }
              loading={isFetching}
              onClear={onClearLoan}
              onChange={onChangeLoanSelect}
              value={JSON.stringify(selectedLoan)}
              customLabel={{
                renderLabel: (item: LoanDataModel) =>
                  `${item.reference_name} - ${formatCurrency(item.loan_total)}`,
              }}
            />
            <div className={styles.inputRow}>
              <Input
                label="Penghasilan Total"
                value={formatCurrency(selectedLoan?.purchase_price_accum)}
                disabled
              />
              <Input
                label="Prediksi Penghasilan"
                value={formatCurrency(
                  getFinalPurchasePricePerLoan({
                    reference_type: selectedLoan?.reference_type,
                    reference_id: selectedLoan?.reference_id,
                  })
                )}
                disabled
              />
            </div>
            <div className={styles.inputRow}>
              <Input
                label="Sisa"
                value={formatCurrency(
                  (selectedLoan?.loan_total || 0) -
                    (selectedLoan?.repayment_accum || 0)
                )}
                disabled
              />
              <Input
                label="Jumlah Angsuran"
                value={formatCurrency(repaymentData.value)}
                onChange={(ev) => {
                  let deformatVal = deformatCurrency(ev.target.value);

                  if (!!repaymentData.max && deformatVal > repaymentData.max) {
                    deformatVal = repaymentData.max;
                  }

                  setRepaymentData((state) => ({
                    ...state,
                    value: deformatVal,
                  }));
                }}
                disabled={!selectedLoan}
              />
            </div>
            <ReactButton
              title={"Tambah"}
              type="button"
              onClick={() => {
                if (selectedLoan?.loan_id) {
                  console.log("Tambah");
                  setRepaymentList((state) => ({
                    ...state,
                    [selectedLoan.loan_id]: {
                      loan_id: selectedLoan.loan_id,
                      reference_name: selectedLoan.reference_name,
                      value: repaymentData.value,
                      loan_code: selectedLoan.loan_code,
                      description: "invoice",
                    },
                  }));
                }
              }}
              disabled={!(selectedLoan?.loan_id && repaymentData.value)}
            />
            <div className={styles.horizontalLine}></div>
            <div>
              <div className={styles.repaymentListHeader}>
                <div className={styles.flex15}>Kode</div>
                <div className={styles.flex2}>Nama</div>
                <div className={styles.flex2}>Total Jumlah</div>
              </div>
              {Object.values(repaymentList).map((item, idx) => {
                return (
                  <div key={idx.toString()} className={styles.repaymentListRow}>
                    <div className={styles.flex15}>{item.loan_code}</div>
                    <div className={styles.flex2}>{item.reference_name}</div>
                    <div className={styles.flex2}>
                      {formatCurrency(item.value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {isPrinting && data && (
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            {printCopy.map((item) => (
              <InvoicePrint
                key={item.id}
                data={data.data.data}
                isCopy={item.isCopy}
              />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default InvoiceDetailModal;
