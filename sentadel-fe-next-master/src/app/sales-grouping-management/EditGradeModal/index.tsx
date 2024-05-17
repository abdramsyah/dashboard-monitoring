import React, { useState } from "react";
import { formatCurrency } from "@/util/commons";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import SelectComponent from "@/components/Select";
import { GradeModel } from "@/types/grades";
import { GroupingAndGoodsModel } from "@/types/grouping";

interface EditGradeModalProps {
  isOpen: boolean;
  item: GroupingAndGoodsModel;
  alreadyChanged?: boolean;
  gradeList: GradeModel[];
  onClose: () => void;
  onConfirm: (data: {
    item: GroupingAndGoodsModel;
    newGrade: GradeModel;
  }) => void;
  onCancel?: (item: GroupingAndGoodsModel) => void;
}

const EditGradeModal: React.FC<EditGradeModalProps> = (
  props: EditGradeModalProps
) => {
  const {
    isOpen,
    gradeList,
    item,
    alreadyChanged,
    onClose,
    onConfirm,
    onCancel,
  } = props;

  const [selectedGrade, setSelectedGrade] = useState<GradeModel>();

  return (
    <ConfirmationModal
      open={isOpen}
      title="Edit Grade"
      disabled={!selectedGrade}
      onConfirm={() => {
        if (selectedGrade) onConfirm({ item, newGrade: selectedGrade });
        onClose();
      }}
      onClose={onClose}
      cancel={alreadyChanged ? "Hapus" : "Kembali"}
      confirm="Komfirmasi"
      onCancel={() => {
        if (alreadyChanged && onCancel) {
          onCancel(item);
        } else {
          onClose();
        }
      }}
    >
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
          <div>{` : ${item?.serial_number}`}</div>
        </div>
        <div className="flex-row">
          <div
            style={{
              width: "40%",
            }}
          >
            Grade
          </div>
          <div>{` : ${item?.grade} - ${formatCurrency(
            item?.grade_price
          )}`}</div>
        </div>
      </div>
      <SelectComponent
        showSearch
        data={gradeList}
        placeholder="Pilih grade baru"
        onChange={(item) => {
          const gradeParse: GradeModel = JSON.parse(item);
          setSelectedGrade(gradeParse);
        }}
        customLabel={{
          renderLabel: (item) =>
            `${item.grade} - ${formatCurrency(item.price)}`,
        }}
      />
    </ConfirmationModal>
  );
};

export default EditGradeModal;
