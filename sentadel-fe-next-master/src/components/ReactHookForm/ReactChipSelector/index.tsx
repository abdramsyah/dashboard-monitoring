import ChipSelector, { ChipSelectorProps } from "@/components/ChipSelector";
import { ReactHookRulesType } from "@/types/reactForm";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ReactChipSelectorProps {
  name: string;
  rules?: ReactHookRulesType;
  chipSelectorProps: Omit<ChipSelectorProps, "onChange">;
  returnedKey?: "value" | "label" | "selected";
}

const ReactChipSelector = (props: ReactChipSelectorProps) => {
  const { name, rules, chipSelectorProps, returnedKey } = props;

  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const { isMultiple, options, title } = chipSelectorProps;

        if (isMultiple) {
          return (
            <ChipSelector
              isMultiple
              title={title}
              options={options}
              onChange={(val) =>
                field.onChange(
                  val
                    .map((e) => {
                      if (e.selected) {
                        if (returnedKey) return e[returnedKey];

                        return e;
                      }
                    })
                    .filter((e) => e)
                )
              }
            />
          );
        }

        return (
          <ChipSelector
            isMultiple={false}
            title={title}
            options={options}
            onChange={(val) =>
              field.onChange(returnedKey ? val[returnedKey] : val)
            }
          />
        );
      }}
    />
  );

  return;
};

export default ReactChipSelector;
