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
import styles from "@/app/goods-info-entry/form/styles.module.scss";
import { ColumnsType } from "antd/es/table";
import { convertDateTimeDBtoIndo } from "@/util/commons";

interface RejectBucketFormProps {
  body: any;
  setBody: (val: any) => void;
  onClose: () => void;
  isModalOpen: boolean;
  setDisabled: (val: boolean) => void;
}

const ModalRejectBucketForm: React.FC<RejectBucketFormProps> = (
  props: RejectBucketFormProps
) => {
  const { body, setBody, onClose, isModalOpen, setDisabled } = props;

  const dispatch = useDispatch();
  const { CoordinatorDropdown, loadingCoordinator, loadingBucket, bucketList } =
    useSelector(({ goodsInformation }) => goodsInformation);

  const [preview, setPreview] = useState(false);

  const [selectedData, setSelectedData] = useState<any[]>([]);

  if (selectedData.length) {
    setDisabled(false);
  } else {
    setDisabled(true);
  }

  // param for table bucket list
  const [params, setParams] = useState({
    limit: 5,
    page: 1,
    keyword: "",
    coordinator_id: null,
  });

  useEffect(() => {
    if (params.coordinator_id) {
      dispatch({
        type: "bucketList/GET_DATA",
        param: params,
      });
    }
  }, [dispatch, params]);

  let selectCoordinator: any[] = [];
  let dataBucket: any[] = [];

  CoordinatorDropdown?.data.map((item: any, key: number) =>
    selectCoordinator.push({
      ...item,
      key: (params.page - 1) * (params.limit || 0) + key + 1,
    })
  );

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
      render: (__, _, index) => (
        <span>
          {preview
            ? index + 1
            : (params.page - 1) * (params.limit || 0) + index + 1}
        </span>
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

  bucketList?.data?.bucket_list.map((item: any, idx: number) =>
    dataBucket.push({
      ...item,
      key: item.barcode_id,
      number: idx + 1,
    })
  );

  return (
    <Modal
      footer={null}
      className="modalEdit"
      width={1300}
      title=""
      open={isModalOpen}
      onCancel={onClose}
    >
      <div>
        <h4>Reject Bucket</h4>
        <p>Bucket would be rejected</p>
        <div className={styles.formInput}>
          <div className="row">
            {/* coordinator name */}
            <div
              className={styles.fieldBox}
              style={{
                width: "40%",
              }}
            >
              <label htmlFor="variable">Coordinator Name</label>
              <Select
                placeholder={"Please select Coordinator Name"}
                defaultValue={
                  body?.coordinator_name || "Please select Coordinator Name"
                }
                value={
                  body?.coordinator_name || "Please select Coordinator Name"
                }
                disabled={preview}
                loading={!loadingCoordinator}
                onClick={() =>
                  dispatch({ type: "coordinatorDropdown/GET_DATA" })
                }
                onChange={(e) => {
                  // if (params.coordinator_id) {
                  setBody({ ...body, coordinator_name: e });
                  setParams({
                    ...params,
                    coordinator_id: e,
                    page: 1,
                  });
                }}
              >
                {!loadingCoordinator ? (
                  <Skeleton />
                ) : (
                  selectCoordinator.map((select, index) => (
                    <Select.Option key={index} value={select.coordinator_id}>
                      {select.coordinator_name}
                    </Select.Option>
                  ))
                )}
              </Select>
            </div>
            {/* coordinator name */}

            {/* table coordinator */}
            <div className={styles.fieldBox}>
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
                      keyword: e.target.value,
                    }))
                  }
                />
              </div>
              <Table
                loading={loadingBucket}
                columns={columns}
                pagination={false}
                dataSource={
                  !body.coordinator_name
                    ? []
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
          className={styles.action}
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
            onClick={() => {
              onClose();
              setBody({});
            }}
          >
            Cancel
          </Button>
          {!preview ? (
            <Button
              style={{
                borderRadius: "8px",
                background: "#c34331",
                color: "#fff",
              }}
              disabled={!selectedData.length}
              onClick={() => setPreview(!preview)}
            >
              Next
            </Button>
          ) : (
            <Button
              style={{
                borderRadius: "8px",
                background: "#c34331",
                color: "#fff",
              }}
              onClick={() =>
                dispatch({
                  type: "goodsInformationEntry/REJECT_BUCKETS",
                  param: {
                    body,
                    selectedData,
                    onClose,
                    setPreview,
                    setBody,
                    setSelectedData,
                  },
                })
              }
            >
              Reject
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalRejectBucketForm;
