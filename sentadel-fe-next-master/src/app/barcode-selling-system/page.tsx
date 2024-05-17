"use client";

import { Layout } from "@/components";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Input, Pagination, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { useEffect, useMemo, useState } from "react";
import BarcodeSellingCreateForm from "./form/BarcodeSellingCreateModal";
import { useDispatch, useSelector } from "react-redux";
import {
  BarcodeFilterSortParams,
  ClientBarcodeGroupModel,
} from "@/types/barcodeSystem";

const BarcodeSellingSystem: React.FC = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [params, setParams] = useState<BarcodeFilterSortParams>({
    limit: 10,
    page: 1,
    keyword: "",
    "filter[0]": 'module:[""]',
  });

  const {
    barcodeSales,
  }: { barcodeSales?: { data?: ClientBarcodeGroupModel[] } } = useSelector(
    ({ barcodeSystem }) => barcodeSystem
  );

  const barcodeSalesData: ClientBarcodeGroupModel[] = useMemo(() => {
    return barcodeSales?.data?.map((data, idx) => ({
      ...data,
      key: idx + 1,
    })) as ClientBarcodeGroupModel[];
  }, [barcodeSales?.data]);

  useEffect(() => {
    dispatch({ type: "barcodeSystem/GET_BARCODE_SALES", param: params });
  }, [dispatch, params]);

  const columns: ColumnsType<ClientBarcodeGroupModel> = [
    {
      title: "No",
      dataIndex: "key",
      render: (item) => (
        <span>{((params.page || 0) - 1) * (params.limit || 0) + item}</span>
      ),
      width: "5%",
    },
    {
      title: "Nama Koordinator",
      dataIndex: "user_name",
      width: "10%",
    },
    {
      title: "Nama Petani",
      dataIndex: "client_name",
      width: "10%",
    },
    {
      title: "Barcode",
      dataIndex: "code_data",
      width: "10%",
      render: (item: ClientBarcodeGroupModel["code_data"]) => {
        return item?.map((e, idx) => (
          <div key={idx.toString()}>{`${e.initial} = ${e.codes?.length}`}</div>
        ));
      },
    },
  ];

  const renderModal = () => {
    return (
      <>
        {isModalOpen && (
          <BarcodeSellingCreateForm
            isModalOpen={isModalOpen}
            params={params}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </>
    );
  };

  return (
    <Layout
      rightHeader={[
        <ReactButton
          key={"1"}
          type="button"
          title="Cetak Barcode Baru"
          onClick={() => setIsModalOpen(true)}
        />,
      ]}
    >
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
          dataSource={barcodeSalesData}
          pagination={false}
        />

        <div className="pagination">
          <Pagination
            // current={queueList?.meta?.page}
            // total={queueList?.meta?.pages * (params.limit  || 0)}
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

export default BarcodeSellingSystem;
