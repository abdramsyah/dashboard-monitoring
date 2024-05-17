"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Card, Input, Pagination, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import { transQueueStatus } from "../../util/lang";
import { ColumnsType } from "antd/es/table";
import ModalRequestQueueForm from "./form/RequestQueueForm";
import QueueRequestListMobile from "./components/MobileView";
import { MobileView } from "react-device-detect";
import Chip, { ChipTheme } from "@/components/Chip";
import nProgress from "nprogress";

import "react-toastify/dist/ReactToastify.css";

const statusThemeData: { [K: string]: ChipTheme } = {
  ON_PROGRESS: "outlined-blue",
  APPROVED: "outlined-green",
  REJECTED: "outlined-red",
};

const QueueRequestPage: React.FC = () => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
    current_date: null,
  });

  const showModal = () => {
    setIsModalOpen(true);
  };
  const onCloseModal = () => {
    setIsModalOpen(false);
    if (nProgress.isStarted()) nProgress.done();
  };

  useEffect(() => {
    dispatch({ type: "queueRequest/GET_DATA", param: params });
  }, [dispatch, params]);

  const { queueList, loading } = useSelector(
    ({ queueRequest }) => queueRequest
  );

  const columns: ColumnsType<any> = [
    {
      title: "No",
      dataIndex: "key",
      render: (item) => (
        <span>{(params.page - 1) * (params.limit || 0) + item}</span>
      ),
      width: "5%",
    },
    {
      title: "Nama Koordinator",
      dataIndex: "coordinator_name",
      width: "10%",
    },
    {
      title: "Nama Petani",
      dataIndex: "farmer_name",
      width: "10%",
    },
    {
      title: "Jenis Produk",
      dataIndex: "product_type",
      width: "10%",
    },

    {
      title: "Jumlah Keranjang",
      dataIndex: "request_quantity",
      width: "10%",
    },
    {
      title: "Status",
      dataIndex: "status",
      width: "6%",
      render: (item) =>
        item && (
          <Chip theme={statusThemeData[item]}>{transQueueStatus(item)}</Chip>
        ),
    },
  ];

  let dataSource: any = [];
  queueList?.data.map((item: any, key: number) =>
    dataSource.push({
      ...item,
      key: key + 1,
    })
  );

  return (
    <Layout
      rightHeader={[
        <Button
          key={"1"}
          type="primary"
          onClick={showModal}
          className="btn-add button-desktop"
        >
          Tambah Antrian
        </Button>,
      ]}
    >
      <ToastContainer autoClose={2000} hideProgressBar={true} />
      {isModalOpen && (
        <ModalRequestQueueForm
          isModalOpen={isModalOpen}
          params={params}
          onClose={onCloseModal}
        />
      )}
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
            <Input
              type="date"
              className="input-search date"
              placeholder="Search"
              onChange={(e) =>
                setParams({ ...params, current_date: e.target.value })
              }
            />
            {/* <SortDropdown sortData={menu} /> */}
          </div>
        </div>

        <Table
          className="table"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
        />

        <MobileView>
          <Button
            type="primary"
            onClick={showModal}
            className="btn-add button-mobile"
          >
            Tambah Antrian
          </Button>
          <QueueRequestListMobile
            params={params}
            dataSource={dataSource}
            loading={loading}
          />
        </MobileView>

        <div className="pagination">
          <Pagination
            current={queueList?.meta?.page}
            total={queueList?.meta?.pages * (params.limit || 0)}
            onChange={(page) =>
              setParams({
                ...params,
                page: page,
              })
            }
          />
        </div>
      </Card>
    </Layout>
  );
};

export default QueueRequestPage;
