"use client";

import { Card, Pagination, Table, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatCurrency } from "../../util/commons";
import { ColumnsType } from "antd/es/table";
import { GroupedGradeModel } from "@/types/grades";

const SupplyPowerManagement: React.FC = () => {
  const dispatch = useDispatch();
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
  });

  useEffect(() => {
    dispatch({ type: "supplyPowerManagement/GET_SPU", param: params });
    dispatch({ type: "supplyPowerManagement/GET_SPR", param: params });
  }, [dispatch, params]);

  const { supplyPowerManagementData, recap, loading } = useSelector(
    ({ clientManagement }) => clientManagement
  );

  const enhancedRemainingSupply = (supply: number) => {
    const newSupply = formatCurrency(Math.abs(supply), true);

    if (supply < 0) {
      return `+ ${newSupply}`;
    }

    return newSupply;
  };

  const columns: ColumnsType<GroupedGradeModel> = [
    {
      title: "No",
      dataIndex: "key",
      render: (item) => (
        <span>{(params.page - 1) * (params.limit || 0) + item}</span>
      ),
    },
    {
      title: "Client Name",
      dataIndex: "client_name",
    },
    {
      title: "Grade",
      dataIndex: "grade",
    },
    {
      title: "Total Demand",
      dataIndex: "quota",
      render: (item) => <span>{formatCurrency(item, true) || 0}</span>,
    },
    {
      title: "Supply Filled",
      dataIndex: "supply_filled",
      render: (item) => <span>{formatCurrency(item, true) || 0}</span>,
    },
    {
      title: "Remaining Supply",
      dataIndex: "remaining_supply",
      render: (item) => <span>{enhancedRemainingSupply(item) || 0}</span>,
    },
  ];

  let dataSource: any[] = [];
  let recapDataSource: {
    quota?: string;
    supply_filled?: string;
    remaining_supply?: string;
  } = {
    quota: "0",
    supply_filled: "0",
    remaining_supply: "0",
  };

  supplyPowerManagementData?.data.power_supply_management.map(
    (item: any, key: number) =>
      dataSource.push({
        ...item,
        key: key + 1,
      })
  );

  recapDataSource = {
    quota: formatCurrency(recap?.data?.quota, true),
    supply_filled: formatCurrency(recap?.data?.supply_filled, true),
    remaining_supply: enhancedRemainingSupply(
      recap?.data?.quota - recap?.data?.supply_filled
    ),
  };

  return (
    <Layout>
      <ToastContainer autoClose={2000} hideProgressBar={true} />

      <Card className="card-box">
        <div className="header">
          <div className="title">
            <h3>Total Demand</h3>
          </div>
          <div className="row">
            <h3>{recapDataSource.quota}</h3>
          </div>
        </div>
        <div className="information">
          <Card className="information-card">
            <div className="title">
              <h3>Supply Filled</h3>
            </div>
            <Typography className="jumlah">
              {recapDataSource.supply_filled}
            </Typography>
          </Card>
          <Card className="information-card">
            <div className="title">
              <h3>Remaining Supply</h3>
            </div>
            <Typography className="jumlah">
              {recapDataSource.remaining_supply}
            </Typography>
          </Card>
        </div>
      </Card>
      <Card className="card-box">
        <div className="header">
          <div className="title">
            <h3>Quota History</h3>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          // scroll={{
          //     x: 1300,
          // }}
        />

        <div className="pagination">
          <Pagination
            current={supplyPowerManagementData?.data.meta?.page}
            total={
              supplyPowerManagementData?.data.meta?.pages * (params.limit || 0)
            }
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

export default SupplyPowerManagement;
