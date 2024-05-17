"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Card, Pagination, Table, MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { Input, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ColumnsType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import "dayjs/locale/id";
import { getGroupingList } from "@/api/queries/fetch";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/api/queries/key";
import { SearchFilterSortParams } from "@/types/global";
import { formatCurrency } from "@/util/commons";
import useDebounce from "@/util/hooks/useDebounce";
import { GroupingModel } from "@/types/grouping";
import styles from "./styles.module.scss";
import { chipColorList } from "@/constants/grouping";
import GroupingDetailModal from "./GroupingDetailModal";

const SalesGroupingManagement: React.FC = () => {
  const debounce = useDebounce();

  const [payload, setPayload] = useState<SearchFilterSortParams>({
    limit: 10,
    page: 1,
    keyword: "",
  });
  const [detailModalCtrl, setDetailModalCtrl] = useState<
    | { open: false }
    | {
        open: true;
        groupingId: number;
        clientId: number;
      }
  >({
    open: false,
  });

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getGroupingList(payload),
    queryKey: [QUERY_KEY.GET_GROUPING_LIST],
    refetchInterval: 7200000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    refetch();
  }, [payload, refetch]);

  const columns: ColumnsType<GroupingModel> = [
    {
      title: "No",
      fixed: "left",
      render: (_, __, i) => (
        <span>
          {((payload?.page || 0) - 1) * (payload?.limit || 0) + (i + 1)}
        </span>
      ),
      width: "5%",
    },
    {
      title: "Nomor Gul.",
      dataIndex: "grouping_number",
      fixed: "left",
      width: "11%",
    },
    {
      title: "Nomor Gul. (Client)",
      dataIndex: "grouping_client_number",
      width: "11%",
    },
    {
      title: "Client",
      dataIndex: "client_code",
      width: "6%",
    },
    {
      title: "Grade",
      dataIndex: "grade_initial",
      width: "4%",
    },
    {
      title: "UB",
      dataIndex: "ub",
      width: "4%",
    },
    {
      title: "Total Keranjang",
      dataIndex: "goods_total",
      width: "6%",
    },
    {
      title: "Total Harga",
      dataIndex: "client_price_total",
      width: "10%",
      render: (item) => formatCurrency(item, true),
    },
    {
      title: "Total BB (Kg.)",
      dataIndex: "client_net_weight_total",
      width: "7%",
      render: (item) => formatCurrency((item || 0) / 1000, true),
    },
    {
      title: "Rekapitulasi Grade",
      dataIndex: "grade_recap_list",
      width: "10%",
      render: (item: GroupingModel["grade_recap_list"]) => {
        return (
          <div className={styles.chipContainer}>
            {item?.map((e, idx) => {
              if (!e.grade) return;
              return (
                <div
                  key={e.grade}
                  style={{
                    background: chipColorList[idx % chipColorList.length].bg,
                    color: chipColorList[idx % chipColorList.length].font,
                  }}
                  className={styles.chip}
                >
                  {e.grade} | {e.total}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Rekapitulasi Petani",
      dataIndex: "farmer_recap_list",
      width: "10%",
      render: (item: GroupingModel["farmer_recap_list"]) => {
        return (
          <div className={styles.chipContainer}>
            {item?.map((e, idx) => {
              if (!e.farmer) return;
              return (
                <div
                  key={e.farmer + idx}
                  style={{
                    background: chipColorList[idx % chipColorList.length].bg,
                    color: chipColorList[idx % chipColorList.length].font,
                  }}
                  className={styles.chip}
                >
                  {e.farmer} | {e.total}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "",
      fixed: "right",
      width: "10%",
      render: (_, rec) => {
        return (
          <ReactButton
            title="Detail"
            type="button"
            onClick={() => {
              setDetailModalCtrl({
                open: true,
                groupingId: rec.grouping_id,
                clientId: rec.client_id,
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
        label: "Nama Client DESC",
        onClick: () =>
          setPayload({ ...payload, "sortby[0]": "client_name:desc" }),
      },
      {
        key: 2,
        label: "Nama Client ASC",
        onClick: () =>
          setPayload({ ...payload, "sortby[0]": "client_name:asc" }),
      },
      {
        key: 3,
        label: "Tanggal Gulung DESC",
        onClick: () =>
          setPayload({ ...payload, "sortby[0]": "grouping_date:desc" }),
      },
      {
        key: 4,
        label: "Tanggal Gulung ASC",
        onClick: () =>
          setPayload({ ...payload, "sortby[0]": "grouping_date:asc" }),
      },
    ],
  };

  const renderModal = () => {
    return (
      <>
        {detailModalCtrl.open && (
          <GroupingDetailModal
            isOpen={detailModalCtrl.open}
            groupingId={detailModalCtrl.groupingId}
            // clientId={detailModalCtrl.clientId}
            onClose={() => {
              setDetailModalCtrl({ open: false });
            }}
            refetchMainPage={refetch}
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
            label="Pencarian"
            placeholder=""
            prefix={<SearchOutlined />}
            onChange={(e) => {
              debounce(() => {
                setPayload({ ...payload, page: 1, keyword: e.target.value });
              }, 500);
            }}
          />
          <SortDropdown sortData={menu} label="Urutkan" />
        </div>

        <Table
          className="stock-table-wrapper"
          columns={columns}
          dataSource={data?.data.data}
          loading={isFetching}
          pagination={false}
          rowClassName={(_, idx) => (idx % 2 !== 0 ? "antd-banded-row" : "")}
          scroll={{ x: 1100, y: `calc(88vh - 230px)` }}
          sticky
          bordered
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

export default SalesGroupingManagement;
