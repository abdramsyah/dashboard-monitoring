import React, { useState } from "react";
import { formatCurrency } from "@/util/commons";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import SelectComponent from "@/components/Select";
import { BucketData } from "@/types/purchase";
import { GradeModel } from "@/types/grades";
import InputComponents from "@/components/Input";
import {
  ClientBarcodeGroupModel,
  ClientBarcodeModel,
} from "@/types/barcodeSystem";
import { MUTATION_KEY } from "@/api/queries/key";
import { updateStockGradeInformation } from "@/api/queries/fetch";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import nProgress from "nprogress";
import { ErrorResponseType, SuccessResponseType } from "@/types/global";
import MessageError from "@/components/Notification/MessageError";
import { GradingQueueData, GradingQueueResModel } from "@/types/grading";

interface EditGradeModalProps {
  isOpen: boolean;
  bucket?: BucketData;
  gradeList: GradeModel[];
  grader: string;
  clientBarcodeGroupList: ClientBarcodeGroupModel[];
  onClose: () => void;
  stockListRefetch: () => void;
}

const EditGradeModal: React.FC<EditGradeModalProps> = (
  props: EditGradeModalProps
) => {
  const {
    isOpen,
    bucket,
    gradeList,
    grader,
    clientBarcodeGroupList,
    onClose,
    stockListRefetch,
  } = props;

  const [selectedGrade, setSelectedGrade] = useState<GradeModel>();
  const [salesCode, setSalesCode] = useState("");
  const [salesCodeErrMessage, setSalesCodeErrMessage] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");

  const onSuccess = (
    data: SuccessResponseType<GradingQueueResModel[], GradingQueueData[]>
  ) => {
    if (data.data.data[0].status === "USED") {
      const msg = `Barcode penjualan ${data.data.data[0].sales_code} sudah digunakan`;
      toast.error(<MessageError msg={msg} />, {
        className: "toast-message-error",
      });
      setSalesCodeErrMessage(msg);
      return;
    }

    toast.success(<MessageSuccess msg={"Berhasil memperbaharui grade"} />, {
      className: "toast-message-success",
    });
    stockListRefetch();
    onClose();
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

  const { mutate, isPending } = useMutation({
    mutationKey: [MUTATION_KEY.UPDATE_GRADE_INFORMATION],
    mutationFn: updateStockGradeInformation,
    onSuccess,
    onError,
  });

  const renderSalesCodeField = () => {
    if (!selectedGrade) return;
    if (selectedGrade.client_code === bucket?.client_code) return;
    if (selectedGrade.client_code === "DJRM") {
      return (
        <InputComponents
          label="Barcode Penjualan"
          value={salesCode}
          onChange={(e) => setSalesCode(e.target.value)}
          error={{ message: salesCodeErrMessage }}
        />
      );
    }

    const clientBarcodeGroupData = clientBarcodeGroupList.find(
      (e) => e.client_id === selectedGrade.client_id
    );

    if (!clientBarcodeGroupData?.code_data) return;

    return (
      <SelectComponent
        showSearch
        data={clientBarcodeGroupData.code_data[0].codes || []}
        placeholder="Pilih barcode penjualan"
        onChange={(item) => {
          const codeParse: ClientBarcodeModel = JSON.parse(item);
          setSalesCode(codeParse.code);
        }}
        customLabel={{
          renderLabel: (item) =>
            `${item.code} - ${clientBarcodeGroupData.user_name}`,
        }}
      />
    );
  };

  const confirmButtonDisabled = () => {
    const conditionList: boolean[] = [];
    if (selectedGrade) conditionList.push(true);
    if (!bucket?.purchase_id) {
      const unitPriceInt = parseInt(unitPrice);
      conditionList.push(!!unitPrice && !(unitPriceInt < 1000));
    }
    if (selectedGrade?.client_code !== bucket?.client_code)
      conditionList.push(!!salesCode);

    return conditionList.every((e) => e);
  };

  return (
    <ConfirmationModal
      open={isOpen}
      title="Edit Grade"
      disabled={!confirmButtonDisabled()}
      onConfirm={() => {
        const data: GradingQueueData = {
          index: 0,
          serial_number: bucket?.serial_number,
          grade_data: selectedGrade,
          unit_price: unitPrice,
          grader_name: grader,
          sales_code:
            selectedGrade?.client_code === bucket?.client_code
              ? bucket?.sales_code
              : salesCode,
          status: "UPDATED",
          message: "",
        };
        mutate([data]);
      }}
      onClose={onClose}
      loading={isPending}
    >
      <div className="flex-col">
        <div
          className="flex-col"
          style={{
            textAlign: "start",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          <div className="flex-row">
            <div
              style={{
                width: "40%",
              }}
            >
              Nomor Seri
            </div>
            <div>{` : ${bucket?.serial_number}`}</div>
          </div>
          <div className="flex-row">
            <div
              style={{
                width: "40%",
              }}
            >
              Grade
            </div>
            <div>{` : ${bucket?.grade} - ${
              bucket?.client_code
            } - ${formatCurrency(bucket?.grade_price)}`}</div>
          </div>
        </div>
        <SelectComponent
          showSearch
          data={gradeList}
          placeholder="Pilih grade baru"
          onChange={(item) => {
            const gradeParse: GradeModel = JSON.parse(item);
            setSelectedGrade(gradeParse);
            setUnitPrice(`${gradeParse.price}`);
          }}
          customLabel={{
            renderLabel: (item) =>
              `${item.grade} - ${item.client_code} - ${formatCurrency(
                item.price
              )}`,
          }}
        />
        {!bucket?.purchase_id && (
          <InputComponents
            label="Unit Price"
            type={"number"}
            value={unitPrice}
            min={1000}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        )}
        {renderSalesCodeField()}
      </div>
    </ConfirmationModal>
  );
};

export default EditGradeModal;
