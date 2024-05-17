"use client";

import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Card, Input, Pagination, Table, MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditModal from "../../components/Modal/EditModal";
import { Button, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ButtonComponent from "@/components/Button/CustomButton";
import RejectModal from "../../components/Modal/RejectModal";
import SortDropdown from "../../components/SortButton";
import { ColumnsType } from "antd/es/table";
import EditGoodsForm from "./form/ModalFormEdit";
import ModalRejectBucketForm from "./form/ModalFormRejectBucket";
import ModalCreateGoodsEntryForm from "./form/ModalForm";

const WeightInfoEntry = () => {
  const dispatch = useDispatch();

  const [isModalAddOpen, setIsModalAddOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [isModalRejectOpen, setIsModalRejectOpen] = useState<boolean>(false);
  const [isModalRejectBucketOpen, setIsModalRejectBucketOpen] =
    useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [body, setBody] = useState<any>({});
  const [id, setId] = useState<number>();
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
    sortby: null,
  });

  const { goodInformationEntryData, loading } = useSelector(
    ({ goodsInformation }) => goodsInformation
  );

  const setEdit = (event: any) => {
    setIsModalEditOpen(!isModalAddOpen);
    setBody(event);
  };

  let dataSource: any[] = [];

  goodInformationEntryData?.data?.coordinator_supplies?.map(
    (item: any, key: number) =>
      dataSource.push({
        ...item,
        key: key + 1,
      })
  );

  const columns: ColumnsType<any> = [
    {
      title: "No",
      dataIndex: "key",
      width: "7%",
      render: (item) => (
        <span>{(params.page - 1) * (params.limit || 0) + item}</span>
      ),
    },
    {
      title: "Company Barcode",
      dataIndex: "company_barcode",
      width: "20%",
    },
    {
      title: "Coordinator Name",
      dataIndex: "coordinator_name",
      width: "20%",
    },
    {
      title: "Client Barcode",
      dataIndex: "client_barcode",
      width: "20%",
    },
    {
      title: "Client Name",
      dataIndex: "client_name",
      width: "20%",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      width: "12%",
    },
    {
      title: "Information",
      dataIndex: "information",
      width: "12%",
      render: (item) => <span>{item || "-"}</span>,
    },
    {
      title: "",
      dataIndex: "action",
      fixed: "right",
      width: "18%",
      render: (_, row) => {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: "10px" }}>
              <ButtonComponent
                className="revise-button"
                onClick={() => {
                  setId(row.id);
                  setIsModalRejectOpen(true);
                }}
                style={{
                  backgroundColor: "#de3323",
                }}
              >
                Tolak
              </ButtonComponent>
            </div>
            <EditOutlined onClick={() => setEdit(row)} />
          </div>
        );
      },
    },
  ];

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sortir Goods Code DESC",
        onClick: () => setParams({ ...params, sortby: "goods_code desc" }),
      },
      {
        key: 2,
        title: "Sortir Goods Code ASC",
        onClick: () => setParams({ ...params, sortby: "goods_code asc" }),
      },
    ],
  };

  useEffect(() => {
    dispatch({ type: "goodsInformationEntry/GET_DATA", param: params });
  }, [dispatch, params]);

  useEffect(() => {
    if (body?.data_client?.id) {
      dispatch({
        type: "gradeDictionary/GET_GRADE_LIST",
        param: {
          client_id: body?.data_client?.id ?? null,
        },
      });
    }
  }, [body?.data_client?.id, dispatch]);

  const renderModal = () => {
    return (
      <>
        {isModalEditOpen && (
          <EditModal
            open={isModalEditOpen}
            onSubmit={() => {}}
            onClose={() => {}}
            title="Edit Goods"
            // desc=''
            // loading={}
            disabled={disabled}
            modalWidth={700}
          >
            <EditGoodsForm
              body={body}
              setBody={setBody}
              setDisabled={setDisabled}
            />
          </EditModal>
        )}
        {isModalAddOpen && (
          <ModalCreateGoodsEntryForm
            body={body}
            isModalOpen={isModalAddOpen}
            listParamsGood={params}
            setIsModalOpen={setIsModalAddOpen}
            setBody={setBody}
            setDisabled={setDisabled}
          />
        )}
        {isModalRejectOpen && (
          <RejectModal
            action={"goodsInformationEntry/REJECT_GOODS_DATA"}
            id={id}
            isModalOpen={isModalRejectOpen}
            setIsModalOpen={setIsModalRejectOpen}
            params={params}
            setBody={setBody}
          />
        )}
        {isModalRejectBucketOpen && (
          <ModalRejectBucketForm
            body={body}
            isModalOpen={isModalRejectBucketOpen}
            onClose={() => setIsModalRejectBucketOpen(false)}
            setBody={setBody}
            setDisabled={setDisabled}
          />
        )}
      </>
    );
  };

  return (
    <Layout
      rightHeader={[
        <div key={"1"} className="btn-container">
          <Button className="btn-add" onClick={() => setIsModalAddOpen(true)}>
            Buat Barang Baru
          </Button>
          <Button
            className="btn-add"
            onClick={() => setIsModalRejectBucketOpen(true)}
          >
            Tolak Keranjang
          </Button>
        </div>,
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
            current={goodInformationEntryData?.data.meta?.page}
            total={
              goodInformationEntryData?.data.meta?.pages * (params.limit || 0)
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

export default WeightInfoEntry;
