"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Card, Input, Pagination, Table, DatePicker, MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import locale from "antd/es/date-picker/locale/id_ID";
import { ColumnsType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import "dayjs/locale/id";
import { getInvoiceList } from "@/api/queries/fetch";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/api/queries/key";
import { SearchFilterSortParams } from "@/types/global";
import { InvoiceDetail } from "@/types/invoice";
import dayjs from "dayjs";
import { formatCurrency } from "@/util/commons";
import InvoiceApprovalModal from "./InvoiceApprovalModal";

const QueueApprovalPage: React.FC = () => {
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
    "filter[0]": `on_progress`,
  });

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getInvoiceList(payload),
    queryKey: [QUERY_KEY.GET_INVOICE_LIST],
    refetchInterval: 7200000,
  });

  useEffect(() => {
    refetch();
  }, [payload, refetch]);

  const columns: ColumnsType<InvoiceDetail> = [
    {
      title: "No",
      width: "5%",
      render: (_, __, i) => (
        <span>
          {((payload?.page || 0) - 1) * (payload?.limit || 0) + (i + 1)}
        </span>
      ),
    },
    {
      title: "Nomor Invoice",
      dataIndex: "invoice_number",
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
      title: "Tanggal Invoice",
      dataIndex: "invoice_date",
      render: (item) => (
        <span>{dayjs(item).locale("id").format("DD MMM YYYY")}</span>
      ),
    },
    {
      title: "Jumlah Barang",
      dataIndex: "bucket_quantity",
      width: "7%",
    },
    {
      title: "Total Pembayaran",
      dataIndex: "purchase_price_accum",
      width: "12%",
      render: (item) => formatCurrency(item),
    },
    {
      title: "Total Pembayaran Pinjaman",
      dataIndex: "repayment_accum",
      width: "12%",
      render: (item) => formatCurrency(item),
    },
    {
      title: "Pajak",
      dataIndex: "tax_price",
      render: (item) => formatCurrency(item),
    },
    {
      title: "Potongan",
      dataIndex: "fee_price",
      render: (item) => formatCurrency(item),
    },
    {
      title: "",
      dataIndex: "invoice_id",
      fixed: "right",
      render: (item) => {
        return (
          <ReactButton
            title="Detail"
            type="button"
            onClick={() => {
              setInvoiceDetailModalCtrl({
                open: true,
                invoiceId: item,
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
        {invoiceDetailModalCtrl.open && (
          <InvoiceApprovalModal
            isOpen={invoiceDetailModalCtrl.open}
            invoiceId={invoiceDetailModalCtrl.invoiceId || 0}
            onClose={() => setInvoiceDetailModalCtrl({ open: false })}
            refectMain={refetch}
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
          scroll={{
            x: 1200,
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

export default QueueApprovalPage;
