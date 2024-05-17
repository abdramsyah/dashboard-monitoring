"use client";

import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Card, Pagination, Table, MenuProps } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeleteModal from "../../components/Modal/DeleteModal";
import { Button, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ColumnsType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import UserManagementForm from "./form/ModalForm";
import Chip, { ChipTheme } from "@/components/Chip";
import { UserManagementModel } from "@/types/users";
import InputComponents from "@/components/Input";

const userStatusTheme: { [K in "ACTIVE" | "INACTIVE"]: ChipTheme } = {
  ACTIVE: "outlined-green",
  INACTIVE: "outlined-red",
};

const UserManagement: React.FC = () => {
  const dispatch = useDispatch();

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [userEdit, setUserEdit] = useState<UserManagementModel>();
  const [id, setId] = useState<number>();
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
    filter: null,
    sortby: null,
  });

  const { userData, loading } = useSelector(
    ({ userManagement }) => userManagement
  );
  let dataSource: any[] = [];

  userData?.data.forEach((item: any) => dataSource.push(item));

  const setEdit = (item?: UserManagementModel) => {
    setUserEdit(item);
    setIsModalEditOpen(true);
  };

  useEffect(() => {
    dispatch({ type: "userManagement/GET_USER_LIST", param: params });
  }, [dispatch, params]);

  useEffect(() => {
    dispatch({ type: "userRoles/GET_DATA", param: params });
  }, [dispatch, params]);

  const columns: ColumnsType<UserManagementModel> = [
    {
      title: "No",
      render: (_, __, i) => (
        <div>{((params.page || 0) - 1) * (params.limit || 0) + (i + 1)}</div>
      ),
      width: 60,
    },
    {
      title: "User ID",
      dataIndex: "number_id",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Role",
      dataIndex: "roles",
      render: (item: UserManagementModel["roles"]) => {
        return (
          <div>
            {item?.map((e) => (
              <div key={e.role_id}>• {e.role_description}</div>
            ))}
          </div>
        );
      },
      width: "18%",
    },
    {
      title: "Join Date",
      dataIndex: "created_at",
      render: (item) => <span>{moment(item).format("DD MMMM YYYY")}</span>,
    },
    {
      title: "Latest Update",
      dataIndex: "updated_at",
      render: (item) => <span> {moment(item).format("DD MMMM YYYY")}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (item: "ACTIVE" | "INACTIVE") => (
        <Chip theme={userStatusTheme[item]}>{item}</Chip>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      fixed: "right",
      render: (_, row) => {
        return (
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: "10px" }}>
              <EditOutlined
                onClick={() => {
                  setEdit(row);
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
          <UserManagementForm
            isOpen={isModalEditOpen}
            onClose={() => {
              setIsModalEditOpen(false);
              setUserEdit(undefined);
            }}
            userListParams={params}
            userData={userEdit}
          />
        )}
        {isModalDeleteOpen && (
          <DeleteModal
            isModalOpen={isModalDeleteOpen}
            id={id}
            setIsModalOpen={setIsModalDeleteOpen}
            action={"userManagement/DELETE_DATA"}
            params={params}
          />
        )}
      </>
    );
  };

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Status Active",
        onClick: () => setParams({ ...params, filter: "status:active" }),
      },
      {
        key: 2,
        title: "Status Inactive",
        onClick: () => setParams({ ...params, filter: "status:inactive" }),
      },
      {
        key: 3,
        title: "Sort Client Id ASC",
        onClick: () => setParams({ ...params, sortby: "number_id asc" }),
      },
      {
        key: 4,
        title: "Sort Client Id DESC",
        onClick: () => setParams({ ...params, sortby: "number_id desc" }),
      },
    ],
  };

  return (
    <Layout
      rightHeader={[
        <Button
          key={"1"}
          className="btn-add"
          onClick={() => {
            setIsModalEditOpen(true);
          }}
        >
          Tambah Pengguna Baru
        </Button>,
      ]}
    >
      <ToastContainer autoClose={2000} hideProgressBar={true} />

      <Card className="card-box">
        <div className="filter-search">
          <InputComponents
            label="Pencarian"
            placeholder="Seri/Barcode/Petani/Koordinator"
            prefix={<SearchOutlined />}
            onChange={(e) =>
              setParams({ ...params, page: 1, keyword: e.target.value })
            }
            allowClear
            style={{ width: 250 }}
          />

          <SortDropdown label="Urutkan" sortData={menu} />
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          sticky
          scroll={{ y: `calc(88vh - 230px)` }}
        />

        <div className="pagination">
          <Pagination
            current={userData?.meta?.page}
            total={userData?.meta?.pages * 10}
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

export default UserManagement;
