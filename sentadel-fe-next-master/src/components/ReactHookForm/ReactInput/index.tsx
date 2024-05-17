import React from "react";
import {
  Controller,
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { Input } from "antd";
import { ReactHookRulesType, ReactInputType } from "@/types/reactForm";

export interface ReactInputProps {
  name: string;
  type?: "PASSWORD" | "TEXTAREA";
  rules?: ReactHookRulesType;
  value?: string | number;
  reactInputType?: ReactInputType;
  prefix?: string | number;
  label?: string;
  placeholder?: string;
  allowClear?:
    | boolean
    | {
        clearIcon?: React.ReactNode;
      };
  disabled?: boolean;
  className?: string;
  maxLength?: number;
}

const ReactInput = (props: ReactInputProps) => {
  const {
    name,
    type,
    rules,
    reactInputType,
    prefix,
    label,
    placeholder,
    allowClear,
    disabled,
    className,
    maxLength,
  } = props;

  const { control } = useFormContext();

  const renderInput = (field: ControllerRenderProps<FieldValues, string>) => {
    const reactOnChange = (event: any) => {
      if (reactInputType === "number") {
        return field.onChange(+event.target?.value);
      }
      return field.onChange(event);
    };

    if (type === "PASSWORD") {
      return (
        <Input.Password
          {...field}
          onChange={reactOnChange}
          type={reactInputType}
          prefix={prefix}
          className={className || `input-search`}
          placeholder={placeholder}
          allowClear={allowClear}
          disabled={disabled}
          data-testid="input-component"
          maxLength={maxLength}
        />
      );
    }

    if (type === "TEXTAREA") {
      return (
        <Input.TextArea
          {...field}
          onChange={reactOnChange}
          className={className || `input-search`}
          placeholder={placeholder}
          allowClear={allowClear}
          disabled={disabled}
          data-testid="input-component"
          maxLength={maxLength}
          rows={4}
        />
      );
    }

    return (
      <Input
        {...field}
        onChange={reactOnChange}
        type={reactInputType}
        prefix={prefix}
        className={className || `input-search`}
        placeholder={placeholder}
        allowClear={allowClear}
        disabled={disabled}
        data-testid="input-component"
        maxLength={maxLength}
      />
    );
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className="field-box">
            {label && <label htmlFor="label">{label}</label>}
            {renderInput(field)}
            {error && <div className="err-message">{error.message}</div>}
          </div>
        );
      }}
    />
  );
};

export default ReactInput;
