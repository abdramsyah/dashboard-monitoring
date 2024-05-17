import { ChipSelectorOption } from "@/components/ChipSelector";
import { ReactInputProps } from "@/components/ReactHookForm/ReactInput";
import { ReactSelectProps } from "@/components/ReactHookForm/ReactSelect";
import {
  FieldValues,
  LiteralUnion,
  RegisterOptions,
  UseFieldArrayReturn,
} from "react-hook-form";

export type ReactHookRulesType =
  | Omit<
      RegisterOptions<FieldValues, string>,
      "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
    >
  | undefined;

export type ReactFormType<Tenum = any, Tlist = any> = {
  formType: FormType<Tlist>;
  hide?: boolean;
  name: Tenum;
  rules?: ReactHookRulesType;
};

export type FormType<Tlist> =
  | {
      type: "notShown";
    }
  | {
      type: "input";
      inputType?: ReactInputProps["type"];
      reactInputType?: ReactInputType;
      label: string;
      placeholder?: string;
      disabled?: boolean;
      className?: string;
    }
  | {
      type: "select";
      label: string;
      selectData: Tlist;
      customLabel?: {
        separator?: string;
        keyList: string[];
      };
      returnedKey?: string;
      customStyle?: ReactSelectProps["customStyle"];
    }
  | {
      type: "chipSelector";
      title: string;
      options: ChipSelectorOption[];
      isMultiple: boolean;
      returnedKey?: "value" | "label" | "selected";
    }
  | {
      type: "fieldArray";
      title?: string;
      form: ReactFormType[];
      fieldArray: UseFieldArrayReturn<any, any, "id">;
      min?: number; //default 1
      max?: number; // default 5
      shouldFocus?: boolean; // default true
      useIndex?: boolean;
    }
  | {
      type: "dynamic";
      form1: FormType<Tlist>;
      form2: FormType<Tlist>;
      listenTo: string;
      condition?: string;
    }
  | {
      type: "autoHide";
      form: FormType<Tlist>;
      listenTo: string;
      targetType?: FormType<Tlist>["type"];
      targetKey?: string | keyof ChipSelectorOption;
      condition?: string;
    };

export type ReactInputType = LiteralUnion<
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week",
  string
>;
