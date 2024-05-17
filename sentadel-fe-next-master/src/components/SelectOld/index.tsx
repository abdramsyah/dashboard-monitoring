import { Select, Space } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { ReactNode } from "react";
import { RoleEnum } from "@/types/auth";

interface SelectComponentProps {
  placeholder?: string;
  className?: string;
  direction?: "horizontal" | "vertical";
  allowClear?:
    | boolean
    | {
        clearIcon?: ReactNode;
      };
  value: any;
  selects: any[];
  body: any;
  setBody: (val: any) => void;
  onChange: (
    value: any,
    option: DefaultOptionType | DefaultOptionType[]
  ) => void;
  userParam: any;
}

const SelectComponent = (props: SelectComponentProps) => {
  const {
    placeholder,
    direction,
    allowClear,
    value,
    selects,
    body,
    setBody,
    userParam,
  } = props;

  const handleChange = (value: RoleEnum) => {
    if (userParam) {
      setBody({
        ...body,
        user_param: {
          ...userParam,
          roles: value,
        },
      });
    } else {
      setBody({
        ...body,
        roles: value,
      });
    }
  };

  return (
    <Space
      style={{
        width: "100%",
      }}
      direction={direction}
    >
      {
        <Select
          mode="multiple"
          allowClear={allowClear}
          style={{ width: "100%" }}
          placeholder={placeholder}
          defaultValue={value}
          onChange={handleChange}
        >
          {selects.map((select) => (
            <Select.Option key={select.key} value={select.key}>
              {select.name}
            </Select.Option>
          ))}
        </Select>
      }
    </Space>
  );
};
export default SelectComponent;
