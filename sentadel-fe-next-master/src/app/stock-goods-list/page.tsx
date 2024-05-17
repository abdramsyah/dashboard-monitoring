"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Card, Pagination, Table, MenuProps } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ColumnType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import "dayjs/locale/id";
import {
  getAllGrade,
  getSalesBarcode,
  getStockList,
} from "@/api/queries/fetch";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/api/queries/key";
import { BucketData } from "@/types/purchase";
import dayjs from "dayjs";
import { GetStockListNewParams, GetStockListParams } from "@/types/stock";
import { formatCurrency } from "@/util/commons";
import styles from "./style.module.scss";
import InputComponents from "@/components/Input";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import StockDetailModal from "./StockDetailModal";
import GraderSelectModal, {
  GraderType,
} from "../../components/Modal/GraderSelectModal";
import SelectComponent from "@/components/Select";
import EditGradeModal from "./EditGradeModal";
import StockFilterModal from "./StockFilterModal";
import FilterSVG from "@/assets/svg/icon/filter-svg";
import { useSearchParams } from "next/navigation";
import { latestInvoiceStatusID } from "@/constants/invoices";

interface NewColumnType extends ColumnType<BucketData> {
  isGroup?: false;
  dataIndex?: keyof BucketData;
  render?: (item: any, row: BucketData, index: number) => React.ReactNode;
}

interface NewColumnGroupType {
  isGroup: true;
  title: string;
  group: NewColumnType[];
}

const columnsList: (props: {
  payload: GetStockListParams;
  onClickDetail: (serialNumber: string) => void;
  onClickEdit: (item: BucketData) => void;
}) => (NewColumnType | NewColumnGroupType | undefined)[] = (props) => [
  {
    title: "No",
    render: (_, __, i) => (
      <div>
        {((props.payload?.page || 0) - 1) * (props.payload?.limit || 0) +
          (i + 1)}
      </div>
    ),
    fixed: "left",
    width: 40,
    className: styles.numCol,
  },
  {
    title: "Nomor Seri",
    dataIndex: "serial_number",
    fixed: "left",
    width: 80,
  },
  {
    title: "Tanggal Tumplek",
    dataIndex: "goods_date",
    render: (item) => (
      <div>{dayjs(item).locale("id").format("DD MMM YYYY")}</div>
    ),
    width: 85,
  },
  {
    title: "Petani",
    dataIndex: "farmer_name",
    width: 120,
  },
  {
    title: "Koordinator",
    dataIndex: "coordinator_name",
    width: 120,
  },
  {
    title: "Barcode Penjualan",
    dataIndex: "sales_code",
    width: "7%",
  },
  {
    title: "Grade",
    dataIndex: "grade",
    width: 60,
  },
  {
    title: "Client",
    dataIndex: "client_code",
    width: 60,
  },
  {
    title: "Harga (Grade)",
    dataIndex: "grade_price",
    render: (_, row) => {
      if (row.purchase_id)
        return <span>{formatCurrency(row.grade_price, true)}</span>;

      return (
        <span>
          {formatCurrency(row.unit_price, true)} /{" "}
          {formatCurrency(row.grade_price, true)}
        </span>
      );
    },
    width: 60,
  },
  {
    title: "BT",
    dataIndex: "gross_weight",
    render: (item: BucketData["gross_weight"]) => (
      <div>{item && (item / 1000).toFixed(2)}</div>
    ),
    width: 50,
  },
  {
    isGroup: true,
    title: "Data Pembelian",
    group: [
      {
        title: "Grade",
        dataIndex: "purchase_grade",
        width: 60,
      },
      {
        title: "Client",
        dataIndex: "purchase_client_code",
        width: 60,
      },
      {
        title: "Harga",
        dataIndex: "purchase_unit_price",
        render: (item: BucketData["purchase_unit_price"]) => (
          <span>{formatCurrency(item, true)}</span>
        ),
        width: 60,
      },
      {
        title: "Tanggal Beli",
        dataIndex: "purchase_date",
        render: (item) => (
          <span>
            {item ? dayjs(item).locale("id").format("DD MMM YYYY") : ""}
          </span>
        ),
        width: 85,
      },
      {
        title: "BK",
        dataIndex: "purchase_gross_weight",
        render: (item: BucketData["unit_price"]) => (
          <span>{item / 1000 || ""}</span>
        ),
        width: 40,
      },
      {
        title: "BB",
        dataIndex: "purchase_net_weight",
        render: (item: BucketData["unit_price"]) => (
          <span>{item / 1000 || ""}</span>
        ),
        width: 40,
      },
      {
        title: "Status Invoice",
        dataIndex: "latest_status",
        render: (item) => {
          if (item === "NOT_YET_INVOICED") return;

          return <span>{latestInvoiceStatusID[item]}</span>;
        },
      },
      {
        title: "Jumlah",
        dataIndex: "purchase_price",
        render: (item: BucketData["purchase_price"]) => (
          <span>{formatCurrency(item, true)}</span>
        ),
      },
    ],
  },
  {
    title: "",
    fixed: "right",
    width: 140,
    render: (_, row) => {
      return (
        <div className="flex-row">
          <ReactButton
            title="Detail"
            type="button"
            onClick={() => props.onClickDetail(row.serial_number)}
          />
          <ReactButton
            title="Edit"
            type="button"
            theme="outlined-red"
            onClick={() => props.onClickEdit(row)}
          />
        </div>
      );
    },
  },
];

const PurchasePaymentManagement: React.FC = () => {
  const searchParams = useSearchParams();

  const [stockDetailModalCtrl, setStockDetailModalCtrl] = useState<{
    open: boolean;
    serialNumber?: string;
  }>({
    open: false,
  });
  const [editGradeModalCtrl, setEditGradeModalCtrl] = useState<{
    open: boolean;
    bucket?: BucketData;
  }>({
    open: false,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [grader, setGrader] = useState<GraderType>();
  const [graderModalIsOpen, setGraderModalIsOpen] = useState(false);
  const [payload, setPayload] = useState<GetStockListParams>({
    limit: 10,
    page: 1,
    keyword: "",
  });

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getStockList(payload),
    queryKey: [QUERY_KEY.GET_STOCK_LIST],
    refetchInterval: 7200000,
  });

  const gradeResData = useQuery({
    queryFn: () => getAllGrade(),
    queryKey: [QUERY_KEY.GET_ALL_GRADE],
    refetchInterval: 7200000,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const salesCodeResData = useQuery({
    queryFn: () => getSalesBarcode(),
    queryKey: [QUERY_KEY.GET_SALES_CODE],
    refetchInterval: 7200000,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    refetch();
  }, [payload, refetch]);

  const buildPayload = useCallback(() => {
    if (!searchParams) return {};

    const newPayload: Omit<GetStockListNewParams, "sort_by"> = {
      goods_date: searchParams.get("goods_date") || undefined,
      purchase_date: searchParams.get("purchase_date") || undefined,
      goods_status:
        searchParams.getAll("goods_status_list").join(",") || undefined,
      invoice_status:
        searchParams.getAll("invoice_status_list").join(",") || undefined,
      client_code:
        searchParams.getAll("client_code_list").join(",") || undefined,
      goods_status_list:
        (searchParams.getAll(
          "goods_status_list"
        ) as GetStockListNewParams["goods_status_list"]) || undefined,
      invoice_status_list:
        (searchParams.getAll(
          "invoice_status_list"
        ) as GetStockListNewParams["invoice_status_list"]) || undefined,
      client_code_list: searchParams.getAll("client_code_list") || undefined,
    };

    setPayload((state) => ({ ...state, ...newPayload }));
  }, [searchParams]);

  useEffect(() => {
    buildPayload();
  }, [buildPayload]);

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        label: "Sortir Seri Tani DESC",
        onClick: () =>
          setPayload({ ...payload, sort_by: "serial_number:desc" }),
      },
      {
        key: 2,
        label: "Sortir Seri Tani ASC",
        onClick: () => setPayload({ ...payload, sort_by: "serial_number:asc" }),
      },
      {
        key: 3,
        label: "Sortir Barcode Penjualan DESC",
        onClick: () => setPayload({ ...payload, sort_by: "sales_code:desc" }),
      },
      {
        key: 4,
        label: "Sortir Barcode Penjualan ASC",
        onClick: () => setPayload({ ...payload, sort_by: "sales_code:asc" }),
      },
      {
        key: 5,
        label: "Sortir Petani DESC",
        onClick: () => setPayload({ ...payload, sort_by: "farmer_name:desc" }),
      },
      {
        key: 6,
        label: "Sortir Petani ASC",
        onClick: () => setPayload({ ...payload, sort_by: "farmer_name:asc" }),
      },
      {
        key: 7,
        label: "Sortir Koordinator DESC",
        onClick: () =>
          setPayload({ ...payload, sort_by: "coordinator_name:desc" }),
      },
      {
        key: 8,
        label: "Sortir Koordinator ASC",
        onClick: () =>
          setPayload({ ...payload, sort_by: "coordinator_name:asc" }),
      },
    ],
  };

  const renderModal = () => {
    return (
      <>
        {stockDetailModalCtrl.open && (
          <StockDetailModal
            isOpen={stockDetailModalCtrl.open}
            serialNumber={stockDetailModalCtrl.serialNumber || ""}
            onClose={() => setStockDetailModalCtrl({ open: false })}
          />
        )}
        {graderModalIsOpen && (
          <GraderSelectModal
            isOpen={graderModalIsOpen}
            onClose={() => setGraderModalIsOpen(false)}
            onSelect={setGrader}
          />
        )}
        {editGradeModalCtrl.open && grader && (
          <EditGradeModal
            isOpen={editGradeModalCtrl.open}
            bucket={editGradeModalCtrl.bucket}
            grader={grader}
            gradeList={gradeResData.data?.data.data || []}
            clientBarcodeGroupList={salesCodeResData.data?.data.data || []}
            onClose={() => setEditGradeModalCtrl({ open: false })}
            stockListRefetch={refetch}
          />
        )}
        {isFilterModalOpen && (
          <StockFilterModal
            isOpen={isFilterModalOpen}
            params={payload}
            onClose={() => {
              setIsFilterModalOpen(false);
            }}
            onConfirm={(params) => {
              setPayload((state) => ({ ...state, ...params, page: 1 }));
              setIsFilterModalOpen(false);
            }}
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
          <InputComponents
            label="Pencarian"
            placeholder="Seri/Barcode/Petani/Koordinator"
            prefix={<SearchOutlined />}
            onChange={(e) =>
              setPayload({ ...payload, page: 1, keyword: e.target.value })
            }
            allowClear
            style={{ width: 250 }}
          />
          <SortDropdown sortData={menu} label="Urutkan" />
          <SelectComponent
            title="Grader"
            data={["Jopie", "Evan"]}
            placeholder="Pilih grader"
            value={grader}
            onChange={setGrader}
          />
          <ReactButton
            type="button"
            onClick={() => {
              setIsFilterModalOpen(true);
            }}
          >
            <span>Filter</span>
            <FilterSVG height={14} strokeWidth={3} />
          </ReactButton>
        </div>

        <Table
          className="stock-table-wrapper"
          dataSource={isFetching ? [] : data?.data.data}
          loading={isFetching}
          pagination={false}
          rowClassName={(item, idx) =>
            `${idx % 2 !== 0 ? "antd-banded-row" : ""} ${
              ["REJECTED", "REJECTED_BY_GROUPING"].includes(
                item.status || "null"
              )
                ? "antd-banded-row-rejected"
                : ""
            }`
          }
          scroll={{ x: 1450, y: `calc(88vh - 230px)` }}
          sticky
        >
          {columnsList({
            payload,
            onClickDetail: (serialNumber) =>
              setStockDetailModalCtrl({ open: true, serialNumber }),
            onClickEdit: (bucket) => {
              if (grader) {
                setEditGradeModalCtrl({ open: true, bucket });
              } else {
                setGraderModalIsOpen(true);
              }
            },
          }).map((colGroup, idx) => {
            if (!colGroup) return;
            if (colGroup.isGroup)
              return (
                <ColumnGroup
                  key={`group-${colGroup.title}`}
                  title={colGroup.title}
                >
                  {colGroup.group.map((col, idx) => (
                    <Column
                      key={`colGroup-${idx}`}
                      className={styles.purchaseDataGroup}
                      {...col}
                    />
                  ))}
                </ColumnGroup>
              );

            return <Column key={`col-${idx}`} {...colGroup} />;
          })}
        </Table>

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
