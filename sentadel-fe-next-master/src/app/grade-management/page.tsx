"use client";

import { SearchOutlined } from "@ant-design/icons";
import {
  Card,
  Input,
  Pagination,
  Table,
  MenuProps,
  TableColumnsType,
} from "antd";
import DeleteModal from "@/components/Modal/DeleteModal";
import { Button, Layout } from "@/components";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { ColumnsType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import CreateGradeForm from "./CreateGradeModal";
import {
  GradeManagementModel,
  GroupedGradeModel,
  GradeSetEditProps,
  GradeGroupModel,
} from "@/types/grades";
import EditButton from "@/components/Button/EditButton";
import DeleteButton from "@/components/Button/DeleteButton";

import "react-toastify/dist/ReactToastify.css";
import PrintGradeModal from "./PrintGradeModal";

const GradeManagement: React.FC = () => {
  const dispatch = useDispatch();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [printGradeModalCtrl, setPrintGradeModalCtrl] = useState<{
    open: boolean;
    data?: GradeManagementModel["grouped_grade"];
  }>({
    open: false,
    data: [],
  });
  const [id, setId] = useState<number>();
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
  });

  useEffect(() => {
    dispatch({ type: "gradeDictionary/GET_GRADE_LIST", param: params });
    dispatch({ type: "clientManagement/GET_DATA" });
  }, [dispatch, params]);

  const { gradeData, loading } = useSelector(
    ({ gradeDictionary }) => gradeDictionary
  );

  let dataSource: any[] = [];

  gradeData?.data.map((item: any, key: number) =>
    dataSource.push({
      ...item,
      key: key + 1,
    })
  );

  const setEdit = (props: GradeSetEditProps) => {
    setIsModalEditOpen(true);
  };

  const nestedRowRender = (row: GradeGroupModel, index: number) => {
    const expandedColumns: TableColumnsType<GroupedGradeModel> = [
      { title: "Grade", dataIndex: "grade", width: "15%" },
      { title: "Harga", dataIndex: "price", width: "15%" },
      { title: "Kuota", dataIndex: "quota", width: "15%" },
      { title: "UB", dataIndex: "ub", width: "15%" },
      {
        title: "",
        dataIndex: "action",
        fixed: "right",
        width: "10%",
        render: (_, row) => {
          return (
            <div style={{ display: "flex" }}>
              <div style={{ marginRight: "10px" }}>
                <EditButton
                  onClick={() => {
                    setEdit({ row, isBatch: false });
                  }}
                />
              </div>
              <div>
                <DeleteButton
                  onClick={() => {
                    setId(row.id);
                    setIsModalDeleteOpen(true);
                  }}
                />
              </div>
            </div>
          );
        },
      },
    ];

    return (
      <Table
        key={`${row.key}-${index}`}
        className="grade-table"
        columns={expandedColumns}
        dataSource={row.grades}
        pagination={false}
      />
    );
  };

  const expandedRowRender = (row: GradeManagementModel) => {
    const expandedColumns: TableColumnsType<GradeGroupModel> = [
      { title: "Initial", dataIndex: "group" },
      {
        title: "Jumlah",
        dataIndex: "grades",
        render: (item: GroupedGradeModel[]) => item?.length,
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
                <EditButton
                  onClick={() => {
                    setEdit({ row, isBatch: true });
                  }}
                />
              </div>
            </div>
          );
        },
      },
    ];

    return (
      <Table
        columns={expandedColumns}
        dataSource={row.grouped_grade}
        pagination={false}
        expandable={{
          expandedRowRender: nestedRowRender,
          expandRowByClick: true,
          expandIcon: (_) => null,
        }}
      />
    );
  };

  const columns: ColumnsType<GradeManagementModel> = [
    {
      title: "No",
      render: (_, __, i) => (
        <div>{((params.page || 0) - 1) * (params.limit || 0) + (i + 1)}</div>
      ),
      width: 60,
    },
    {
      title: "Nama Client",
      dataIndex: "client_name",
    },
    {
      title: "Kode Client",
      dataIndex: "client_code",
    },
    {
      title: "Jumlah Grade",
      dataIndex: "grouped_grade",
      render: (item: GradeGroupModel[]) => {
        let totalGrade = 0;

        for (let i = 0; i < item?.length; i++) {
          totalGrade += item[i]?.grades?.length || 0;
        }

        return totalGrade;
      },
    },
    {
      title: "Cetak",
      dataIndex: "grouped_grade",
      render: (item: GradeGroupModel[]) => {
        let totalGrade = 0;

        for (let i = 0; i < item?.length; i++) {
          totalGrade += item[i]?.grades?.length || 0;
        }

        return (
          <Button
            onClick={() => setPrintGradeModalCtrl({ open: true, data: item })}
          >
            Cetak
          </Button>
        );
      },
    },
  ];

  const renderModal = () => {
    return (
      <>
        {isModalEditOpen && (
          <CreateGradeForm
            isOpen={isModalEditOpen}
            onClose={() => setIsModalEditOpen(false)}
            gradeListParams={params}
          />
        )}
        {isModalDeleteOpen && (
          <DeleteModal
            isModalOpen={isModalDeleteOpen}
            id={id}
            setIsModalOpen={setIsModalDeleteOpen}
            action={"gradeDictionary/DELETE_GRADE"}
            params={params}
          />
        )}
        <PrintGradeModal
          isOpen={printGradeModalCtrl.open}
          params={printGradeModalCtrl?.data || []}
          onClose={() => setPrintGradeModalCtrl({ open: false })}
        />
      </>
    );
  };

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sort Client Id ASC",
        onClick: () => setParams({ ...params, sortby: "client_id asc" }),
      },
      {
        key: 2,
        title: "Sort Client Id DESC",
        onClick: () => setParams({ ...params, sortby: "client_id desc" }),
      },
      {
        key: 3,
        title: "Sort Client Name ASC",
        onClick: () => setParams({ ...params, sortby: "client_name asc" }),
      },
      {
        key: 4,
        title: "Sort Client Name DESC",
        onClick: () => setParams({ ...params, sortby: "client_name desc" }),
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
            // setAction("gradeDictionary/CREATE_GRADE"),
            // setModalDesc({
            //   title: "Add New Grade",
            //   desc: "Registered company will be added to the list",
            // }),
          }}
        >
          Add New Grade
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
          className=""
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
            expandIcon: (_) => <div />,
          }}
        />

        <div className="pagination">
          <Pagination
            current={gradeData?.meta?.page}
            total={gradeData?.meta?.pages * (params.limit || 0)}
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

export default GradeManagement;
