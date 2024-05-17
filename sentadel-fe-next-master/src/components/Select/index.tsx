import { Select, Skeleton } from "antd";
import { BaseOptionType, DefaultOptionType, SelectProps } from "antd/es/select";
import React, { CSSProperties } from "react";
import { BaseSelectRef } from "rc-select";
import styles from "./styles.module.scss";

export type SelectComponentCustomStyle = {
  className?: string;
  containerClassName?: string;
  style?: CSSProperties;
};

type AntdSelectType = SelectProps<any, BaseOptionType | DefaultOptionType>;

type CustomLabelType =
  | {
      separator?: string;
      keyList: string[];
    }
  | {
      renderLabel: (item: any) => React.ReactNode;
      keyList?: undefined;
    };

export interface SelectComponentProps extends AntdSelectType {
  data: any[];
  customLabel?: CustomLabelType;
  title?: string;
  customStyle?: SelectComponentCustomStyle;
  returnedKey?: string;
  errMessage?: string;
}

const SelectComponent = React.forwardRef(function (
  props: SelectComponentProps,
  ref: React.ForwardedRef<BaseSelectRef>
) {
  const {
    data,
    customLabel,
    title,
    customStyle,
    returnedKey,
    errMessage,
    loading,
  } = props;

  const renderSelect = () => {
    const renderLabel = (select: any) => {
      if (customLabel) {
        if (customLabel.keyList) {
          return customLabel.keyList
            .map((e) => select[e] || "*")
            .join(customLabel.separator || " - ");
        }

        return customLabel.renderLabel(select);
      }

      return select?.label || select || "";
    };

    const renderValue = (select: any) => {
      if (returnedKey) {
        return select[returnedKey];
      }

      return typeof select === "string" ? select : JSON.stringify(select);
    };

    return (
      <Select ref={ref} {...props} className={customStyle?.className}>
        {loading ? (
          <Skeleton />
        ) : (
          data.map((select, index) => (
            <Select.Option key={index} value={renderValue(select)}>
              {renderLabel(select)}
            </Select.Option>
          ))
        )}
      </Select>
    );
  };

  return (
    <div className={styles.container} style={customStyle?.style}>
      {title && <label htmlFor="label">{title}</label>}
      {renderSelect()}
      {errMessage && <div className="err-message">{errMessage}</div>}
    </div>
  );
});

SelectComponent.displayName = "SelectComponent";

export default SelectComponent;
