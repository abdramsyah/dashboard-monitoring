"use client";

import { SearchOutlined } from "@ant-design/icons";
import {
  Card,
  Input,
  Pagination,
  Table,
  DatePicker,
  MenuProps,
  TableColumnsType,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import locale from "antd/es/date-picker/locale/id_ID";
import moment from "moment";
import { ColumnsType } from "antd/es/table";
import ModalProcessQueueForm from "./ModalProcessQueueForm";
import SortDropdown from "@/components/SortButton";
import {
  queueDataBodyType,
  queueDataType,
  queueGroupType,
  queueStatusEnum,
} from "@/types/queue";
import CircularBadge from "@/components/CircularBadge";
import { initialQueueBody, queueStatusColor } from "@/constants/queue";
import { dataTableType } from "@/types/dataTable";
import nProgress from "nprogress";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import dayjs from "dayjs";
import "dayjs/locale/id";
import ModalRequestQueueForm from "./RequestQueueForm";

const QueueApprovalPage: React.FC = () => {
  const dispatch = useDispatch();
  const [queueBody, setQueueBody] =
    useState<queueDataBodyType>(initialQueueBody);
  const [dataTable, setDataTable] = useState<queueGroupType[]>([]);
  const [isModalRejectOpen, setModalRejectOpen] = useState<boolean>(false);
  const [isModalApproveOpen, setModalApproveOpen] = useState<boolean>(false);
  const [isModalRequestOpen, setModalRequestOpen] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
    current_date: null,
    sortby: null,
    "filter[0]": `status:ON_PROGRESS`,
  });

  const {
    queueGroup,
    loading,
  }: {
    queueGroup: dataTableType<queueGroupType[]> | null;
    loading: boolean | null;
  } = useSelector(({ queueRequest }) => queueRequest);

  const onChangeDate = (_: dayjs.Dayjs | null, date: string) =>
    setQueueBody((state) => ({ ...state, date }));

  const onClose = (isReject?: boolean) => {
    if (isReject) {
      setModalRejectOpen(false);
    } else {
      setModalApproveOpen(false);
    }
    setQueueBody(initialQueueBody);
  };

  const onFinishSaga = (isReject?: boolean) => {
    onClose(isReject);
    dispatch({ type: "queueRequest/GET_QUEUE_GROUP", param: params });
  };

  const onSubmit = (action: string) => {
    dispatch({
      type: action,
      param: {
        body: queueBody,
        params,
        onFinishSaga,
      },
    });
  };

  useEffect(() => {
    dispatch({ type: "queueRequest/GET_QUEUE_GROUP", param: params });
  }, [dispatch, params]);

  useEffect(() => {
    if (queueGroup?.data) {
      setDataTable(queueGroup?.data?.map((e, idx) => ({ ...e, key: idx + 1 })));
    }
  }, [queueGroup?.data]);

  const renderActionButton = (
    onReject: () => void,
    onApprove: () => void,
    reject: string,
    approve: string
  ) => {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "10px" }}>
          <ReactButton
            type="button"
            theme="outlined-red"
            onClick={onReject}
            title={reject}
          />
        </div>
        <div>
          <ReactButton
            type="button"
            theme="solid-blue"
            onClick={onApprove}
            title={approve}
          />
        </div>
      </div>
    );
  };

  const columns: ColumnsType<queueGroupType> = [
    {
      title: "No",
      dataIndex: "key",
      render: (item) => (
        <span>{(params.page - 1) * (params.limit || 0) + item}</span>
      ),
    },
    {
      title: "Nama Koordinator",
      dataIndex: "coordinator_name",
    },
    {
      title: "Tanggal Pengajuan Terakhir",
      dataIndex: "last_created_at",
      render: (item) => (
        <span>{moment(item).format("DD-MM-YYYY HH:mm") || "-"}</span>
      ),
    },
    {
      title: "Jumlah Keranjang",
      dataIndex: "quantity_bucket",
      render: (item) => <span>{item || "-"}</span>,
    },
    {
      title: "Keterangan",
      dataIndex: "queue_data",
      render: (item: queueDataType[]) => {
        let statusCounter = {
          [queueStatusEnum.APPROVED]: 0,
          [queueStatusEnum.ON_PROGRESS]: 0,
          [queueStatusEnum.REJECTED]: 0,
        };

        item?.forEach((e) => (statusCounter[e.status] += 1));

        return (
          <div>
            {Object.keys(statusCounter).map((e, idx) => {
              const status = e as queueStatusEnum;
              if (statusCounter[status]) {
                return (
                  <CircularBadge
                    key={idx.toString()}
                    backgroundColor={queueStatusColor[status]}
                  >
                    {statusCounter[status]}
                  </CircularBadge>
                );
              }
            })}
          </div>
        );
      },
    },
    {
      title: "",
      width: "5%",
      render: (row: queueGroupType) => {
        let statusCounter: { [K in queueStatusEnum]: number[] } = {
          [queueStatusEnum.APPROVED]: [],
          [queueStatusEnum.ON_PROGRESS]: [],
          [queueStatusEnum.REJECTED]: [],
        };

        row?.queue_data?.forEach((e) =>
          statusCounter[e.status].push(e.queue_id)
        );

        if (statusCounter[queueStatusEnum.ON_PROGRESS].length) {
          return renderActionButton(
            () => {
              setQueueBody((state) => ({
                ...state,
                list: row.queue_data,
                total: row.quantity_bucket,
              }));
              setModalRejectOpen(true);
            },
            () => {
              setQueueBody((state) => ({
                ...state,
                list: row.queue_data,
                total: row.quantity_bucket,
                code: row.coordinator_code,
                accumBucket: row.accum_bucket,
              }));
              setModalApproveOpen(true);
            },
            "Tolak Semua",
            "Terima Semua"
          );
        }

        return null;
      },
    },
  ];

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sortir Seri Tani Code DESC",
        onClick: () => setParams({ ...params, sortby: "serial_number desc" }),
      },
      {
        key: 2,
        title: "Sortir Seri Tani ASC",
        onClick: () => setParams({ ...params, sortby: "serial_number asc" }),
      },
    ],
  };

  const expandedRowRender = (row: queueGroupType) => {
    const expandedColumns: TableColumnsType<queueDataType> = [
      { title: "Nama Petani", dataIndex: "farmer_name" },
      { title: "Jenis Produk", dataIndex: "product_type" },
      { title: "Jumlah Keranjang", dataIndex: "quantity_bucket" },
      {
        title: "Tanggal Pengajuan",
        dataIndex: "created_at",
        render: (item) => (
          <span>{moment(item).format("DD-MM-YYYY HH:mm") || "-"}</span>
        ),
      },
      {
        title: "",
        render: (exRow: queueDataType) => {
          if (exRow.status === queueStatusEnum.ON_PROGRESS) {
            return renderActionButton(
              () => {
                setQueueBody((state) => ({
                  ...state,
                  list: [exRow],
                  total: exRow.quantity_bucket,
                }));
                setModalRejectOpen(true);
              },
              () => {
                setQueueBody((state) => ({
                  ...state,
                  list: [exRow],
                  total: exRow.quantity_bucket,
                  code: row.coordinator_code,
                  accumBucket: row.accum_bucket,
                }));
                setModalApproveOpen(true);
              },
              "Tolak",
              "Terima"
            );
          }
        },
      },
    ];

    return (
      <Table
        columns={expandedColumns}
        dataSource={row.queue_data}
        pagination={false}
      />
    );
  };

  const renderModal = () => {
    return (
      <>
        {isModalApproveOpen && (
          <ModalProcessQueueForm
            title="Apakah anda akan menerima antrian berikut di bawah?"
            confirm={queueBody.list.length > 1 ? "Terima Semua" : "Terima"}
            queueBody={queueBody}
            loading={nProgress.isStarted()}
            isModalOpen={isModalApproveOpen}
            onClose={onClose}
            onSubmit={() => onSubmit("queueRequest/APPROVE_QUEUE")}
            onChangeDate={onChangeDate}
          />
        )}
        {isModalRejectOpen && (
          <ModalProcessQueueForm
            title="Apakah anda akan menolak antrian berikut di bawah?"
            confirm={queueBody.list.length > 1 ? "Tolak Semua" : "Tolak"}
            queueBody={queueBody}
            loading={nProgress.isStarted()}
            isModalOpen={isModalRejectOpen}
            onClose={() => onClose(true)}
            onSubmit={() => onSubmit("queueRequest/REJECT_QUEUE")}
            onChangeDate={onChangeDate}
            cancelFocused
          />
        )}
        {isModalRequestOpen && (
          <ModalRequestQueueForm
            isModalOpen={isModalRequestOpen}
            params={params}
            onClose={() => setModalRequestOpen(false)}
          />
        )}
      </>
    );
  };

  return (
    <Layout
      rightHeader={[
        <Button
          key={"1"}
          type="primary"
          onClick={() => setModalRequestOpen(true)}
          className="btn-add button-desktop"
        >
          Tambah Antrian
        </Button>,
      ]}
    >
      <ToastContainer autoClose={2000} hideProgressBar={true} />
      <Card className="card-box">
        <div className="filter-search">
          <Input
            className="input-search"
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={(e) =>
              setParams({ ...params, page: 1, keyword: e.target.value })
            }
          />

          <div className="right-filter">
            <DatePicker
              locale={locale}
              className="date-picker"
              onChange={(_, dateString) => {
                setParams({
                  ...params,
                  current_date: dateString,
                });
              }}
            />
            <SortDropdown sortData={menu} />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={dataTable}
          loading={!!loading}
          pagination={false}
          expandable={{ expandedRowRender }}
        />

        <div className="pagination">
          <Pagination
            current={queueGroup?.meta?.page}
            total={(queueGroup?.meta?.pages || 0) * (params.limit || 0)}
            onChange={(page) =>
              setParams({
                ...params,
                page: page,
              })
            }
          />
        </div>
      </Card>
      {renderModal()}
    </Layout>
  );
};

export default QueueApprovalPage;
