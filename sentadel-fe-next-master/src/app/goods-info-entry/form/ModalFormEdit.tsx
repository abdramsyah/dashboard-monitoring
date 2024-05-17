import React, { useEffect } from "react";
import { Select, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import styles from "@/app/goods-info-entry/form/styles.module.scss";
import ButtonComponent from "@/components/Button/CustomButton";

interface EditGoodsFormProps {
  body: any;
  setBody: (val: any) => void;
  setDisabled: (val: boolean) => void;
}

const EditGoodsForm: React.FC<EditGoodsFormProps> = (
  props: EditGoodsFormProps
) => {
  const { body, setBody, setDisabled } = props;

  const dispatch = useDispatch();
  const {
    CoordinatorDropdown,
    clientDropdown,
    loadingClient,
    profitDropdown,
    loadingProfit,
  } = useSelector(({ goodsInformation }) => goodsInformation);

  const { gradeData, loading } = useSelector(
    ({ gradeDictionary }) => gradeDictionary
  );

  useEffect(() => {
    setDisabled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let selectCoordinator: any[] = [];
  let selectClients: any[] = [];
  let selectProfit: any[] = [];
  let selectGrade: any[] = [];

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

  profitDropdown?.data.profit_taking_dictionaries.map(
    (item: any, key: number) =>
      selectProfit.push({
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

  return (
    <div>
      <div className={styles.formInput}>
        <div className="row">
          <div className={styles.fieldBox}>
            <label htmlFor="variable">Coordinator Name</label>
            <Input
              placeholder="coordinator name"
              className={styles.form}
              id="variable"
              disabled
              value={body?.coordinator_name}
            />
          </div>
          <div className={styles.fieldBox}>
            <label htmlFor="client_name">Client Name</label>
            <div className="editable-row">
              <Select
                showSearch
                placeholder={"Please select Client Name"}
                defaultValue={body?.client_name}
                value={body?.data_client?.client_name || body?.client_name}
                loading={!loadingClient}
                onClick={() => dispatch({ type: "clientDropdown/GET_DATA" })}
                onChange={(e) => {
                  const data_client = JSON.parse(e);

                  setBody({ ...body, data_client: data_client });
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
              <CloseCircleFilled
                className={styles.alertIcon}
                onClick={() => {
                  setBody((state: any) => ({
                    ...state,
                    dataGrade: null,
                  }));
                }}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className={styles.fieldBox}>
            <label htmlFor="grade">Company Grade</label>
            <div className="editable-row ">
              <Select
                showSearch
                placeholder={"Please select Company Grade"}
                defaultValue={body?.grade}
                value={body?.dataGrade?.grade || body?.grade}
                loading={!loading}
                onChange={(e) => {
                  const dataGrade = JSON.parse(e);

                  setBody({ ...body, dataGrade });
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
              <CloseCircleFilled
                className={styles.alertIcon}
                onClick={() => {
                  setBody((state: any) => ({
                    ...state,
                    dataGrade: null,
                  }));
                }}
              />
            </div>
          </div>

          <div className={styles.fieldBox}>
            <label htmlFor="client_grade">Client Grade</label>
            <Input
              placeholder="client_grade"
              className={styles.form}
              id="client_grade"
              disabled
              value={body?.dataGrade?.grade || body?.grade}
            />
          </div>
        </div>
        <div className="row">
          <div className={styles.fieldBox}>
            <label htmlFor="profit_taking">Information (Profit Taking)</label>
            <div className="editable-row">
              <Select
                showSearch
                placeholder={"Please select Profit "}
                defaultValue={
                  body?.dataProfit?.variable || body?.profit_taking_variable
                }
                value={
                  body?.dataProfit?.variable || body?.profit_taking_variable
                }
                loading={!loadingProfit}
                onClick={() => dispatch({ type: "profitDropdown/GET_DATA" })}
                onChange={(e) => {
                  const newData = JSON.parse(e);

                  setBody({ ...body, dataProfit: newData });
                }}
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
              <CloseCircleFilled
                className={styles.alertIcon}
                onClick={() => {
                  setBody((state: any) => ({
                    ...state,
                    dataProfit: null,
                  }));
                }}
              />
            </div>
          </div>
        </div>
        <ButtonComponent
          className={styles.submitButton}
          onClick={() => {
            const { dataClient, dataGrade, dataProfit } = body;
            if (dataClient || dataGrade || dataProfit) {
              setDisabled(false);
            }
          }}
        >
          Validasi
        </ButtonComponent>
      </div>
    </div>
  );
};

export default EditGoodsForm;
