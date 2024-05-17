"use client";

import { Button, Input, Layout } from "@/components";
import SortDropdown from "@/components/SortButton";
import { SearchOutlined } from "@ant-design/icons";
import { Card, MenuProps, Pagination, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import {
  getCoodinatorList,
  getLoanList,
  getPartners,
} from "@/api/queries/fetch";
import { QUERY_KEY } from "@/api/queries/key";
import { SearchFilterSortParams } from "@/types/global";
import EditButton from "@/components/Button/EditButton";
import { LoanManagementFormProps, LoanModel } from "@/types/loan-management";
import AddNewLoanForm from "./AddNewLoanForm";
import { formatCurrency, formatDateTime } from "@/util/commons";
import { STORAGE_KEY } from "@/constants/localStorageKey";
import DeleteButton from "@/components/Button/DeleteButton";
import ReactButton from "@/components/ReactHookForm/ReactButton";

const LoanManagement: React.FC = () => {
  const isSuper = useMemo(() => {
    const isSuperJson = localStorage.getItem(STORAGE_KEY.IS_SUPER);

    if (isSuperJson) {
      return JSON.parse(isSuperJson) as boolean;
    }

    return false;
  }, []);

  const [loansData, setLoansData] = useState<LoanModel[]>([]);
  const [manageModalCtrl, setManageModalCtrl] = useState<{
    open: boolean;
    data?: LoanManagementFormProps;
  }>({ open: false });
  const [params, setParams] = useState<SearchFilterSortParams>({
    limit: 10,
    page: 1,
    keyword: "",
  });

  const { data: partnersResData } = useQuery({
    queryFn: () => getPartners(),
    queryKey: [QUERY_KEY.GET_PARTNERS],
    refetchInterval: 7200000,
    refetchOnWindowFocus: false,
  });

  const { data: coordinatorResData } = useQuery({
    queryFn: () => getCoodinatorList(),
    queryKey: [QUERY_KEY.GET_ALL_COORDINATOR_LIST],
    refetchInterval: 7200000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: loanResData, refetch } = useQuery({
    queryFn: () => getLoanList(params),
    queryKey: [QUERY_KEY.GET_LOAN_LIST],
    refetchInterval: 7200000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (loanResData?.data.data) {
      const newArr = loanResData.data.data.map((e, i) => ({
        ...e,
        key: i + 1,
      }));
      setLoansData(newArr);
    }
  }, [loanResData]);

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

  const columns: ColumnsType<LoanModel> = [
    { title: "No", dataIndex: "key", width: "8%" },
    {
      title: "Tanggal",
      dataIndex: "created_at",
      render: (item) => <span>{formatDateTime(item)}</span>,
    },
    { title: "Kode", dataIndex: "code", width: "10%" },
    { title: "Nama Peminjam", dataIndex: "reference_name" },
    {
      title: "Pokok",
      dataIndex: "loan_principal",
      render: (item) => <span>{formatCurrency(item)}</span>,
    },
    {
      title: "Total",
      dataIndex: "total",
      render: (item) => <span>{formatCurrency(item)}</span>,
    },
    { title: "Role", dataIndex: "reference_type" },
    {
      title: "Action",
      width: 100,
      fixed: "right",
      render: (row: LoanModel) => {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {isSuper && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 10,
                  justifyContent: "space-between",
                }}
              >
                <EditButton
                  onClick={() =>
                    setManageModalCtrl({
                      open: true,
                      data: {
                        ...row,
                      },
                    })
                  }
                />
                <DeleteButton
                  onClick={() => {
                    console.log("Hapus Pinjaman");
                  }}
                />
              </div>
            )}
            <ReactButton
              title="Bayar"
              style={{ minHeight: 30, fontSize: 12, padding: 8 }}
              onClick={() => console.log("Tambah Pembayaran")}
            />
          </div>
        );
      },
    },
  ];

  const renderModal = () => {
    return (
      <>
        {manageModalCtrl.open && (
          <AddNewLoanForm
            isModalOpen={manageModalCtrl.open}
            coordinatorList={coordinatorResData?.data.data}
            partnerList={partnersResData?.data.data}
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
          Tambah Pinjaman Baru
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
          dataSource={loansData}
          // loading={isFetching}
          pagination={false}
          scroll={{ x: 1300 }}
        />

        <div className="pagination">
          <Pagination
            current={loanResData?.data?.meta?.page}
            total={(loanResData?.data?.meta?.pages || 1) * (params.limit || 0)}
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

export default LoanManagement;
