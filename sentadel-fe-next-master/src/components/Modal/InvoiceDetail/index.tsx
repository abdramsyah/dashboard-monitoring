import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import "./styles.scss";
import { useReactToPrint } from "react-to-print";
import { Modal, Table } from "antd";
import { Button } from "../..";
import {
  convertDateTimeDBtoIndo,
  formatCurrency,
  roundToNearestThousand,
} from "../../../util/commons";
// import PaymentPrint from "../../../pages/payment-revision/form/PaymenPrint";
import ConfirmationModal from "../ConfirmationModal";

const printCopy = [{ isCopy: false }, { isCopy: true }];

interface InvoiceDetailModal {
  onClose: () => void;
  visible: boolean;
  isInvoice: boolean;
  params: any;
  isMarkAsPaidMode: boolean;
  customFooter: any;
}

export default function InvoiceDetail(props: InvoiceDetailModal) {
  const {
    onClose,
    visible,
    isInvoice,
    params,
    isMarkAsPaidMode,
    customFooter,
  } = props;
  const { detailInvoice, loadingDetailInvoice } = useSelector(
    ({ invoiceList }) => invoiceList
  );
  const dispatch = useDispatch();

  const [isPrinting, setIsPrinting] = useState(false);
  const [markAsPaidConfirmOpen, setMarkAsPaidConfirmOpen] = useState(false);
  const [goodsList, setGoodsList] = useState<any[]>([]);
  const [printType, setPrintType] = useState("lampion");

  const printRef = useRef(null);

  const promiseResolveRef = useRef<any>(null);

  const isRevised = useCallback(
    (e: any) => {
      if (!isInvoice)
        return (
          (e.prev_grade_id && e.prev_grade_id !== e.grade_id) ||
          (e.prev_purchase_price && e.prev_purchase_price !== e.purchase_price)
        );

      return false;
    },
    [isInvoice]
  );

  useEffect(() => {
    if (detailInvoice?.data?.detail?.length) {
      const detailData = detailInvoice?.data?.detail;
      let detailWithPrevData: any[] = [];

      if (detailData) {
        detailData.forEach((e: any, idx: number) => {
          if (isRevised(e)) {
            detailWithPrevData.push({
              ...e,
              key: idx + 1,
              gross_weight: e.prev_gross_weight,
              net_weight: e.prev_net_weight,
              real_gross_weight: e.prev_real_gross_weight,
              real_net_weight: e.prev_real_net_weight,
              client_grade: e.prev_client_grade,
              purchase_price: e.prev_purchase_price,
              client_name: e.prev_client_name,
            });
            detailWithPrevData.push({
              gross_weight: e.gross_weight,
              net_weight: e.net_weight,
              real_gross_weight: e.real_gross_weight,
              real_net_weight: e.real_net_weight,
              client_grade: e?.grade,
              purchase_price: e.purchase_price,
              client_name: e.client_name,
              color:
                e.purchase_price > e.prev_purchase_price
                  ? "change-increase"
                  : "change-decrease",
            });
          } else {
            detailWithPrevData.push({
              ...e,
              key: idx + 1,
            });
          }
        });
      }

      setGoodsList(detailWithPrevData);
    }
  }, [detailInvoice, isRevised]);

  useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      promiseResolveRef.current();
    }
  }, [isPrinting]);

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
    },
  });

  const onFinishSaga = () => [setMarkAsPaidConfirmOpen(false), onClose()];

  const renderCol = (item: any, ellipsis?: boolean, isBarcode?: boolean) => {
    if (ellipsis)
      return <span className="table-cell-invoice-detail">{item}</span>;

    if (isBarcode && item) {
      const items = item?.split("-");

      return <span className="fs16">{items[0]}</span>;
    }

    return <span className="fs16">{item}</span>;
  };

  const renderRowSpan = (item: any) => {
    if (item.key) {
      if (isRevised(item))
        return {
          rowSpan: 2,
        };

      return {
        rowSpan: 1,
      };
    }

    return { rowSpan: 0 };
  };

  const columns = [
    {
      title: "No",
      dataIndex: "key",
      width: "5%",
      render: (item?: any) => renderCol(item),
      onCell: renderRowSpan,
    },
    {
      title: "Company Barcode ",
      width: "12%",
      dataIndex: "company_barcode",
      render: (item?: any) => renderCol(item, false, true),
      onCell: renderRowSpan,
    },
    {
      title: "Farmer Name ",
      width: "15%",
      dataIndex: "farmer_name",
      render: (item?: any) => renderCol(item, true),
      onCell: renderRowSpan,
    },
    {
      title: "Grade",
      dataIndex: "client_grade",
      width: "11%",
      render: (item?: any) => renderCol(item),
    },
    {
      title: "Net Weight",
      dataIndex: "real_net_weight",
      width: "11%",
      render: (item?: any) => renderCol(item / 1000),
    },
    {
      title: "Price",
      dataIndex: "unit_price",
      width: "12%",
      render: (item?: any) => formatCurrency(item, true),
    },
    {
      title: "Total",
      dataIndex: "purchase_price",
      width: "16%",
      render: (item?: any) => formatCurrency(item, true),
    },
  ];

  const renderPricing = useMemo(() => {
    if (!isInvoice) {
      let newTotalPurchase = 0;
      let prevTotalPurchase = 0;
      let status = "Selisih";

      detailInvoice?.data?.detail.forEach((e: any) => {
        newTotalPurchase += e.purchase_price;
        prevTotalPurchase += e.prev_purchase_price;
      });

      const diff = newTotalPurchase - prevTotalPurchase;
      if (diff > 0) {
        status = "Kekurangan Bayar";
      } else if (diff < 0) {
        status = "Kelebihan Bayar";
      }
      const tax = -roundToNearestThousand(
        (diff * detailInvoice?.data?.tax) / 100
      );
      const totalReceived = Math.abs(diff + tax);

      return {
        totalReceived,
        newTotalPurchase,
        prevTotalPurchase,
        status,
        diff: Math.abs(diff),
        tax,
      };
    }

    let prevTotalPurchase = 0;
    detailInvoice?.data?.detail.forEach((e: any) => {
      prevTotalPurchase += e.purchase_price;
    });

    const tax = roundToNearestThousand(
      (prevTotalPurchase * detailInvoice?.data?.tax) / 100
    );
    const fee = detailInvoice?.data?.fee * detailInvoice?.data?.detail?.length;

    const totalReceived = prevTotalPurchase - tax - fee;

    return { totalReceived, prevTotalPurchase, tax };
  }, [
    detailInvoice?.data?.detail,
    detailInvoice?.data?.fee,
    detailInvoice?.data?.tax,
    isInvoice,
  ]);

  const renderBottomInvoice = () => {
    if (isInvoice) {
      return (
        <>
          <div className="value total-received">
            <label className="bottom-invoice">Total Jumlah</label>
            <h3 className="value-currency">
              {formatCurrency(renderPricing.prevTotalPurchase, true)}
            </h3>
          </div>
          <div className="value fee-container">
            <label className="bottom-invoice">Titipan %</label>
            <h3 className="value-currency tax-length start-text-align">
              {detailInvoice?.data?.tax} % x{" "}
              {formatCurrency(renderPricing.prevTotalPurchase, true)}{" "}
            </h3>
            <h3 className="value-currency">
              {formatCurrency(renderPricing.tax, true)}{" "}
            </h3>
          </div>
          <div className="value fee-container">
            <label className="bottom-invoice">Potongan</label>
            <h3 className="value-currency tax-length start-text-align">
              {formatCurrency(detailInvoice?.data?.fee, true)} x{" "}
              {goodsList.length}
            </h3>
            <h3 className="value-currency">
              {formatCurrency(
                detailInvoice?.data?.fee * goodsList.length,
                true
              )}{" "}
            </h3>
          </div>
          <div className="value total-received horizontal-bottom-line">
            <label className="bottom-invoice">Jumlah Diterima</label>
            <h3 className="value-currency">
              {formatCurrency(renderPricing.totalReceived, true)}{" "}
            </h3>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="value total-received">
          <label className="bottom-invoice">Total Baru</label>
          <h3 className="value-currency">
            {formatCurrency(renderPricing.newTotalPurchase) || "-"}{" "}
          </h3>
        </div>
        <div className="value total-received">
          <label className="bottom-invoice">Total Lama</label>
          <h3 className="value-currency">
            {formatCurrency(renderPricing.prevTotalPurchase) || "-"}{" "}
          </h3>
        </div>
        <div className="value total-received">
          <label className="bottom-invoice">{renderPricing.status}</label>
          <h3 className="value-currency">
            {formatCurrency(renderPricing.diff) || "-"}
          </h3>
        </div>
        <div className="value total-received">
          <label className="bottom-invoice">Selish Titipan</label>
          <h3 className="value-currency less-length">
            {formatCurrency(renderPricing.tax) || "-"}
          </h3>
        </div>
        <div className="value total-received horizontal-bottom-line">
          <label className="bottom-invoice">Total Revisi</label>
          <h3 className="value-currency bold less-length">
            {formatCurrency(renderPricing.totalReceived) || "-"}
          </h3>
        </div>
      </>
    );
  };

  const renderButtonSection = () => {
    if (customFooter && detailInvoice?.data)
      return customFooter(detailInvoice?.data);

    const actionButton = () => {
      if (isMarkAsPaidMode) {
        return (
          <Button
            className="button-base print"
            onClick={() => setMarkAsPaidConfirmOpen(true)}
          >
            Mark as Paid
          </Button>
        );
      }
      return (
        <Button
          className="button-base print"
          onClick={() => {
            setPrintType(detailInvoice?.data?.company || "LAMPION");
            handlePrint();
            if (isInvoice) {
              dispatch({
                type: "postInvoice/PRINT_INVOICE",
                param: { id: detailInvoice?.data?.id, params },
              });
            } else {
              dispatch({
                type: "invoiceDiff/PRINT_INVOICE",
                param: { id: detailInvoice?.data?.id, params },
              });
            }
          }}
        >
          Print
        </Button>
      );
    };
    return (
      <div className="invoice-button-container">
        <div></div>
        <div>
          <Button className="button-base cancel" onClick={onClose}>
            Cancel{" "}
          </Button>
          {actionButton()}
        </div>
      </div>
    );
  };

  const renderModal = () => {
    return (
      <>
        {markAsPaidConfirmOpen && (
          <ConfirmationModal
            open={markAsPaidConfirmOpen}
            title={"Are you sure want to Mark this invoice as Paid?"}
            cancelFocused
            onClose={() => setMarkAsPaidConfirmOpen(false)}
            onConfirm={() => {
              dispatch({
                type: isInvoice
                  ? "markAsPaid/POST_DATA"
                  : "invoiceDiff/MARK_AS_PAID_ADMIN",
                param: {
                  params,
                  idInvoice: detailInvoice?.data?.id,
                  onFinishSaga,
                },
              });
            }}
          />
        )}
      </>
    );
  };

  return (
    <Modal
      className="detail-shiping"
      title=""
      width={700}
      footer={null}
      visible={visible}
      onCancel={onClose}
    >
      <div>
        {/* header  */}
        <div className="kop kop-border">
          <h3 className="modal-title">Detail Invoice</h3>
          <p>
            {" "}
            {loadingDetailInvoice
              ? "loading"
              : convertDateTimeDBtoIndo(detailInvoice?.data?.tanggal)}
          </p>
        </div>
        <div className="modal-detail p24">
          <div className="header top-detail-container">
            <div className="value flex-basis-25">
              <label className="text-label">Coordinator Name</label>
              <h3 className="text-value">
                {detailInvoice?.data?.coordinator_name}{" "}
              </h3>
            </div>
            <div
              className="value"
              style={{
                flexBasis: "25%",
              }}
            >
              <label className="text-label">Coordinator Code</label>
              <h3 className="text-value">
                {detailInvoice?.data?.coordinator_code}{" "}
              </h3>
            </div>
            <div
              className="value"
              style={{
                flexBasis: "25%",
              }}
            >
              <label className="text-label">Invoice Number</label>
              <h3 className="text-value">
                {detailInvoice?.data?.invoice_number}{" "}
              </h3>
            </div>
          </div>
          <Table
            className="table-print"
            columns={columns}
            dataSource={goodsList}
            loading={loadingDetailInvoice}
            pagination={false}
            rowClassName={(row) => {
              if (row.color) return row.color;
              return;
            }}
          />
          <div className="copy-background bg-none">{renderBottomInvoice()}</div>
        </div>
      </div>

      <div
        style={{
          display: "none",
        }}
      >
        <div ref={printRef}>
          {/* {printCopy.map((e, idx) => {
            return (
              <PaymentPrint
                key={idx.toString()}
                printType={printType}
                dataSource={goodsList}
                detailInvoice={detailInvoice || {}}
                loadingDetailInvoice={loadingDetailInvoice}
                renderPricing={renderPricing}
                isInvoice={isInvoice}
                isCopy={e.isCopy}
                isRevised={isRevised}
              />
            );
          })} */}
        </div>
      </div>

      {renderButtonSection()}
      {renderModal()}
    </Modal>
  );
}
