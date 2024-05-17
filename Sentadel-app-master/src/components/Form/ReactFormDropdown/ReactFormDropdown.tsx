import React, { useState } from 'react';
import Dropdown, {
  DropdownItemEnum,
  DropdownItemProps,
  DynamicDropdownProps
} from '@sentadell-src/components/Dropdown/Dropdown';
import {
  Controller,
  UseControllerProps,
  useFormContext
} from 'react-hook-form';

export type CustomOnChangeParamsProps =
  | {
      name: string;
      isMultiple?: false;
      data: DropdownItemProps;
    }
  | {
      name: string;
      isMultiple: true;
      data: DropdownItemProps[];
    };

export interface ReactFormDropdownProps {
  name: string;
  rules?: UseControllerProps['rules'];
  dropdownProps: Omit<DynamicDropdownProps, 'onChange'>;
  returnedKey?: DropdownItemEnum;
  customOnChange?: (props: CustomOnChangeParamsProps) => void;
}

export interface ReactFormDynamicDropdownRef {
  setSelected: (val: DropdownItemProps | DropdownItemProps[]) => void;
}

const ReactFormDropdown = React.forwardRef(function (
  props: ReactFormDropdownProps,
  ref: React.ForwardedRef<ReactFormDynamicDropdownRef>
) {
  const { name, rules, dropdownProps, returnedKey, customOnChange } = props;

  const { control, setValue } = useFormContext();

  const [selectedData, setSelectedData] = useState<
    DropdownItemProps | DropdownItemProps[]
  >();

  React.useImperativeHandle(
    ref,
    function getRefValue() {
      return {
        setSelected: (val: DropdownItemProps | DropdownItemProps[]) => {
          if (val instanceof Array) {
            if (returnedKey) {
              setValue(
                name,
                val.map(e => e[returnedKey])
              );
            } else {
              setValue(name, val);
            }
            setSelectedData(val);
          } else {
            if (returnedKey) {
              setValue(name, val[returnedKey]);
            } else {
              setValue(name, val);
            }
            setSelectedData(val);
          }
        }
      };
    },
    []
  );

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const { isMultiple } = dropdownProps;

        if (isMultiple) {
          return (
            <Dropdown
              {...dropdownProps}
              isMultiple
              forceSelect={selectedData instanceof Array ? selectedData : []}
              onForceSelect={() => setSelectedData([])}
              errorMessage={error?.message}
              onBlur={field.onBlur}
              onChange={items => {
                field.onChange(
                  items.map(item => {
                    if (item[DropdownItemEnum.SELECTED]) {
                      if (returnedKey) return item[returnedKey];
                      return item;
                    }
                  })
                );
                if (customOnChange)
                  customOnChange({ name, isMultiple, data: items });
              }}
            />
          );
        }

        return (
          <Dropdown
            {...dropdownProps}
            isMultiple={false}
            forceSelect={
              !(selectedData instanceof Array) ? selectedData : undefined
            }
            onForceSelect={() => setSelectedData(undefined)}
            errorMessage={error?.message}
            onBlur={field.onBlur}
            onChange={item => {
              field.onChange(
                returnedKey
                  ? returnedKey in item
                    ? item[returnedKey]
                    : item
                  : item
              );
              if (customOnChange)
                customOnChange({ name, isMultiple, data: item });
            }}
          />
        );
      }}
    />
  );
});

export default ReactFormDropdown;
