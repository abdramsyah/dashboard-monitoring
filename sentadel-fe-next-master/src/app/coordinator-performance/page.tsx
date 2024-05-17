"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Card, Input, MenuProps, Pagination, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout } from "../../components";
import { ColumnsType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import { ItemType } from "antd/es/menu/hooks/useItems";
import nProgress from "nprogress";

const CoordinatorPerformance: React.FC = () => {
  const dispatch = useDispatch();

  const [params, setParams] = useState<any>({
    limit: 5,
    page: 1,
    keyword: null,
    sortby: null,
  });

  const { coordinatorPerformance, loading } = useSelector(
    ({ coordinatorManagement }) => coordinatorManagement
  );

  useEffect(() => {
    dispatch({
      type: "coordinatorManagement/GET_COORDINATOR_PERFORMANCE",
      param: params,
    });
  }, [dispatch, params]);

  const columns: ColumnsType<any> = [
    {
      title: "No",
      dataIndex: "key",
      render: (item) => (
        <span>{(params.page - 1) * (params.limit || 0) + item}</span>
      ),
    },
    {
      title: "ID Koordinator",
      dataIndex: "coordinator_id",
    },
    {
      title: "Nama Koordinator",
      dataIndex: "coordinator_name",
    },
    {
      title: "Supply (%)",
      dataIndex: "supply_accuracy",
      render: (item) => <span>{(item / 1000).toFixed(2) || "-"}</span>,
    },
    {
      title: "Output (%)",
      dataIndex: "output_accuracy",
      render: (item) => <span>{item || "-"}</span>,
    },
  ];

  let dataSource: any[] = [];

  coordinatorPerformance?.data.map((item: any, idx: number) =>
    dataSource.push({
      ...item,
      key: idx + 1,
    })
  );

  const sortList = [
    {
      label: "Sortir ID Koordinaotr",
      sortVal: "coordinator_id",
    },
    {
      label: "Sortir Nama Koordinator",
      sortVal: "coordinator_name",
    },
    {
      label: "Sortir Supply",
      sortVal: "supply_accuracy",
    },
    {
      label: "Sortir Output",
      sortVal: "output_accuracy",
    },
  ];

  const menu: () => MenuProps = () => {
    let menuItem: ItemType[] = [];

    sortList.forEach((e) => {
      for (let i = 0; i <= 1; i++) {
        menuItem.push({
          key: i + 1,
          title: e.label + " " + (i % 2 === 0 ? "DESC" : "ASC"),
          onClick: () =>
            setParams({
              ...params,
              sortby: `${e.sortVal} ${i % 2 === 0 ? "desc" : "asc"}`,
            }),
        });
      }
    });

    return { items: menuItem };
  };

  return (
    <Layout>
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

          <SortDropdown sortData={menu()} />
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          rowClassName={(record, _) =>
            record.supply_accuracy / 1000 >= 100 ? "selected-row-bg" : "none"
          }
          scroll={{
            x: 1300,
          }}
        />

        <div className="pagination">
          <Pagination
            current={coordinatorPerformance?.meta?.page}
            total={coordinatorPerformance?.meta?.pages * (params.limit || 0)}
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

export default CoordinatorPerformance;
