import React, { ChangeEventHandler } from "react";
import { Input } from "antd";
import { ReactInputType } from "@/types/reactForm";
import styles from "./styles.module.scss";
import { min } from "moment";

interface InputComponentsProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value?: string | number;
  type?: ReactInputType;
  prefix?: React.ReactNode;
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
  min?: number;
  max?: number;
  isPassword?: boolean;
  error?: { message: string };
  style?: React.CSSProperties;
}

const InputComponents: React.FC<InputComponentsProps> = (
  props: InputComponentsProps
) => {
  const {
    onChange,
    value,
    type,
    prefix,
    label,
    placeholder,
    allowClear,
    disabled,
    className,
    maxLength,
    min,
    max,
    isPassword,
    error,
    style,
  } = props;

  const renderInput = () => {
    if (isPassword) {
      return (
        <Input.Password
          style={style}
          onChange={onChange}
          value={value}
          type={type}
          prefix={prefix}
          className={className || `input-search`}
          placeholder={placeholder}
          allowClear={allowClear}
          disabled={disabled}
          data-testid="input-component"
          maxLength={maxLength}
          min={min}
          max={max}
        />
      );
    }

    return (
      <Input
        style={style}
        onChange={onChange}
        value={value}
        type={type}
        prefix={prefix}
        className={className || `input-search`}
        placeholder={placeholder}
        allowClear={allowClear}
        disabled={disabled}
        data-testid="input-component"
        maxLength={maxLength}
        min={min}
        max={max}
      />
    );
  };

  return (
    <div className={styles.container}>
      {label && <label htmlFor="label">{label}</label>}
      {renderInput()}
      {error && <div className="err-message">{error.message}</div>}
    </div>
  );
};

export default InputComponents;
