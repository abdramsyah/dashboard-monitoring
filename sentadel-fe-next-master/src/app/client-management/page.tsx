"use client";

import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Card,
  Input,
  MenuProps,
  Pagination,
  Table,
  TableColumnsType,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeleteModal from "../../components/Modal/DeleteModal";
import { Button, Layout } from "../../components";
import ClientManagementForm from "./ClientManagementForm";
import SortDropdown from "@/components/SortButton";
import { ColumnsType } from "antd/es/table";
import { AddressModel, ClientModel } from "@/types/clients";
import Chip, { ChipTheme } from "@/components/Chip";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import AddressManagementForm from "./AddressManagementForm";

const clientStatusTheme: { [K in "ACTIVE" | "INACTIVE"]: ChipTheme } = {
  ACTIVE: "outlined-green",
  INACTIVE: "outlined-red",
};

const ClientManagement: React.FC = () => {
  const dispatch = useDispatch();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [addressManagementModalCtrl, setAddressManagementModalCtrl] = useState<
    { open: false } | { open: true; addressData: AddressModel }
  >({ open: false });
  const [clientEdit, setClientEdit] = useState<ClientModel>();
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
    filter: null,
    sortby: null,
  });

  const { clientData, loading } = useSelector(
    ({ clientManagement }) => clientManagement
  );

  const fetchingData = useCallback(
    () => dispatch({ type: "clientManagement/GET_DATA", param: params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params]
  );

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  const expandedRowRender = (row: ClientModel) => {
    const expandedColumns: TableColumnsType<AddressModel> = [
      {
        title: "No.",
        render: (_, __, idx) => idx + 1,
      },
      { title: "Alamat", dataIndex: "address" },
      {
        title: "",
        dataIndex: "action",
        fixed: "right",
        render: (_, xRow) => (
          <div>
            <EditOutlined
              onClick={() =>
                setAddressManagementModalCtrl({ open: true, addressData: xRow })
              }
            />
          </div>
        ),
      },
    ];

    return (
      <Table
        columns={expandedColumns}
        dataSource={row.address_list}
        pagination={false}
      />
    );
  };

  const columns: ColumnsType<ClientModel> = [
    {
      title: "No",
      render: (_, __, i) => (
        <div>{((params.page || 0) - 1) * (params.limit || 0) + (i + 1)}</div>
      ),
      width: 60,
    },
    {
      title: "Nama",
      dataIndex: "client_name",
    },
    {
      title: "Kode",
      dataIndex: "code",
    },
    {
      title: "Total Kuota",
      dataIndex: "quota",
    },
    {
      title: "Jumlah Grade",
      dataIndex: "total_company_grade",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (item: "ACTIVE" | "INACTIVE") => (
        <Chip theme={clientStatusTheme[item]}>{item}</Chip>
      ),
    },
    {
      title: "",
      dataIndex: "action",
      fixed: "right",
      render: (_, row) => {
        if (row.status === "ACTIVE")
          return (
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div>
                <EditOutlined onClick={() => setEdit(row)} />
              </div>
              <div>
                <DeleteOutlined onClick={() => setIsModalDeleteOpen(true)} />
              </div>
              <div style={{ scale: 0.7 }}>
                <ReactButton
                  type="button"
                  title={
                    row.address_list?.length ? "Tambah Alamat" : "Buat Alamat"
                  }
                  onClick={() => {
                    setAddressManagementModalCtrl({
                      open: true,
                      addressData: { client_id: row.id },
                    });
                  }}
                />
              </div>
            </div>
          );

        return null;
      },
    },
  ];

  const renderModal = () => {
    return (
      <>
        {isModalEditOpen && (
          <ClientManagementForm
            isOpen={isModalEditOpen}
            onClose={() => setIsModalEditOpen(false)}
            clientData={clientEdit}
            clientListParams={params}
          />
        )}
        {isModalDeleteOpen && (
          <DeleteModal
            isModalOpen={isModalDeleteOpen}
            setIsModalOpen={setIsModalDeleteOpen}
            action={"clientManagement/DELETE_DATA"}
            params={params}
          />
        )}
        {addressManagementModalCtrl.open && (
          <AddressManagementForm
            isOpen={addressManagementModalCtrl.open}
            onClose={() => setAddressManagementModalCtrl({ open: false })}
            addressData={addressManagementModalCtrl.addressData}
            onSuccessManage={() =>
              dispatch({ type: "clientManagement/GET_DATA", param: params })
            }
          />
        )}
      </>
    );
  };

  const setEdit = (item?: ClientModel) => {
    setClientEdit(item);
    setIsModalEditOpen(true);
  };

  let dataSource: any[] = [];

  clientData?.data.map((item: any, idx: number) =>
    dataSource.push({
      ...item,
      key: idx + 1,
    })
  );

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Reset Filter",
        onClick: () => setParams({ ...params, filter: "", page: 1 }),
      },
      {
        key: 2,
        title: "Filter by Status Active",
        onClick: () =>
          setParams({ ...params, filter: "status:active", page: 1 }),
      },
      {
        key: 3,
        title: "Filter by Status Inactive",
        onClick: () =>
          setParams({ ...params, filter: "status:inactive", page: 1 }),
      },
      {
        key: 4,
        title: "Sortir Client Id DESC",
        onClick: () => setParams({ ...params, sortby: "client_id desc" }),
      },
      {
        key: 5,
        title: "Sortir Client Id ASC",
        onClick: () => setParams({ ...params, sortby: "client_id asc" }),
      },
    ],
  };

  return (
    <>
      <Layout
        rightHeader={[
          <Button
            key={"1"}
            className="btn-add"
            onClick={() => {
              setEdit();
            }}
          >
            Tambah Client Baru
          </Button>,
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

            <SortDropdown sortData={menu} />
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={false}
            sticky
            scroll={{ y: `calc(88vh - 230px)` }}
            expandable={{
              expandedRowRender: expandedRowRender,
            }}
            rowClassName={(item, idx) =>
              idx % 2 !== 0 ? "antd-banded-row" : ""
            }
          />

          <div className="pagination">
            <Pagination
              current={clientData?.meta?.page}
              total={clientData?.meta?.pages * (params.limit || 0)}
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
    </>
  );
};

export default ClientManagement;
