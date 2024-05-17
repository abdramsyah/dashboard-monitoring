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
import "dayjs/locale/id";
import { getPendingValidation } from "@/api/queries/fetch";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/api/queries/key";
import { GetGoodsModel } from "@/types/goods";
import { SearchFilterSortParams } from "@/types/global";

const PurchasePendingValidation: React.FC = () => {
  const [payload, setPayload] = useState<SearchFilterSortParams>({
    limit: 10,
    page: 1,
    keyword: "",
  });

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getPendingValidation(payload),
    queryKey: [QUERY_KEY.GET_PENDING_VALIDATION],
    refetchInterval: 7200000,
  });

  useEffect(() => {
    refetch();
  }, [payload, refetch]);

  const columns: ColumnsType<GetGoodsModel> = [
    {
      title: "No",
      render: (_, __, i) => (
        <span>
          {((payload?.page || 0) - 1) * (payload?.limit || 0) + (i + 1)}
        </span>
      ),
    },
    {
      title: "Nomor Seri",
      dataIndex: "serial_number",
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
      title: "Petani",
      dataIndex: "farmer_name",
    },
    {
      title: "Jenis",
      dataIndex: "product_type",
    },
    {
      title: "Grade",
      dataIndex: "grading_data",
      render: (item: GetGoodsModel["grading_data"]) => {
        if (item?.length) {
          const data = item[0];
          return <span>{`${data.client_code} - ${data.grade}` || "-"}</span>;
        }

        return "-";
      },
    },
    {
      title: "Harga (Unit / Grade)",
      dataIndex: "grading_data",
      render: (item: GetGoodsModel["grading_data"]) => {
        if (item?.length) {
          const data = item[0];
          return (
            <span>{`${data.unit_price} / ${data.grade_price}` || "-"}</span>
          );
        }

        return "-";
      },
    },
    {
      title: "BK -> BKc",
      dataIndex: "weigh_data",
      render: (item: GetGoodsModel["weigh_data"]) => {
        if (item?.length) {
          const data = item[0];
          const gw = (data.gross_weight || 0) / 1000;
          return (
            <div style={{ textAlign: "center" }}>{`${gw} -> ${Math.floor(
              gw
            )}`}</div>
          );
        }

        return "-";
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
      {/* {renderModal()} */}
    </Layout>
  );
};

export default PurchasePendingValidation;
