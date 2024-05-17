import React, { useEffect, useState } from "react";
import {
  Select,
  Pagination,
  Table,
  Input,
  Button,
  Checkbox,
  Modal,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { convertDateTimeDBtoIndo } from "@/util/commons";

interface ModalCreateGoodsEntryFormProps {
  body: any;
  listParamsGood: any[];
  setBody: (val: any) => void;
  setIsModalOpen: (val: boolean) => void;
  isModalOpen: boolean;
  setDisabled: (val: boolean) => void;
}

const ModalCreateGoodsEntryForm: React.FC<ModalCreateGoodsEntryFormProps> = (
  props: ModalCreateGoodsEntryFormProps
) => {
  const {
    body,
    listParamsGood,
    setBody,
    setIsModalOpen,
    isModalOpen,
    setDisabled,
  } = props;

  const dispatch = useDispatch();
  const {
    CoordinatorDropdown,
    loadingCoordinator,
    clientDropdown,
    loadingClient,
    loadingProfit,
    gradePrice,
    loadingBucket,
    bucketList,
  } = useSelector(({ goodsInformation }) => goodsInformation);

  const { gradeData, loading } = useSelector(
    ({ gradeDictionary }) => gradeDictionary
  );
  const [preview, setPreview] = useState(false);

  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  if (
    body?.coordinator_name?.length === 0 ||
    body?.coordinator_code?.length === 0 ||
    body?.company_barcode?.length === 0 ||
    body?.company_barcode?.length === 0 ||
    body?.client_name?.length === 0 ||
    body?.client_code?.length === 0 ||
    body?.client_barcode?.length === 0
  ) {
    setDisabled(true);
  } else {
    setDisabled(false);
  }

  // param for table bucket list
  const [params, setParams] = useState({
    limit: 5,
    page: 1,
    keyword: "",
    coordinator_id: null,
  });

  // function mencari id yg telah di checklist
  const findDataCheck = (value: any) => {
    const object = selectedData.find((obj: any) => obj.barcode_id === value);
    return object;
  };

  const onCheck = (checkedValues: any) => {
    // jika id telah ada hapus data
    if (findDataCheck(checkedValues.target.value.barcode_id)) {
      return setSelectedData((prevState) =>
        prevState.filter(
          (data: any) =>
            data.barcode_id !== checkedValues.target.value.barcode_id
        )
      );
    }

    let dataChecked = checkedValues.target.value;
    dataChecked.Number = selectedData.length + 1;
    // simpan data dan button next di aktifkan
    setSelectedData([...selectedData, checkedValues.target.value]);
    setDisabled(false);
  };

  useEffect(() => {
    if (params.coordinator_id) {
      dispatch({
        type: "bucketList/GET_DATA",
        param: params,
      });
    }
  }, [dispatch, params]);

  let selectCoordinator: any[] = [];
  let selectClients: any[] = [];
  let selectProfit: any[] = [];
  let selectGrade: any[] = [];
  let dataBucket: any[] = [];

  // variable for handle null data after close modal & submit data
  let empty: any[] = [];

  CoordinatorDropdown?.data.map((item: any, key: number) =>
    selectCoordinator.push({
      ...item,
      key: key + 1,
    })
  );

  clientDropdown?.data.clients.map((item: any, key: number) =>
    selectClients.push({
      ...item,
      key: key + 1,
    })
  );

  gradeData?.data.map((item: any, key: number) =>
    selectGrade.push({
      ...item,
      key: key + 1,
    })
  );

  const columns: ColumnsType<any> = [
    {
      title: "",
      width: "4%",
      render: (rec) => (
        <>
          <Checkbox
            checked={findDataCheck(rec.barcode_id) !== undefined ? true : false}
            value={rec}
            onChange={onCheck}
          />
        </>
      ),
      fixed: "left",
    },
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
      title: "Farmer Name",
      dataIndex: "farmer_name",
    },
    {
      title: "Queue Date",
      dataIndex: "queue_date",
      render: (item) => <span>{convertDateTimeDBtoIndo(item)}</span>,
    },
    {
      title: "Scan Date",
      dataIndex: "scan_date",
      render: (item) => <span>{convertDateTimeDBtoIndo(item)}</span>,
    },
  ];

  const columnsSelect: ColumnsType<any> = [
    {
      title: "",
      width: "4%",
      render: (rec) => (
        <>
          <Checkbox
            checked={findDataCheck(rec.barcode_id) !== undefined ? true : false}
            value={rec}
            onChange={onCheck}
          />
        </>
      ),
      fixed: "left",
    },
    {
      title: "No",
      dataIndex: "Number",
      render: (item) => <span>{item}</span>,
    },
    {
      title: "Company Barcode",
      dataIndex: "company_barcode",
    },

    {
      title: "Farmer Name",
      dataIndex: "farmer_name",
    },
    {
      title: "Queue Date",
      dataIndex: "queue_date",
      render: (item) => <span>{convertDateTimeDBtoIndo(item)}</span>,
    },
    {
      title: "Scan Date",
      dataIndex: "scan_date",
      render: (item) => <span>{convertDateTimeDBtoIndo(item)}</span>,
    },
  ];

  bucketList?.data?.bucket_list.map((item: any, key: number) =>
    dataBucket.push({
      ...item,
      key: key + 1,
    })
  );

  const onFinishSaga = () => {
    setIsModalOpen(false);
    setSelectedData([]);
    setPreview(false);
    setBody({});
    setSubmitLoading(false);
  };

  return (
    <Modal
      footer={null}
      className="modalEdit"
      width={1300}
      title=""
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
    >
      <div>
        <h4>Create New Entry</h4>
        <p>Goods info will be added to the list</p>
        <div className="form-input">
          <div className="row">
            {/* client name */}
            <div className="field-box">
              <label htmlFor="variable">Client Name</label>
              <Select
                showSearch
                placeholder={"Please select Client Name"}
                defaultValue={body?.data_client?.client_name}
                value={body?.data_client?.client_name}
                loading={!loadingClient}
                disabled={preview}
                onClick={() => dispatch({ type: "clientDropdown/GET_DATA" })}
                onChange={(e) => {
                  setBody({ ...body, data_client: JSON.parse(e) });
                }}
              >
                {loadingClient ? (
                  <Skeleton />
                ) : (
                  selectClients.map((select, index) => (
                    <Select.Option key={index} value={JSON.stringify(select)}>
                      {select.client_name}
                    </Select.Option>
                  ))
                )}
              </Select>
            </div>
            {/* client name */}

            {/* grade */}
            <div className="field-box">
              <label htmlFor="price">Client - Company Grade</label>
              <Select
                showSearch
                placeholder={"Please select Company Grade"}
                defaultValue={body?.dataGrade?.grade}
                value={body?.dataGrade?.grade}
                loading={!loading}
                disabled={!body.data_client ? !body.data_client : preview}
                // onClick={() => dispatch({ type: "gradeDictionary/GET_GRADE_LIST" })}
                onChange={(e) => {
                  const data = JSON.parse(e);
                  dispatch({
                    type: "getGradePrice/POST_DATA",
                    param: {
                      client_id: body?.data_client.id,
                      grade_id: data.id,
                    },
                  });
                  setBody({ ...body, dataGrade: JSON.parse(e) });
                }}
              >
                {loading ? (
                  <Skeleton />
                ) : (
                  selectGrade.map((select, index) => (
                    <Select.Option key={index} value={JSON.stringify(select)}>
                      {select?.grade}
                    </Select.Option>
                  ))
                )}
              </Select>
              <label htmlFor="price">
                {body?.dataGrade?.grade && (
                  <>
                    Unit Price : <strong>{gradePrice?.data?.price}</strong>
                  </>
                )}
              </label>
            </div>
            {/* grade */}

            {/* profit  */}
            <div className="field-box">
              <label htmlFor="variable">Profit</label>
              <Select
                showSearch
                placeholder={"Please select Profit "}
                defaultValue={body?.dataProfit?.variable}
                value={body?.dataProfit?.variable}
                loading={!loadingProfit}
                disabled={preview}
                onClick={() => dispatch({ type: "profitDropdown/GET_DATA" })}
                onChange={(e) =>
                  setBody({ ...body, dataProfit: JSON.parse(e) })
                }
              >
                {loadingProfit ? (
                  <Skeleton />
                ) : (
                  selectProfit.map((select, index) => (
                    <Select.Option key={index} value={JSON.stringify(select)}>
                      {select.variable}
                    </Select.Option>
                  ))
                )}
              </Select>
            </div>
            {/* profit  */}
          </div>
          <div className="row">
            {/* coordinator name */}
            <div
              className="field-box"
              style={{
                width: "40%",
              }}
            >
              <label htmlFor="variable">Coordinator Name</label>
              <Select
                showSearch
                placeholder={"Please select Coordinator Name"}
                defaultValue={body?.coordinator_name}
                value={body?.coordinator_name}
                disabled={preview}
                loading={!loadingCoordinator}
                onClick={() =>
                  dispatch({ type: "coordinatorDropdown/GET_DATA" })
                }
                onChange={(e) => {
                  const data = JSON.parse(e);

                  setBody({ ...body, coordinator_name: data.coordinator_name });
                  setParams({
                    ...params,
                    coordinator_id: data.coordinator_id,
                    page: 1,
                  });
                }}
              >
                {!loadingCoordinator ? (
                  <Skeleton />
                ) : (
                  selectCoordinator.map((select, index) => (
                    <Select.Option key={index} value={JSON.stringify(select)}>
                      {select.coordinator_name}
                    </Select.Option>
                  ))
                )}
              </Select>
            </div>
            {/* coordinator name */}

            {/* table coordinator */}
            <div className="field-box">
              <div
                className="filter-search"
                style={{
                  marginTop: "30px",
                }}
              >
                <Input
                  className="input-search"
                  placeholder="Search"
                  prefix={<SearchOutlined />}
                  onChange={(e) =>
                    setParams((state) => ({
                      ...state,
                      page: 1,
                      keyword: e.target.value,
                    }))
                  }
                />
              </div>
              <Table
                loading={loadingBucket}
                columns={!preview ? columns : columnsSelect}
                pagination={false}
                dataSource={
                  !body.coordinator_name
                    ? empty
                    : preview
                    ? selectedData
                    : dataBucket
                }
              />

              <div className="pagination">
                <Pagination
                  current={bucketList?.data.meta?.page}
                  total={
                    !preview
                      ? bucketList?.data.meta?.pages * (params.limit || 0)
                      : 1
                  }
                  pageSize={params.limit}
                  onChange={(page) => [
                    setParams((state) => ({
                      ...state,
                      page: page,
                    })),
                  ]}
                />
              </div>
            </div>
            {/* table coordinator */}
          </div>
        </div>
        <div
          className="action"
          style={{
            display: "flex",
            gap: "10px",
            margin: "10px 0",
            justifyContent: "flex-end",
          }}
        >
          <Button
            style={{
              border: "1px solid #18A0FB",
              borderRadius: "8px",
              color: "#18A0FB",
            }}
            onClick={() =>
              !preview
                ? [
                    setPreview(false),
                    setSelectedData([]),
                    setIsModalOpen(!isModalOpen),
                    setBody({}),
                    setParams((state) => ({
                      ...state,
                      page: 1,
                    })),
                  ]
                : [setPreview(false)]
            }
          >
            Cancel
          </Button>
          {!preview ? (
            <Button
              style={{
                borderRadius: "8px",
                background: "#18A0FB",
                color: "#fff",
              }}
              disabled={!selectedData.length}
              onClick={() => setPreview(!preview)}
            >
              Submit
            </Button>
          ) : (
            <Button
              style={{
                borderRadius: "8px",
                background: "#18A0FB",
                color: "#fff",
              }}
              loading={submitLoading}
              onClick={() => {
                setSubmitLoading(true);
                dispatch({
                  type: "goodsInformationEntry/POST_DATA",
                  param: {
                    ...body,
                    selectedData,
                    onFinishSaga,
                    listParamsGood,
                  },
                });
              }}
            >
              Confirm
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateGoodsEntryForm;
