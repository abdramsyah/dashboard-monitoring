"use client";

import { Card, Input, Pagination, Table, Menu, MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SortDropdown from "../../components/SortButton";
import moment from "moment";
import { ColumnsType } from "antd/es/table";

type taxAndFeeFormType = {
  type?: string;
  value?: number;
};

const TaxAndFee: React.FC = () => {
  const dispatch = useDispatch();

  const [taxBody, setTaxBody] = useState<taxAndFeeFormType>();
  const [feeBody, setFeeBody] = useState<taxAndFeeFormType>();
  const [taxList, setTaxList] = useState<any[]>([]);
  const [feeList, setFeeList] = useState<any[]>([]);
  const [taxParams, setTaxParams] = useState<any>({
    limit: 10,
    page: 1,
    sortby: null,
  });
  const [feeParams, setFeeParams] = useState<any>({
    limit: 10,
    page: 1,
    sortby: null,
  });

  const { taxData, feeData, loading } = useSelector(
    ({ taxAndFee }) => taxAndFee
  );

  useEffect(() => {
    if (taxData && taxData.data.length) {
      setTaxList(
        taxData?.data?.map((item: any, key: number) => ({
          ...item,
          key: key + 1,
        }))
      );
    }
  }, [taxData]);

  useEffect(() => {
    if (feeData && feeData.data.length) {
      setFeeList(
        feeData?.data?.map((item: any, key: number) => ({
          ...item,
          key: key + 1,
        }))
      );
    }
  }, [feeData]);

  const taxColumns: ColumnsType<any> = [
    {
      title: "No",
      dataIndex: "key",
      width: "4%",
      render: (item) => (
        <span>{(taxParams.page - 1) * taxParams.limit + item}</span>
      ),
    },
    {
      title: "Tax Type",
      dataIndex: "tax_type",
      width: "10%",
    },
    {
      title: "Tax (%)",
      dataIndex: "tax",
      width: "10%",
    },
    {
      title: "Active From",
      dataIndex: "active_from",
      width: "12%",
      render: (item) => (
        <span>{item ? moment(item).format("DD-MMM-YYYY HH:mm") : "-"}</span>
      ),
    },
    {
      title: "Active To",
      dataIndex: "active_to",
      width: "12%",
      render: (item) => (
        <span>
          {item ? moment(item).format("DD-MMM-YYYY HH:mm") : "Present"}
        </span>
      ),
    },
  ];

  const feeColumns: ColumnsType<any> = [
    {
      title: "No",
      dataIndex: "key",
      width: "4%",
      render: (item) => (
        <span>{(taxParams.page - 1) * taxParams.limit + item}</span>
      ),
    },
    {
      title: "Fee Label",
      dataIndex: "fee_label",
      width: "10%",
    },
    {
      title: "Fee",
      dataIndex: "fee",
      width: "10%",
      render: (item) => (
        <span>
          {Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(item)}
        </span>
      ),
    },
    {
      title: "Active From",
      dataIndex: "active_from",
      width: "12%",
      render: (item) => (
        <span>{item ? moment(item).format("DD-MMM-YYYY HH:mm") : "-"}</span>
      ),
    },
    {
      title: "Active To",
      dataIndex: "active_to",
      width: "12%",
      render: (item) => (
        <span>
          {item ? moment(item).format("DD-MMM-YYYY HH:mm") : "Present"}
        </span>
      ),
    },
  ];

  const sortTaxData: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sortir Nilai Pajak ASC",
        onClick: () => setTaxParams({ ...taxParams, sortby: "variable asc" }),
      },
      {
        key: 2,
        title: "Sortir Nilai Pajak DESC",
        onClick: () => setTaxParams({ ...taxParams, sortby: "variable desc" }),
      },
    ],
  };

  const sortFeeData: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sortir Nilai Potongan ASC",
        onClick: () => setTaxParams({ ...taxParams, sortby: "variable asc" }),
      },
      {
        key: 2,
        title: "Sortir Nilai Potongan DESC",
        onClick: () => setTaxParams({ ...taxParams, sortby: "variable desc" }),
      },
    ],
  };

  useEffect(() => {
    dispatch({
      type: "taxAndFee/GET_TAX_LIST",
      param: taxParams,
    });
  }, [dispatch, taxParams]);

  useEffect(() => {
    dispatch({
      type: "taxAndFee/GET_FEE_LIST",
      param: feeParams,
    });
  }, [dispatch, feeParams]);

  return (
    <Layout>
      <ToastContainer autoClose={2000} hideProgressBar={true} />

      <div className="multi-column-table-container">
        <Card className="card-box">
          <div className="form-title">Set New Tax</div>
          <div className="form-container">
            <Input
              placeholder="Tax Type (e.g.: 'PPh21' without tick)"
              className="form"
              id="tax_type"
              value={taxBody?.type}
              onChange={(e) => setTaxBody({ ...taxBody, type: e.target.value })}
            />
            <Input
              placeholder="Tax (without %)"
              className="form"
              id="tax_value"
              type="number"
              value={taxBody?.value}
              onChange={(e) =>
                setTaxBody({
                  ...taxBody,
                  value: parseFloat(e.target.value || "0"),
                })
              }
            />
            <Button
              className="btn-add"
              disabled={!taxBody?.type && !taxBody?.value}
              // disabled
              onClick={() => {
                dispatch({
                  type: "taxAndFee/SET_NEW_TAX",
                  param: {
                    body: taxBody,
                    params: taxParams,
                  },
                });
              }}
            >
              Submit Tax
            </Button>
          </div>

          <div className="filter-search">
            <div className="sort-filter-container">
              <SortDropdown sortData={sortTaxData} />
            </div>
          </div>

          <Table
            columns={taxColumns}
            dataSource={taxList}
            loading={loading}
            pagination={false}
          />

          <div className="pagination">
            <Pagination
              current={taxData?.meta?.page}
              total={taxData?.meta?.pages * taxParams.limit}
              onChange={(page) =>
                setTaxParams({
                  ...taxParams,
                  page: page,
                })
              }
            />
          </div>
        </Card>
        <Card className="card-box">
          <div className="form-title">Set New Fee</div>
          <div className="form-container">
            <Input
              placeholder="Fee Label (e.g.: 'Potongan' without tick)"
              className="form"
              id="fee_label"
              value={feeBody?.type}
              onChange={(e) => setFeeBody({ ...feeBody, type: e.target.value })}
            />
            <Input
              placeholder="Fee"
              className="form"
              id="fee_value"
              type="number"
              value={feeBody?.value}
              onChange={(e) =>
                setFeeBody({
                  ...feeBody,
                  value: parseInt(e.target.value || "0"),
                })
              }
            />
            <Button
              className="btn-add"
              disabled={!feeBody?.type && !feeBody?.value}
              // disabled
              onClick={() => {
                dispatch({
                  type: "taxAndFee/SET_NEW_FEE",
                  param: {
                    body: feeBody,
                    params: feeParams,
                  },
                });
              }}
            >
              Submit Fee
            </Button>
          </div>

          <div className="filter-search">
            <div className="sort-filter-container">
              <div className="sort-filter-container">
                <SortDropdown sortData={sortFeeData} />
              </div>
            </div>
          </div>

          <Table
            columns={feeColumns}
            dataSource={feeList}
            loading={loading}
            pagination={false}
          />

          <div className="pagination">
            <Pagination
              current={feeData?.meta?.page}
              total={feeData?.meta?.pages * taxParams.limit}
              onChange={(page) =>
                setFeeParams({
                  ...feeParams,
                  page: page,
                })
              }
            />
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default TaxAndFee;
