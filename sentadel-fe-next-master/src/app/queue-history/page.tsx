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
  Checkbox,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "dayjs/locale/id";
import locale from "antd/es/date-picker/locale/id_ID";
import moment from "moment";
import { ColumnsType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import CircularBadge from "@/components/CircularBadge";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import { queueStatusColor, queueStatusTheme } from "@/constants/queue";
import { dataTableType } from "@/types/dataTable";
import { queueGroupType, queueDataType, queueStatusEnum } from "@/types/queue";
import Chip from "@/components/Chip";
import { transQueueStatus } from "@/util/lang";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import BarcodePrintModal from "./modal/BarcodePrintModal/index.";
import DeliveryPrintModal from "./modal/DeliveryPrintModal";

import styles from "./styles.module.scss";

export type QueuePrintParams = {
  coordinatorName: string;
  deliveryNumber?: string;
  deliveryDate?: string;
  data: queueDataType[];
};

type QueueCheckArgumentType = {
  coordinatorName: string;
  deliveryNumber: string;
  data: queueDataType;
};

const QueueHistory: React.FC = () => {
  const dispatch = useDispatch();
  const [queuePrintParams, setQueuePrintParams] = useState<QueuePrintParams>({
    coordinatorName: "",
    deliveryNumber: "",
    data: [],
  });
  const [dataTable, setDataTable] = useState<queueGroupType[]>([]);
  const [modalPrintBarcodeOpen, setModalPrintBarcodeOpen] =
    useState<boolean>(false);
  const [modalPrintDeliveryOpen, setModalPrintDeliveryOpen] =
    useState<boolean>(false);
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
    current_date: null,
    sortby: null,
    mode: "history",
  });

  const {
    queueGroup,
    loading,
  }: {
    queueGroup: dataTableType<queueGroupType[]> | null;
    loading: boolean | null;
  } = useSelector(({ queueRequest }) => queueRequest);

  const findQueueDataPrint = (queueId: number) => {
    return queuePrintParams.data.find((e) => e.queue_id == queueId);
  };

  const onCheckPrint = (e: CheckboxChangeEvent) => {
    const { data, coordinatorName, deliveryNumber } = e.target
      .value as QueueCheckArgumentType;

    const queueId = findQueueDataPrint(data.queue_id)?.queue_id;
    if (queueId) {
      setQueuePrintParams((state) => {
        const newData = state.data.filter((e) => e.queue_id !== queueId);

        return { ...state, data: newData };
      });
    } else {
      if (deliveryNumber === queuePrintParams.deliveryNumber) {
        setQueuePrintParams((state) => ({
          ...state,
          data: [...state.data, data],
        }));
      } else {
        setQueuePrintParams({
          coordinatorName,
          deliveryNumber,
          data: [data],
        });
      }
    }
  };

  const onClickPrintBarcode = (
    params: QueuePrintParams,
    isChecked?: boolean,
    isPrinted?: boolean
  ) => {
    if (isPrinted) {
      // open unique code modal with validate and butn mode
    } else {
      if (isChecked) {
        setQueuePrintParams(params);
      }
      setModalPrintBarcodeOpen(true);
    }
  };

  const onClickPrintDelivery = (
    params: QueuePrintParams,
    isPrinted?: boolean
  ) => {
    if (isPrinted) {
      // open unique code modal with validate and butn mode
    } else {
      setQueuePrintParams(params);
      setModalPrintDeliveryOpen(true);
    }
  };

  useEffect(() => {
    dispatch({ type: "queueRequest/GET_QUEUE_GROUP", param: params });
  }, [dispatch, params]);

  useEffect(() => {
    if (queueGroup?.data) {
      setDataTable(queueGroup?.data?.map((e, idx) => ({ ...e, key: idx + 1 })));
    }
  }, [queueGroup?.data]);

  useEffect(() => {
    console.log("asdad - queueDataPrint", queuePrintParams);
  }, [queuePrintParams]);

  const renderStatus = useCallback(
    (item: queueStatusEnum) => (
      <Chip theme={queueStatusTheme[item]}>{transQueueStatus(item)}</Chip>
    ),
    []
  );

  const columns: ColumnsType<queueGroupType> = [
    {
      title: "No",
      dataIndex: "key",
      render: (item) => (
        <span>{(params.page - 1) * (params.limit || 0) + item}</span>
      ),
    },
    {
      title: "No. DO",
      dataIndex: "delivery_number",
      render: (item) => item || "-",
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
      title: "Action",
      render: (row: queueGroupType) => {
        const queueData = row.queue_data;
        let statusCounter: queueDataType[] = [];

        queueData?.forEach((e) => {
          if (e.status === queueStatusEnum.APPROVED && !e.printed_at) {
            statusCounter.push(e);
          }
        });

        if (statusCounter.length) {
          const queueIdsPrintArr =
            queuePrintParams.deliveryNumber === row.delivery_number
              ? queuePrintParams.data
              : [];

          return (
            <div className={styles.actionContainer}>
              <ReactButton
                type="button"
                title={`Cetak ${
                  queueIdsPrintArr.length || statusCounter.length
                } antrian`}
                onClick={() =>
                  onClickPrintBarcode(
                    {
                      coordinatorName: row.coordinator_name,
                      data: row.queue_data,
                    },
                    !queueIdsPrintArr.length,
                    statusCounter.every((e) => e.printed_at)
                  )
                }
              />
              <ReactButton
                type="button"
                title="Cetak DO"
                onClick={() =>
                  onClickPrintDelivery(
                    {
                      coordinatorName: row.coordinator_name,
                      deliveryNumber: row.delivery_number,
                      deliveryDate: row.scheduled_arrival_date,
                      data: row.queue_data,
                    },
                    false
                  )
                }
              />
            </div>
          );
        }
      },
    },
  ];

  const expandedRowRender = (row: queueGroupType) => {
    const expandedColumns: TableColumnsType<queueDataType> = [
      {
        title: "",
        width: "5%",
        render: (exRow: queueDataType) => {
          if (exRow.status === queueStatusEnum.APPROVED && !exRow.printed_at) {
            const newQueueDataPrint: QueueCheckArgumentType = {
              coordinatorName: row.coordinator_name,
              deliveryNumber: row.delivery_number,
              data: exRow,
            };

            return (
              <Checkbox
                checked={!!findQueueDataPrint(exRow.queue_id)}
                value={newQueueDataPrint}
                onChange={onCheckPrint}
              />
            );
          }
        },
      },
      { title: "Nama Petani", dataIndex: "farmer_name", width: "15%" },
      { title: "Jenis Produk", dataIndex: "product_type", width: "15%" },
      { title: "Jumlah Keranjang", dataIndex: "quantity_bucket", width: "5%" },
      {
        title: "Tanggal Pengajuan",
        dataIndex: "created_at",
        width: "12%",
        render: (item) => (
          <span>{moment(item).format("DD-MM-YYYY HH:mm") || "-"}</span>
        ),
      },
      {
        title: "Tanggal Terima/Tolak",
        dataIndex: "status_date",
        width: "12%",
        render: (item) => (
          <span>{moment(item).format("DD-MM-YYYY HH:mm") || "-"}</span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        width: "13%",
        render: renderStatus,
      },
      {
        title: "Cetak",
        width: "10%",
        render: (exRow: queueDataType) => {
          if (exRow.status === queueStatusEnum.APPROVED) {
            return (
              <ReactButton
                type="button"
                title={"Cetak"}
                disabled={!!exRow.printed_at}
                onClick={() =>
                  onClickPrintBarcode(
                    {
                      coordinatorName: row.coordinator_name,
                      data: [exRow],
                    },
                    true,
                    !!exRow.printed_at
                  )
                }
              />
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

  const renderModal = () => {
    return (
      <>
        {modalPrintBarcodeOpen && (
          <BarcodePrintModal
            params={queuePrintParams}
            isOpen={modalPrintBarcodeOpen}
            onClose={() => setModalPrintBarcodeOpen(false)}
          />
        )}
        {modalPrintDeliveryOpen && (
          <DeliveryPrintModal
            params={queuePrintParams}
            isOpen={modalPrintDeliveryOpen}
            onClose={() => setModalPrintDeliveryOpen(false)}
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

export default QueueHistory;
