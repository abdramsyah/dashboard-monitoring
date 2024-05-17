"use client";

import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Card, Input, Pagination, Table, MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Layout } from "../../components";
import DeleteModal from "../../components/Modal/DeleteModal";
import { ColumnsType } from "antd/es/table";
import CoordinatorManagementForm from "./form/CoordinatorManagementForm";
import SortDropdown from "@/components/SortButton";
import { CoordinatorManagementModel } from "@/types/coordinators";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const CoordinatorManagement: React.FC = () => {
  const dispatch = useDispatch();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [id, setId] = useState<number>();
  const [coordinatorEdit, setCoordinatorEdit] =
    useState<CoordinatorManagementModel>();
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
    sortby: null,
  });

  const { coordinatorData, loading } = useSelector(
    ({ coordinatorManagement }) => coordinatorManagement
  );

  useEffect(() => {
    dispatch({
      type: "coordinatorManagement/GET_COORDINATOR_LIST",
      param: params,
    });
    dispatch({ type: "userRoles/GET_DATA" });
  }, [dispatch, params]);

  useEffect(() => {}, [dispatch]);

  const setEdit = (item: CoordinatorManagementModel) => {
    setCoordinatorEdit(item);
    setIsModalEditOpen(true);
  };

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
      title: "ID",
      dataIndex: "coordinator_number",
      width: "15%",
    },
    {
      title: "Nama Koordinator",
      dataIndex: "name",
      width: "25%",
    },
    {
      title: "Kode",
      dataIndex: "code",
      render: (item) => <span>{item || "-"}</span>,
      width: "10%",
    },
    {
      title: "Kuota",
      dataIndex: "quota",
      render: (item) => <span>{item || "-"}</span>,
      width: "10%",
    },
    {
      title: "",
      dataIndex: "action",
      fixed: "right",
      width: "7%",
      render: (_, row) => {
        return (
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: "10px" }}>
              <EditOutlined
                onClick={() => {
                  setEdit(row);
                  setEditMode(true);
                }}
              />
            </div>
            <div>
              <DeleteOutlined
                onClick={() => [setIsModalDeleteOpen(true), setId(row.id)]}
              />
            </div>
          </div>
        );
      },
    },
  ];

  const renderModal = () => {
    return (
      <>
        {isModalEditOpen && (
          <CoordinatorManagementForm
            isOpen={isModalEditOpen}
            coordinatorListParams={params}
            onClose={() => setIsModalEditOpen(false)}
            coordinatorData={coordinatorEdit}
          />
        )}
        {isModalDeleteOpen && (
          <DeleteModal
            isModalOpen={isModalDeleteOpen}
            id={id}
            setIsModalOpen={setIsModalDeleteOpen}
            action={"coordinatorManagement/DELETE_COORDINATOR"}
            params={params}
          />
        )}
      </>
    );
  };

  let dataSource: any[] = [];

  coordinatorData?.data?.map((item: any, idx: number) =>
    dataSource.push({
      ...item,
      key: idx + 1,
    })
  );

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sortir ID Koordinator DESC",
        onClick: () => setParams({ ...params, sortby: "coordinator_id desc" }),
      },
      {
        key: 2,
        title: "Sortir ID Koordinator ASC",
        onClick: () => setParams({ ...params, sortby: "coordinator_id asc" }),
      },
      {
        key: 3,
        title: "Sortir Nama Koordinator DESC",
        onClick: () =>
          setParams({ ...params, sortby: "coordinator_name desc" }),
      },
      {
        key: 4,
        title: "Sortir Nama Koordinator ASC",
        onClick: () =>
          setParams({ ...params, sortby: "coordinator_name desc" }),
      },
    ],
  };

  return (
    <Layout
      rightHeader={[
        <Button
          key={"1"}
          className="btn-add"
          onClick={() => setIsModalEditOpen(true)}
        >
          Tambah Koordinator Baru
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
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          scroll={{
            x: 1300,
          }}
        />

        <div className="pagination">
          <Pagination
            current={coordinatorData?.meta?.page}
            total={coordinatorData?.meta?.pages * (params.limit || 0)}
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

export default CoordinatorManagement;
