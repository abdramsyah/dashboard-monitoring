"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Card, Input, Pagination, Table, MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ColumnsType } from "antd/es/table";
import SortDropdown from "@/components/SortButton";
import { useRouter } from "next/navigation";

const WeightInfoEntry: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [weightParams, setWeightParams] = useState<any>({
    id: null,
    gross_weight: null,
    isEditMode: false,
  });
  const [clientBarcodeParams, setClientBarcodeParams] = useState<any>({
    id: null,
    client_barcode: null,
    isEditMode: false,
  });
  const [params, setParams] = useState<any>({
    limit: 10,
    page: 1,
    keyword: null,
    sortby: null,
  });
  const [isDisabled, setDisabled] = useState<any>({});
  const [dummyWeight, setDummyWeight] = useState<any>({});
  const [dummyClientBarcode, setDummyClientBarcode] = useState<any>({});

  const { weightInformationEntryData, loading } = useSelector(
    ({ WeightInformation }) => WeightInformation
  );

  let dataSource: any[] = [];

  weightInformationEntryData?.data.coordinator_supplies.map(
    (item: any, key: number) =>
      dataSource.push({
        ...item,
        key: key + 1,
        gross_disabled: item.gross_weight ? true : false,
        client_barcode_disabled: item.client_barcode ? true : false,
      })
  );

  const columns: ColumnsType<any> = [
    {
      title: "No",
      dataIndex: "key",
      render: (item) => (
        <span>{(params.page - 1) * (params.limit || 0) + item}</span>
      ),
    },
    {
      title: "Company Barcode",
      dataIndex: "company_barcode",
    },
    {
      title: "Coordinator Name",
      dataIndex: "coordinator_name",
    },
    {
      title: "Client Name",
      dataIndex: "client_name",
    },
    {
      title: "Client Barcode",
      dataIndex: "client_barcode",
      render: (item, row) => {
        if (
          item &&
          (isDisabled[row.id + "client_barcode"] ?? row.client_barcode_disabled)
        ) {
          const handleDoubleClick = () => {
            setDummyClientBarcode({
              [row.id + "client_barcode"]: item,
            });
            setDisabled({
              [row.id + "client_barcode"]: false,
            });
          };

          return (
            <div onDoubleClick={handleDoubleClick}>
              <span>{item}</span>
            </div>
          );
        }

        return (
          <Input
            onFocus={() =>
              setDisabled({
                [row.id + "client_barcode"]: false,
              })
            }
            placeholder="Client Barcode"
            className="form"
            disabled={
              isDisabled[row.id + "client_barcode"] ??
              JSON.stringify(isDisabled) !== "{}"
            }
            value={dummyClientBarcode[row.id + "client_barcode"] ?? undefined}
            onChange={(e) => [
              setDummyClientBarcode({
                [row.id + "client_barcode"]: e.target.value,
              }),
            ]}
            onPressEnter={(e) => {
              if (
                !isDisabled[row.id + "client_barcode"] &&
                dummyClientBarcode[row.id + "client_barcode"] === item
              ) {
              } else {
                setClientBarcodeParams({
                  id: row.id,
                  client_barcode: dummyClientBarcode[row.id + "client_barcode"],
                  isEditMode: false,
                });
              }
              setDisabled({});
            }}
            onBlur={() => setDisabled({})}
          />
        );
      },
    },
    {
      title: "Grade",
      dataIndex: "grade",
    },
    {
      title: "Group",
      dataIndex: "group_name",
      width: "5%",
    },
    {
      title: "Gross Weight",
      dataIndex: "gross_weight",
      render: (item, row) => {
        if (item && (isDisabled[row.id + "weight"] ?? row.gross_disabled)) {
          const handleDoubleClick = () => {
            setDummyWeight({
              [row.id + "weight"]: item / 1000,
            });
            setDisabled({
              [row.id + "weight"]: false,
            });
          };

          return (
            <div onDoubleClick={handleDoubleClick}>
              <span>{(item / 1000).toFixed(2)}</span>
            </div>
          );
        }

        return (
          <Input
            onFocus={() =>
              setDisabled({
                [row.id + "weight"]: false,
              })
            }
            placeholder="Jumlah"
            className="form"
            type="number"
            disabled={
              isDisabled[row.id + "weight"] ??
              JSON.stringify(isDisabled) !== "{}"
            }
            value={dummyWeight[row.id + "weight"] ?? undefined}
            onChange={(e) => [
              setDummyWeight({
                [row.id + "weight"]: e.target.value.length
                  ? parseFloat(e.target.value)
                  : e.target.value,
              }),
            ]}
            onPressEnter={(e) => {
              console.log(
                "update-weight-ase - dummyweight",
                dummyWeight[row.id + "weight"]
              );
              if (
                item &&
                !isDisabled[row.id + "weight"] &&
                dummyWeight[row.id + "weight"] * 1000 !== parseInt(item)
              ) {
                setWeightParams({
                  id: row.id,
                  gross_weight: dummyWeight[row.id + "weight"] || 0,
                  isEditMode: true,
                });
              } else {
                setWeightParams({
                  id: row.id,
                  gross_weight: dummyWeight[row.id + "weight"] || 0,
                  isEditMode: false,
                });
              }
              setDisabled({});
            }}
            onBlur={() => setDisabled({})}
          />
        );
      },
    },
    {
      title: "Net Weight",
      dataIndex: "net_weight",
      render: (item) => <span>{(item / 1000).toFixed(2)}</span>,
    },
    {
      title: "Real Gross Weight",
      dataIndex: "real_gross_weight",
      render: (item) => <span>{(item / 1000).toFixed(2)}</span>,
    },
    {
      title: "Real Net Weight",
      dataIndex: "real_net_weight",
      render: (item) => <span>{(item / 1000).toFixed(2)}</span>,
    },
  ];

  const menu: MenuProps = {
    items: [
      {
        key: 1,
        title: "Sort Vaiable Id ASC",
        onClick: () => setParams({ ...params, sortby: "variable asc" }),
      },
      {
        key: 2,
        title: "Sort Vaiable Id DESC",
        onClick: () => setParams({ ...params, sortby: "variable desc" }),
      },
    ],
  };

  useEffect(() => {
    dispatch({ type: "weightInformationEntry/GET_DATA", param: params });
  }, [dispatch, params]);

  useEffect(() => {
    if (weightParams.id && weightParams.gross_weight) {
      if (!weightParams.isEditMode) {
        dispatch({
          type: "postWeight/POST_DATA",
          param: { ...weightParams, params },
        });
      } else {
        dispatch({
          type: "weightInformationEntry/PUT_DATA",
          param: { ...weightParams, params },
        });
      }
      setWeightParams({
        id: null,
        gross_weight: null,
        isEditMode: false,
      });
    }
  }, [dispatch, params, weightParams]);

  useEffect(() => {
    if (clientBarcodeParams.id && clientBarcodeParams.client_barcode) {
      dispatch({
        type: "weightInformationEntry/INSERT_CLIENT_BARCODE",
        param: { ...clientBarcodeParams, params },
      });
      setClientBarcodeParams({
        id: null,
        client_barcode: null,
        isEditMode: false,
      });
    }
  }, [clientBarcodeParams, dispatch, params]);

  return (
    <Layout
      rightHeader={[
        <div key={"1"} className="btn-container">
          <div className="btn-add">
            <Button
              className="btn-add"
              onClick={() => {
                // dispatch({
                //   type: "barcodeScanner/SCAN_MODE",
                //   param: barcodeScannerRouteParams().scanClientBarcode,
                // });
                router.push("/weight-scanner");
              }}
            >
              Scan Client Barcode
            </Button>
          </div>
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
            current={weightInformationEntryData?.data?.meta?.page}
            total={
              weightInformationEntryData?.data?.meta?.pages *
              (params.limit || 0)
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

export default WeightInfoEntry;
