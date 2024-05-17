import React, { memo, useCallback, useState } from "react";
import Barcode from "react-barcode";
import styles from "./styles.module.scss";
import dayjs from "dayjs";
import { Checkbox, Modal } from "antd";
import {
  getPurchaseDeliveryDetail,
  validateGoodsData,
} from "@/api/queries/fetch";
import { QUERY_KEY } from "@/api/queries/key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDateTime } from "@/util/commons";
import {
  BucketData,
  DeliveryWithStatusAccumModel,
  GoodsDataModel,
} from "@/types/purchase";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import { toast } from "react-toastify";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import nProgress from "nprogress";
import { ErrorResponseType } from "@/types/global";
import MessageError from "@/components/Notification/MessageError";
import Link from "next/link";
import { invoiceStatusChipLabel } from "@/constants/invoices";

interface DeliveryDetailModalProps {
  isOpen: boolean;
  deliveryNumber?: string;
  onClose: () => void;
  statusAccum?: DeliveryWithStatusAccumModel["status_accum"];
  onOpenInvoiceDetail: (invoiceId: number) => void;
}

const RenderItem = ({
  item,
  idx,
  onCheck,
  onOpenInvoiceDetail,
  selectedCompany,
}: {
  item: BucketData;
  idx: number;
  onCheck: (item: BucketData) => void;
  onOpenInvoiceDetail: (invoiceId: number) => void;
  selectedCompany?: BucketData["client_company"];
}) => {
  const [selected, setSelected] = useState(false);
  const gw = item.purchase_gross_weight || item.gross_weight;
  console.log("memoize-item", idx);

  return (
    <tr
      key={idx.toString()}
      className={`${idx % 2 !== 0 ? styles.evenRow : ""} ${
        selected ? styles.selectedRow : ""
      }`}
    >
      <td>
        <div className={styles.tdNo}>
          {item.status === "WAITING_TO_VALIDATE" && (
            <Checkbox
              checked={selected}
              value={item}
              onChange={(ev) => {
                setSelected((state) => !state);
                onCheck(ev.target.value as BucketData);
              }}
              disabled={
                !!selectedCompany && selectedCompany != item.client_company
              }
            />
          )}
          <span>{idx + 1}</span>
        </div>
      </td>
      <td>{item.serial_number}</td>
      <td>{item.farmer_name}</td>
      <td>{item.product_type}</td>
      <td>{item.sales_code}</td>
      <td>{item.grade ? `${item.client_code} - ${item.grade}` : ""}</td>
      <td>
        {item.grade
          ? `${formatCurrency(item.unit_price, true)} / ${formatCurrency(
              item.grade_price,
              true
            )}`
          : ""}
      </td>
      <td>{gw ? (gw / 1000).toFixed(2) : ""}</td>
      <td>
        {item.purchase_net_weight
          ? (item.purchase_net_weight / 1000).toFixed(2)
          : ""}
      </td>
      <td>{item.status}</td>
      <td>
        <Link href="?modal=true">
          <div
            style={{ fontSize: 12, cursor: "pointer" }}
            onClick={() => onOpenInvoiceDetail(item.invoice_id || 0)}
          >
            {item.invoice_number}
          </div>
        </Link>
      </td>
      <td>
        <div className={styles.invoiceStatusContainer}>
          {item.status_list?.map((e) => {
            if (!e.status) return;
            const obj = invoiceStatusChipLabel[e.status];
            return (
              <div key={e.status} className={styles.invoiceStatus}>
                <div style={{ background: obj?.color }} className={styles.chip}>
                  {obj?.label}
                </div>
                <div className={styles.hide}>
                  {formatDateTime(e.status_date || "")}
                </div>
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
};

const MemoizeItem = memo(RenderItem);

const DeliveryDetailModal: React.FC<DeliveryDetailModalProps> = (
  props: DeliveryDetailModalProps
) => {
  const { isOpen, deliveryNumber, onClose, statusAccum, onOpenInvoiceDetail } =
    props;

  const [selectedData, setSelectedData] = useState<{
    [K: number]: GoodsDataModel;
  }>([]);
  const [selectedCompany, setSelectedCompany] =
    useState<BucketData["client_company"]>();

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getPurchaseDeliveryDetail(deliveryNumber || ""),
    queryKey: [QUERY_KEY.GET_PURCHASE_DELIVERY_DETAIL],
    refetchInterval: false,
  });

  const onSuccess = () => {
    toast.success(<MessageSuccess msg={"Validasi sukses"} />, {
      className: "toast-message-success",
    });
    refetch();
    setSelectedData({});
    setSelectedCompany(undefined);
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
    mutationFn: () =>
      validateGoodsData({
        delivery_number: data?.data.data.delivery_number || "",
        delivery_id: data?.data.data.delivery_id || 0,
        goods_list: Object.values(selectedData),
      }),
    mutationKey: [QUERY_KEY.GET_PURCHASE_DELIVERY_DETAIL],
    onSuccess,
    onError,
  });

  const onCheck = useCallback(
    (item: BucketData) => {
      setSelectedData((state) => {
        const newState = { ...state };

        if (newState[item.goods_id]) {
          delete newState[item.goods_id];
          if (JSON.stringify(newState) === "{}") {
            setSelectedCompany(undefined);
          }
        } else {
          newState[item.goods_id] = {
            purchase_id: item.purchase_id,
            goods_id: item.goods_id,
            grade_info_id: item.grade_info_id,
            weight_info_id: item.weight_info_id,
          };
          if (selectedCompany != item.client_company) {
            setSelectedCompany(item.client_company);
          }
        }
        return { ...newState };
      });
    },
    [selectedCompany]
  );

  const headerValueList = [
    {
      title: "Tanggal",
      value: dayjs(data?.data.data.delivery_date || "").format("DD MMM YYYY"),
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

  const renderBody = () => {
    return (
      <div className={styles.deliveryContainer}>
        <div className={styles.kopTitle}>Detail Pengiriman</div>
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
              value={data?.data.data.delivery_number || "-"}
              format="CODE128"
              displayValue
              width={1.2}
              height={50}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              rowGap: "10px",
              flexWrap: "wrap",
              padding: "10px",
              paddingLeft: "100px",
            }}
          >
            <ReactButton
              title={`Validasi ${Object.keys(selectedData).length} / ${
                statusAccum?.WAITING_TO_VALIDATE || 0
              }`}
              type="button"
              onClick={() => {
                console.log("validate");
                mutate();
              }}
              disabled={!Object.values(selectedData).length}
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
                <th className={styles.thProductType}>Jenis</th>
                <th className={styles.thGrade}>Barcode Penjualan</th>
                <th className={styles.thGrade}>Grade</th>
                <th className={styles.thPrice}>Harga (Unit / Grade)</th>
                <th className={styles.thBK}>BK</th>
                <th className={styles.thBK}>BB</th>
                <th className={styles.thStatus}>Status</th>
                <th className={styles.thInvoice}>No. Invoice</th>
                <th className={styles.thAction}>Status Invoice</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.data.bucket_list?.map((item, idx) => {
                return (
                  <MemoizeItem
                    key={idx.toString()}
                    item={item}
                    idx={idx}
                    onCheck={onCheck}
                    onOpenInvoiceDetail={onOpenInvoiceDetail}
                    selectedCompany={selectedCompany}
                  />
                );
              })}
            </tbody>
          </table>
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
      <div className={`${styles.modalView}`}>{renderBody()}</div>
    </Modal>
  );
};

export default DeliveryDetailModal;
