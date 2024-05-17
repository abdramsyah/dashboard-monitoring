import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./styles.module.scss";
import { Checkbox, Modal } from "antd";
import {
  getAllGrade,
  getGroupingDetail,
  updateGroupingList,
} from "@/api/queries/fetch";
import { QUERY_KEY } from "@/api/queries/key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/util/commons";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import { GroupingAndGoodsModel, GroupingDetailPayload } from "@/types/grouping";
import Barcode from "react-barcode";
import MessageError from "@/components/Notification/MessageError";
import { toast } from "react-toastify";
import nProgress from "nprogress";
import { ErrorResponseType } from "@/types/global";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import { GradeModel } from "@/types/grades";
import EditSvg from "@/assets/svg/icon/edit-svg";
import EditGradeModal from "../EditGradeModal";

type RenderItemProps = {
  item: GroupingAndGoodsModel;
  idx: number;
  isGoods?: boolean;
  isEditMode?: boolean;
  selected: boolean;
  onSelect?: (item: GroupingAndGoodsModel) => void;
  rejected?: boolean;
  onReject?: (item: GroupingAndGoodsModel) => void;
  newGrade?: GradeModel;
  onEditGradeClicked?: (
    item: GroupingAndGoodsModel,
    alreadyChanged: boolean
  ) => void;
};

const RenderItem = (props: RenderItemProps) => {
  const {
    item,
    idx,
    onSelect,
    isGoods,
    isEditMode,
    selected,
    rejected,
    onReject,
    newGrade,
    onEditGradeClicked,
  } = props;

  const rowTheme = () => {
    if (item.type === "GOODS" && (!isGoods || selected))
      return styles.selectedGoods;
    if (selected && item.type === "GROUP") return styles.selectedGrouping;
    if (rejected) return styles.selectedGrouping;
    if (!!newGrade) return styles.gradeChanged;
  };

  const renderChageGrade = () => {
    if (isEditMode) {
      return (
        <div
          style={
            !newGrade
              ? {
                  height: 22,
                  width: 24,
                  borderWidth: 0,
                  background: "transparent",
                }
              : {
                  borderWidth: 0,
                  background: "transparent",
                  fontSize: 12,
                }
          }
          onClick={() => {
            if (onEditGradeClicked) onEditGradeClicked(item, !!newGrade);
          }}
        >
          {!newGrade ? (
            <EditSvg height={14} strokeWidth={3} stroke="#2196F3" />
          ) : (
            " -> " + newGrade.grade
          )}
        </div>
      );
    }
  };

  return (
    <tr
      key={idx.toString()}
      className={`${idx % 2 !== 0 ? styles.evenRow : ""} ${rowTheme()}`}
    >
      <td>
        <div className={styles.tdNo}>
          {isEditMode && (
            <Checkbox
              checked={selected}
              value={item}
              onChange={(ev) => {
                if (onSelect)
                  onSelect(ev.target.value as GroupingAndGoodsModel);
              }}
              disabled={rejected || !!newGrade}
            />
          )}
          <span>{idx + 1}</span>
        </div>
      </td>
      <td>{item.serial_number}</td>
      <td>{item.farmer_name}</td>
      <td>{item.product_type}</td>
      <td>{item.sales_code}</td>
      <td>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {item.grade}
          {renderChageGrade()}
        </div>
      </td>
      {!isGoods && (
        <td>
          {item.grade
            ? `${formatCurrency(item.unit_price, true)} / ${formatCurrency(
                item.grade_price,
                true
              )}`
            : ""}
        </td>
      )}
      <td>{item.gross_weight ? (item.gross_weight / 1000).toFixed(2) : ""}</td>
      <td>
        {item.client_weight ? (item.client_weight / 1000).toFixed(2) : ""}
      </td>
      {isEditMode && !isGoods && (
        <td>
          {item.type === "GROUP" && (
            <ReactButton
              title={rejected ? "Ditolak" : "Tolak"}
              type="button"
              theme={rejected ? "outlined-red" : "solid-red"}
              onClick={() => {
                if (onReject) onReject(item);
              }}
              disabled={selected || !!newGrade}
            />
          )}
        </td>
      )}
    </tr>
  );
};

const MemoizeItem = memo(RenderItem);

interface GroupingDetailModalProps {
  isOpen: boolean;
  groupingId: number;
  onClose: () => void;
  refetchMainPage: () => void;
}

type GradeModalCtrlType =
  | { open: false }
  | {
      open: true;
      item: GroupingAndGoodsModel;
      alreadyChanged: boolean;
    };

const GroupingDetailModal: React.FC<GroupingDetailModalProps> = (
  props: GroupingDetailModalProps
) => {
  const { isOpen, groupingId, onClose, refetchMainPage } = props;

  const [payload, setPayload] = useState<GroupingDetailPayload>({
    // limit: 100,
    page: 1,
    keyword: "",
    is_edit: false,
  });
  const [selectedGoods, setSelectedGoods] = useState<GroupingAndGoodsModel[]>(
    []
  );
  const [selectedGrouping, setSelectedGrouping] = useState<
    GroupingAndGoodsModel[]
  >([]);
  const [rejectedGrouping, setRejectedGrouping] = useState<
    GroupingAndGoodsModel[]
  >([]);
  const [changedGrade, setChangedGrade] = useState<
    { item: GroupingAndGoodsModel; new_grade: GradeModel }[]
  >([]);
  const [isShowCheckedGoods, setShowCheckedGoods] = useState(false);
  const [gradeModalCtrl, setGradeModalCtrl] = useState<GradeModalCtrlType>({
    open: false,
  });

  const {
    data: gradeData,
    refetch: gradeRefetch,
    isFetched: gradeIsFetched,
  } = useQuery({
    queryFn: () => getAllGrade({ client_id: data?.data.data.client_id }),
    queryKey: [QUERY_KEY.GET_ALL_GRADE],
    // refetchInterval: false,
  });

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getGroupingDetail(groupingId, payload),
    queryKey: [QUERY_KEY.GET_GROUPING_DETAIL],
    refetchInterval: false,
  });

  const currentGroupingList = useMemo(() => {
    if (!payload.is_edit) return data?.data.data.grouping_data_json;

    return [...(data?.data.data.grouping_data_json || []), ...selectedGoods];
  }, [data?.data.data.grouping_data_json, selectedGoods, payload.is_edit]);

  const onSuccess = () => {
    toast.success(<MessageSuccess msg={"Validasi sukses"} />, {
      className: "toast-message-success",
    });
    refetch();
    refetchMainPage();
    setSelectedGoods([]);
    setSelectedGrouping([]);
    setRejectedGrouping([]);
    setChangedGrade([]);
    nProgress.done();
  };

  const onError = (
    err: ErrorResponseType<{ data?: unknown; message?: string }>
  ) => {
    toast.error(
      <MessageError msg={`Terjadi kesalahan, ${err.response?.data || err}`} />,
      { className: "toast-message-error" }
    );
    nProgress.done();
  };

  const { mutate } = useMutation({
    mutationFn: () =>
      updateGroupingList({
        grouping_id: data?.data.data.grouping_id || 0,
        data_to_remove: selectedGrouping.map((e) => e.grouping_list_id),
        new_data: selectedGoods,
        changed_grade: changedGrade,
        reject_data: rejectedGrouping,
      }),
    mutationKey: [QUERY_KEY.GET_PURCHASE_DELIVERY_DETAIL],
    onSuccess,
    onError,
  });

  const onCheckGrouping = useCallback((item: GroupingAndGoodsModel) => {
    setSelectedGrouping((state) => {
      const findItem = state.find((it) => it.goods_id === item.goods_id);

      if (findItem)
        return state.filter((it) => it.goods_id !== findItem.goods_id);

      return [...state, item];
    });
  }, []);

  const onRejectGrouping = useCallback((item: GroupingAndGoodsModel) => {
    setRejectedGrouping((state) => {
      const findItem = state.find((it) => it.goods_id === item.goods_id);

      if (findItem)
        return state.filter((it) => it.goods_id !== findItem.goods_id);

      return [...state, item];
    });
  }, []);

  const onEditGradeClicked = useCallback(
    (item: GroupingAndGoodsModel, alreadyChanged: boolean) =>
      setGradeModalCtrl({ open: true, item, alreadyChanged }),
    []
  );

  const onChangeGrade = useCallback(
    (cData: { item: GroupingAndGoodsModel; newGrade: GradeModel }) => {
      const { item, newGrade } = cData;

      setChangedGrade((state) => {
        let newState = [...state];
        const findItem = state.find((it) => it.item.goods_id === item.goods_id);

        if (findItem)
          newState = newState.filter(
            (it) => it.item.goods_id !== findItem.item.goods_id
          );

        return [...newState, { item, new_grade: newGrade }];
      });
    },
    []
  );

  const onCancelChangeGrade = useCallback((item: GroupingAndGoodsModel) => {
    setChangedGrade((state) => {
      const findItem = state.find((it) => it.item.goods_id === item.goods_id);

      if (findItem)
        return state.filter(
          (it) => it.item.goods_id !== findItem.item.goods_id
        );

      return [...state];
    });

    setGradeModalCtrl({ open: false });
  }, []);

  const onCheckGoods = useCallback((item: GroupingAndGoodsModel) => {
    setSelectedGoods((state) => {
      const findItem = state.find((it) => it.goods_id === item.goods_id);

      if (findItem)
        return state.filter((it) => it.goods_id !== findItem.goods_id);

      return [...state, item];
    });
  }, []);

  useEffect(() => {
    refetch();
  }, [payload, refetch]);

  useEffect(() => {
    if (data?.data.data.client_id && gradeIsFetched) gradeRefetch();
  }, [data?.data.data.client_id, gradeIsFetched, gradeRefetch]);

  const headerValueList = [
    {
      title: "Client",
      value: data?.data.data.client_name,
    },
    {
      title: "Jumlah Keranjang",
      value: data?.data.data.grouping_data_json?.length,
    },
    {
      title: "Grade",
      value: data?.data.data.grade_initial,
    },
    data?.data.data.client_code === "DJRM" && {
      title: "UB",
      value: data?.data.data.ub,
    },
  ];

  const renderModal = () => {
    return (
      <>
        {gradeModalCtrl.open && (
          <EditGradeModal
            isOpen={gradeModalCtrl.open}
            item={gradeModalCtrl.item}
            onClose={() => {
              setGradeModalCtrl({ open: false });
            }}
            gradeList={gradeData?.data.data || []}
            onConfirm={onChangeGrade}
            onCancel={onCancelChangeGrade}
            alreadyChanged={gradeModalCtrl.alreadyChanged}
          />
        )}
      </>
    );
  };

  const renderBody = () => {
    return (
      <div className={styles.deliveryContainer}>
        <div className={styles.kopTitle}>Detail Gulungan</div>
        <div className={styles.header}>
          <div className={styles.params}>
            {headerValueList.map((e, idx) => {
              if (!e) return;

              return (
                <div key={idx.toString()} className={styles.rowParam}>
                  <div className={styles.title}>{e.title}</div>
                  <div>: {isFetching ? "-" : e.value}</div>
                </div>
              );
            })}
          </div>
          <div>
            <Barcode
              value={data?.data.data.grouping_number || "-"}
              format="CODE128"
              displayValue
              width={1.2}
              height={30}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              rowGap: "10px",
              flexWrap: "wrap",
              padding: "10px",
              paddingLeft: "100px",
            }}
          >
            <ReactButton
              theme="outlined-red"
              title={payload.is_edit ? "Kembali" : `Update`}
              type="button"
              onClick={() => {
                setSelectedGoods([]);
                setSelectedGrouping([]);
                setRejectedGrouping([]);
                setChangedGrade([]);
                setPayload((state) => ({ ...state, is_edit: !state.is_edit }));
              }}
            />
            {payload.is_edit && (
              <ReactButton title={`Submit`} type="button" onClick={mutate} />
            )}
          </div>
        </div>
        <div className={styles.tableContainer}>
          <div className={styles.groupingTableWrapper}>
            <table className={styles.tableQueue}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.thNo}>No</th>
                  <th className={styles.thSeri}>Seri</th>
                  <th className={styles.thFarmer}>Petani</th>
                  <th className={styles.thProductType}>Jenis</th>
                  <th className={styles.thGrade}>Barcode Penjualan</th>
                  <th className={styles.thGrade}>Grade</th>
                  <th className={styles.thPrice}>Harga (Unit / Grade)</th>
                  <th className={styles.thBK}>BK</th>
                  <th className={styles.thBK}>BB</th>
                  {payload.is_edit && <th className={styles.thBK}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {currentGroupingList?.map((e, idx) => {
                  const isSelected = (
                    e.type === "GOODS" ? selectedGoods : selectedGrouping
                  )?.findIndex((e1) => e1.serial_number === e.serial_number);
                  const isRejected =
                    e.type === "GROUP"
                      ? rejectedGrouping.findIndex(
                          (e1) => e1.serial_number === e.serial_number
                        ) > -1
                      : undefined;
                  const newGrade =
                    e.type === "GROUP"
                      ? changedGrade.find(
                          (e1) => e1.item.serial_number === e.serial_number
                        )?.new_grade
                      : undefined;

                  return (
                    <MemoizeItem
                      key={e.goods_id}
                      selected={isSelected > -1}
                      item={e}
                      idx={idx}
                      isEditMode={payload.is_edit}
                      onSelect={
                        e.type === "GOODS" ? onCheckGoods : onCheckGrouping
                      }
                      rejected={isRejected}
                      onReject={onRejectGrouping}
                      newGrade={newGrade}
                      onEditGradeClicked={onEditGradeClicked}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          {payload.is_edit && (
            <>
              <div className={styles.goodsTableWrapper}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  <Checkbox
                    checked={isShowCheckedGoods}
                    disabled={!selectedGoods.length}
                    onChange={() => {
                      setShowCheckedGoods((state) => !state);
                    }}
                  />
                  <span>Hanya tampilkan terpilih</span>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.tableQueue}>
                    <thead className={styles.thead}>
                      <tr>
                        <th className={styles.thNo}>No</th>
                        <th className={styles.thSeri}>Seri</th>
                        <th className={styles.thFarmer}>Petani</th>
                        <th className={styles.thProductType}>Jenis</th>
                        <th className={styles.thGrade}>Barcode Penjualan</th>
                        <th className={styles.thGrade}>Grade</th>
                        <th className={styles.thBK}>BK</th>
                        <th className={styles.thBK}>BB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!isShowCheckedGoods
                        ? data?.data.data.goods_data_json
                        : selectedGoods
                      )?.map((e, idx) => {
                        const findIndex = selectedGoods?.findIndex(
                          (e1) => e1.serial_number === e.serial_number
                        );

                        return (
                          <MemoizeItem
                            key={e.goods_id}
                            selected={findIndex > -1}
                            item={e}
                            idx={idx}
                            onSelect={onCheckGoods}
                            isGoods
                            isEditMode={payload.is_edit || false}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      className={`modal-full`}
      maskClosable
      open={isOpen}
      footer={null}
      onCancel={onClose}
    >
      <div className={`${styles.modalView}`}>{renderBody()}</div>
      {renderModal()}
    </Modal>
  );
};

export default GroupingDetailModal;
