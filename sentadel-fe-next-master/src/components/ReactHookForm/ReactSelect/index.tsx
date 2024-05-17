import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ReactHookRulesType } from "@/types/reactForm";
import SelectComponent, { SelectComponentProps } from "@/components/Select";

export interface ReactSelectProps extends SelectComponentProps {
  name: string;
  rules?: ReactHookRulesType;
}

const ReactSelect = (props: ReactSelectProps) => {
  const { name, rules } = props;

  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <SelectComponent {...props} {...field} errMessage={error?.message} />
      )}
    />
  );
};

export default ReactSelect;
