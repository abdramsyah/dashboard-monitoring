"use client";

import { Button, Input, Layout } from "@/components";
import SortDropdown from "@/components/SortButton";
import { SearchOutlined } from "@ant-design/icons";
import { Card, MenuProps, Pagination, Table, TableColumnsType } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import AddNewPartnerForm from "./AddNewPartnerForm";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import { getCoodinatorList, getGroupedPartners } from "@/api/queries/fetch";
import { QUERY_KEY } from "@/api/queries/key";
import { SearchFilterSortParams } from "@/types/global";
import {
  GroupedPartnerModel,
  PartnerModel,
  PartnershipFormProps,
} from "@/types/partnership";
import EditButton from "@/components/Button/EditButton";

const PartnershipManagement: React.FC = () => {
  const [partnersData, setPartnersData] = useState<GroupedPartnerModel[]>([]);
  const [manageModalCtrl, setManageModalCtrl] = useState<{
    open: boolean;
    data?: PartnershipFormProps;
  }>({ open: false });
  const [params, setParams] = useState<SearchFilterSortParams>({
    limit: 10,
    page: 1,
    keyword: "",
  });

  const {
    data: partnersResData,
    isFetching,
    refetch,
  } = useQuery({
    queryFn: () => getGroupedPartners(params),
    queryKey: [QUERY_KEY.GET_GROUPED_PARTNERS],
    refetchInterval: 7200000,
    refetchOnWindowFocus: false,
  });

  const { data: coordinatorResData } = useQuery({
    queryFn: () => getCoodinatorList(),
    queryKey: [QUERY_KEY.GET_ALL_COORDINATOR_LIST],
    refetchInterval: 7200000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (partnersResData?.data.data) {
      const newArr = partnersResData.data.data.map((e, i) => ({
        ...e,
        key: i + 1,
      }));
      setPartnersData(newArr);
    }
  }, [partnersResData]);

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sort Client Id ASC",
        onClick: () => setParams({ ...params, "sortby[0]": "client_id asc" }),
      },
      {
        key: 2,
        title: "Sort Client Id DESC",
        onClick: () => setParams({ ...params, "sortby[0]": "client_id desc" }),
      },
      {
        key: 3,
        title: "Sort Client Name ASC",
        onClick: () => setParams({ ...params, "sortby[0]": "client_name asc" }),
      },
      {
        key: 4,
        title: "Sort Client Name DESC",
        onClick: () =>
          setParams({ ...params, "sortby[0]": "client_name desc" }),
      },
    ],
  };

  const expandedRowRender = (row: GroupedPartnerModel) => {
    const expandedColumns: TableColumnsType<PartnerModel> = [
      { title: "No", dataIndex: "key", width: "8%" },
      { title: "Mitra", dataIndex: "partner_name" },
      { title: "Quota", dataIndex: "partner_quota" },
      {
        title: "",
        dataIndex: "action",
        fixed: "right",
        width: "10%",
        render: (_, exRow) => {
          return (
            <div style={{ display: "flex" }}>
              <div style={{ marginRight: "10px" }}>
                <EditButton
                  onClick={() => {
                    setManageModalCtrl({
                      open: true,
                      data: {
                        name: exRow.partner_name,
                        quota: exRow.partner_quota,
                        coordinator_id: row.coordinator_id,
                        partner_id: exRow.partner_id,
                      },
                    });
                  }}
                />
              </div>
            </div>
          );
        },
      },
    ];

    const expandedData = row.partner_data.map((e, i) => ({ ...e, key: i + 1 }));

    return (
      <Table
        columns={expandedColumns}
        dataSource={expandedData}
        pagination={false}
      />
    );
  };

  const columns: ColumnsType<GroupedPartnerModel> = [
    {
      title: "No",
      dataIndex: "key",
      render: (item) => (
        <span>{((params?.page || 0) - 1) * (params.limit || 0) + item}</span>
      ),
      width: "50px",
    },
    {
      title: "Koordinator",
      dataIndex: "coordinator_name",
    },
    {
      title: "Kode",
      dataIndex: "coordinator_code",
    },
    {
      title: "Jumlah Mitra",
      dataIndex: "partner_data",
      render: (item: PartnerModel[]) => <span>{item.length}</span>,
    },
    {
      title: "",
      dataIndex: "action",
      fixed: "right",
      width: "10%",
      render: (_, row) => {
        return (
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: "10px" }}>
              <Button
                key={"1"}
                className="btn-add"
                onClick={() =>
                  setManageModalCtrl({
                    open: true,
                    data: { coordinator_id: row.coordinator_id },
                  })
                }
              >
                Tambah Mitra
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  const renderModal = () => {
    return (
      <>
        {manageModalCtrl.open && (
          <AddNewPartnerForm
            isModalOpen={manageModalCtrl.open}
            coordinatorList={coordinatorResData?.data.data}
            // coordinatorList={[]}
            refetch={refetch}
            onClose={() => setManageModalCtrl({ open: false })}
            obj={manageModalCtrl.data}
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
          className="btn-add"
          onClick={() => setManageModalCtrl({ open: true })}
        >
          Tambah Mitra Baru
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

          <SortDropdown sortData={menu} />
        </div>

        <Table
          columns={columns}
          dataSource={partnersData}
          loading={isFetching}
          pagination={false}
          expandable={{
            expandedRowRender: expandedRowRender,
            expandRowByClick: true,
            expandIcon: (_) => null,
          }}
        />

        <div className="pagination">
          <Pagination
            current={partnersResData?.data?.meta?.page}
            total={
              (partnersResData?.data?.meta?.pages || 1) * (params.limit || 0)
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
      {renderModal()}
    </Layout>
  );
};

export default PartnershipManagement;
