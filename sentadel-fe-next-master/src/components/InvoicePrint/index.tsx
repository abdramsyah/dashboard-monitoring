import React from "react";
import styles from "./styles.module.scss";
import { InvoiceDetail } from "@/types/invoice";
import dayjs from "dayjs";
import { BucketData } from "@/types/purchase";
import { formatCurrency } from "@/util/commons";
import LogoKop from "@/assets/kop.png";
import LogoKopTalenta from "@/assets/kop_talenta.png";
import Image from "next/image";

interface InvoicePrintProps {
  data?: InvoiceDetail;
  isCopy?: boolean;
}

const InvoicePrint: React.FC<InvoicePrintProps> = (
  props: InvoicePrintProps
) => {
  const { data, isCopy } = props;

  const renderItem = (item: BucketData | boolean, idx: number) => {
    if (typeof item === "boolean")
      return (
        <tr>
          <td colSpan={6} className={styles.footTitle}>
            Jumlah
          </td>
          <td className={styles.footTotal}>
            {formatCurrency(data?.purchase_price_accum, true)}
          </td>
        </tr>
      );

    return (
      <tr
        key={idx.toString()}
        className={`${idx % 2 !== 0 ? styles.evenRow : ""}`}
      >
        <td>{idx + 1}</td>
        <td>{item.serial_number.split("-")[1]}</td>
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

  const receivedValue = () => {
    const accumInvoiceRepayment = data?.repayment_list?.reduce(
      (prev, curr) => prev + curr.value,
      0
    );

    return (
      (data?.purchase_price_accum || 0) -
      (data?.tax_price || 0) -
      (data?.fee_price || 0) -
      (accumInvoiceRepayment || 0)
    );
  };

  const renderHeader = () => {
    return (
      <div className={styles.kopContainer}>
        {!!data?.bucket_list && (
          <Image
            src={
              data?.bucket_list[0].client_company === "LAMPION"
                ? LogoKop
                : LogoKopTalenta
            }
            className={styles.imageKop}
            alt="kop"
          />
        )}

        <div className={styles.kopTitle}>
          <div className={styles.title}>
            Invoice ·{" "}
            <span className={styles.invoiceNumber}>{data?.invoice_number}</span>
          </div>
          <div className={styles.date}>
            {dayjs(data?.invoice_date || "")
              .locale("id")
              .format("dddd, DD MMM YYYY")}
          </div>
        </div>
        <div className={styles.params}>
          <div className={styles.title}>
            {data?.coordinator_name} ({data?.coordinator_code})
          </div>
          <div className={styles.title}>{data?.delivery_number}</div>
        </div>
      </div>
    );
  };

  const renderSignature = () => {
    if (isCopy)
      return (
        <div className={styles.ttdArea}>
          <div className={styles.signatureCover}>
            (&emsp;&emsp;&emsp;&emsp;)
          </div>
          <h3>Tanda Tangan</h3>
        </div>
      );

    return null;
  };

  const renderFooter = () => {
    return (
      <>
        <div
          className={`${styles.footerWrapper} ${
            isCopy ? styles.copyBackground : ""
          }`}
        >
          <div className={styles.footTotalContainer}>
            <div className={styles.footTitle}>Total Jumlah</div>
            <div className={styles.textWeight600}>
              {formatCurrency(data?.purchase_price_accum, true)}
            </div>
          </div>
          <div className={styles.taxAndFeeContainer}>
            <div className={styles.invoiceRepaymentRow}>
              <div className={`${styles.flex15} ${styles.textWeight600}`}>
                Potongan
              </div>
              <div className={styles.flex2}>{`${formatCurrency(
                data?.fee_value,
                true
              )} x ${data?.bucket_quantity}`}</div>
              <div className={`${styles.flex2} ${styles.textAlignEnd}`}>
                {formatCurrency(data?.fee_price, true)}
              </div>
            </div>
            <div className={styles.invoiceRepaymentRow}>
              <div className={`${styles.flex15} ${styles.textWeight600}`}>
                Titipan (%)
              </div>
              <div className={styles.flex2}>{`${data?.tax_value?.toFixed(
                2
              )} % x ${formatCurrency(data?.purchase_price_accum, true)}`}</div>
              <div className={`${styles.flex2} ${styles.textAlignEnd}`}>
                {formatCurrency(data?.tax_price, true)}
              </div>
            </div>
          </div>
          <div className={styles.invoiceRpaymentTitle}>Potongan Pinjaman</div>
          <div className={styles.invoiceRpaymentContainer}>
            {data?.repayment_list?.map((item) => {
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
        {renderSignature()}
      </>
    );
  };

  return (
    <div
      className={`${styles.deliveryContainer} ${isCopy ? styles.isCopy : ""}`}
    >
      {renderHeader()}
      <table>
        <thead>
          <tr>
            <td>
              <div className={styles.pageHeaderSpace}></div>
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <div className={styles.tableWrapper}>
                <table className={styles.tableQueue}>
                  <thead className="goodsThead">
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
                    {/* {[
                      ...(data?.bucket_list || []),
                      ...(data?.bucket_list || []),
                      ...(data?.bucket_list || []),
                      ...(data?.bucket_list || []),
                      ...(data?.bucket_list || []),
                      // ...(data?.bucket_list || []),
                      // ...(data?.bucket_list || []),
                      // ...(data?.bucket_list || []),
                      // ...(data?.bucket_list || []),
                    ]?.map(renderItem)} */}
                    {data?.bucket_list?.map(renderItem)}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
        {renderFooter()}
      </table>
    </div>
  );
};

export default InvoicePrint;
