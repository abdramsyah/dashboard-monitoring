import { ClientModel } from "@/types/clients";
import {
  GradeManagementModelRequstProps,
  GradeModelEnum,
  GradeRequestModelEnum,
} from "@/types/grades";
import { ReactFormType } from "@/types/reactForm";
import { UseFieldArrayReturn } from "react-hook-form";

export const gradeManagementFormEditList = (
  clientData: ClientModel[],
  gradesFields: UseFieldArrayReturn<
    GradeManagementModelRequstProps,
    GradeRequestModelEnum.GRADES,
    "id"
  >,
  fieldArrayStyle: {
    gradeInput: string;
    quotaInput: string;
    priceInput: string;
  }
) =>
  [
    {
      name: GradeRequestModelEnum.CLIENT_ID,
      formType: {
        type: "select",
        label: "Pilih Client",
        selectData: clientData,
        customLabel: {
          separator: " - ",
          keyList: ["client_name", "code"],
        },
        returnedKey: "id",
      },
    },
    {
      name: GradeRequestModelEnum.GRADES,
      formType: {
        type: "fieldArray",
        fieldArray: gradesFields,
        title: "Tambahkan grade",
        max: 40,
        shouldFocus: false,
        useIndex: true,
        form: [
          {
            name: GradeModelEnum.GRADE,
            formType: {
              type: "input",
              label: "Grade",
              className: fieldArrayStyle.gradeInput,
            },
            rules: { required: "Grade tidak boleh kosong" },
          },
          {
            name: GradeModelEnum.PRICE,
            formType: {
              type: "input",
              label: "Harga Grade per Kg",
              reactInputType: "number",
              className: fieldArrayStyle.priceInput,
            },
            rules: { required: "Harga tidak boleh kosong" },
          },
          {
            name: GradeModelEnum.QUOTA,
            formType: {
              type: "input",
              label: "Kuota",
              reactInputType: "number",
              className: fieldArrayStyle.quotaInput,
            },
            rules: { required: "Kuota tidak boleh kosong" },
          },
          {
            name: GradeModelEnum.UB,
            formType: {
              type: "chipSelector",
              isMultiple: false,
              title: "UB",
              options: [
                { value: 1, label: "1", selected: false },
                { value: 2, label: "2", selected: false },
                { value: 3, label: "3", selected: false },
              ],
              returnedKey: "value",
            },
          },
        ],
      },
    },
  ] as ReactFormType<GradeRequestModelEnum>[];
