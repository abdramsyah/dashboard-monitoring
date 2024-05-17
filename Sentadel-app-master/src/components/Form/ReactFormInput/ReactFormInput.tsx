import React from 'react';
import {
  Controller,
  UseControllerProps,
  useFormContext
} from 'react-hook-form';
import Input, { SentadelInputProps } from '../Input/Input';

export interface ReactFormInputProps
  extends Omit<SentadelInputProps, 'errorMessage'> {
  name: string;
  rules?: UseControllerProps['rules'];
}

const ReactFormInput = (props: ReactFormInputProps) => {
  const { name, rules, label, isPassword, outlined, customStyle, inputProps } =
    props;
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        return (
          <Input
            label={label}
            isPassword={isPassword}
            outlined={outlined}
            errorMessage={error?.message}
            customStyle={customStyle}
            inputProps={{
              ...inputProps,
              ...field,
              onChangeText: field.onChange
            }}
          />
        );
      }}
    />
  );
};

export default ReactFormInput;
