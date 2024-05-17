"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Card, Input, Pagination, Table, DatePicker, MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { Button, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import locale from "antd/es/date-picker/locale/id_ID";
import { ColumnsType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import "dayjs/locale/id";
import { getDeliveryWithStatusAccum } from "@/api/queries/fetch";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/api/queries/key";
import { SearchFilterSortParams } from "@/types/global";
import {
  DeliveryStatusAccumModel,
  DeliveryWithStatusAccumModel,
} from "@/types/purchase";
import dayjs from "dayjs";
import DeliveryDetailModal from "./DeliveryDetailModal";
import InvoiceDetailModal from "./InvoiceDetailModal";
import { invoiceStatusChipLabel } from "@/constants/invoices";
import styles from "./styles.module.scss";
import { formatDateTime } from "@/util/commons";
import Link from "next/link";

const PurchasePaymentManagement: React.FC = () => {
  const [deliveryDetailModalCtrl, setDeliveryDetailModalCtrl] = useState<{
    open: boolean;
    deliveryNumber?: string;
    statusAccum?: DeliveryWithStatusAccumModel["status_accum"];
  }>({
    open: false,
  });
  const [invoiceDetailModalCtrl, setInvoiceDetailModalCtrl] = useState<{
    open: boolean;
    invoiceId?: number;
  }>({
    open: false,
  });
  const [payload, setPayload] = useState<SearchFilterSortParams>({
    limit: 10,
    page: 1,
    keyword: "",
  });

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getDeliveryWithStatusAccum(payload),
    queryKey: [QUERY_KEY.GET_DELIVERY_WITH_STATUS_ACCUM],
    refetchInterval: 7200000,
  });

  useEffect(() => {
    refetch();
  }, [payload, refetch]);

  const columns: ColumnsType<DeliveryWithStatusAccumModel> = [
    {
      title: "No",
      render: (_, __, i) => (
        <span>
          {((payload?.page || 0) - 1) * (payload?.limit || 0) + (i + 1)}
        </span>
      ),
    },
    {
      title: "Nomor DO",
      dataIndex: "delivery_number",
    },
    {
      title: "Koordinator",
      dataIndex: "coordinator_name",
    },
    {
      title: "Jadwal Kedatangan",
      dataIndex: "scheduled_arrival_date",
      render: (item) => (
        <span>{dayjs(item).locale("id").format("DD MMM YYYY")}</span>
      ),
    },
    {
      title: "Jumlah Keranjang",
      dataIndex: "total_bucket",
      width: "10%",
    },
    {
      title: "Status",
      dataIndex: "status_accum",
      render: (item: DeliveryStatusAccumModel) => {
        if (!item) return;

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 18,
              rowGap: 0,
              flexWrap: "wrap",
            }}
          >
            {Object.keys(item).map((key, idx) => {
              const enKey = key as keyof DeliveryStatusAccumModel;

              if (enKey === "WEIGH" || enKey === "GRADE") return;
              return (
                <div
                  key={idx.toString()}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                    fontSize: 12,
                  }}
                >
                  <div>{enKey}</div>
                  <div>:</div>
                  <div>{item[enKey]}</div>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Invoice",
      width: "20%",
      dataIndex: "invoice_list",
      render: (item: DeliveryWithStatusAccumModel["invoice_list"]) => {
        console.log('DeliveryWithStatusAccumModel["invoice_list"] - e', item);
        return (
          <div className={styles.invoiceListContainer}>
            {item?.map((e) => {
              if (!e.status) return;
              const obj = invoiceStatusChipLabel[e.status];
              return (
                <div key={e.status} className={styles.invoiceInformation}>
                  <Link href="?modal=true">
                    <div
                      className={styles.invoiceNumber}
                      onClick={() =>
                        setInvoiceDetailModalCtrl({
                          open: true,
                          invoiceId: e.invoice_id,
                        })
                      }
                    >
                      {e.invoice_number}
                    </div>
                  </Link>
                  <div className={styles.invoiceStatus}>
                    <div
                      style={{ background: obj?.color }}
                      className={styles.chip}
                    >
                      {obj?.label}
                    </div>
                    <div className={styles.hide}>
                      {formatDateTime(e.status_date || "")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "",
      render: (_, rec) => {
        return (
          <ReactButton
            title="Detail"
            type="button"
            // disabled={!(rec.weigh_data?.length && rec.grading_data?.length)}
            onClick={() => {
              setDeliveryDetailModalCtrl({
                open: true,
                deliveryNumber: rec.delivery_number,
                statusAccum: rec.status_accum,
              });
            }}
          />
        );
      },
    },
  ];

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sortir Seri Tani Code DESC",
        onClick: () =>
          setPayload({ ...payload, "sortby[0]": "serial_number desc" }),
      },
      {
        key: 2,
        title: "Sortir Seri Tani ASC",
        onClick: () =>
          setPayload({ ...payload, "sortby[0]": "serial_number asc" }),
      },
    ],
  };

  const renderModal = () => {
    return (
      <>
        {deliveryDetailModalCtrl.open && (
          <DeliveryDetailModal
            isOpen={deliveryDetailModalCtrl.open}
            deliveryNumber={deliveryDetailModalCtrl.deliveryNumber}
            onClose={() => setDeliveryDetailModalCtrl({ open: false })}
            statusAccum={deliveryDetailModalCtrl.statusAccum}
            onOpenInvoiceDetail={(invoiceId) => {
              console.log("open invoice detail", invoiceId);
              setInvoiceDetailModalCtrl({ open: true, invoiceId });
            }}
          />
        )}
        {invoiceDetailModalCtrl.open && (
          <InvoiceDetailModal
            isOpen={invoiceDetailModalCtrl.open}
            invoiceId={invoiceDetailModalCtrl.invoiceId || 0}
            onClose={() => setInvoiceDetailModalCtrl({ open: false })}
          />
        )}
      </>
    );
  };

  return (
    <Layout>
      <ToastContainer autoClose={2000} hideProgressBar={true} />
      <Card className="card-box">
        <div className="filter-search">
          <Input
            className="input-search"
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={(e) =>
              setPayload({ ...payload, page: 1, keyword: e.target.value })
            }
          />

          <div className="right-filter">
            <DatePicker
              locale={locale}
              className="date-picker"
              onChange={(_, dateString) =>
                setPayload((state) => {
                  if (!dateString) {
                    delete state["filter[0]"];
                  } else {
                    state["filter[0]"] = `pour_out_date:${dateString}`;
                  }

                  return { ...state };
                })
              }
            />
            <SortDropdown sortData={menu} />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={data?.data.data}
          loading={isFetching}
          pagination={false}
          rowClassName={(_, idx) => {
            if (idx % 2 !== 0) return "antd-banded-row";

            return "";
          }}
        />

        <div className="pagination">
          <Pagination
            current={data?.data?.meta?.page}
            total={(data?.data?.meta?.pages || 0) * (payload.limit || 0)}
            onChange={(page) => setPayload((state) => ({ ...state, page }))}
            pageSizeOptions={[10, 20, 50, 100, 200]}
            showSizeChanger
            onShowSizeChange={(_, size) =>
              setPayload((state) => ({
                ...state,
                page: 1,
                limit: size,
              }))
            }
          />
        </div>
      </Card>
      {renderModal()}
    </Layout>
  );
};

export default PurchasePaymentManagement;
