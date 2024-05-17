/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DropdownItemEnum,
  DropdownItemProps,
  DynamicDropdownProps
} from '@sentadell-src/components/Dropdown/Dropdown';
import {
  CustomOnChangeParamsProps,
  ReactFormDynamicDropdownRef
} from '@sentadell-src/components/Form/ReactFormDropdown/ReactFormDropdown';
import { ReactFormInputProps } from '@sentadell-src/components/Form/ReactFormInput/ReactFormInput';
import {
  FieldValues,
  RegisterOptions,
  UseFieldArrayReturn
} from 'react-hook-form';
import { TextInputProps } from 'react-native';

export type ReactHookRulesType =
  | Omit<
      RegisterOptions<FieldValues, string>,
      'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >
  | undefined;

export type ReactFormType<Tenum = any> = {
  formType: FormType;
  hide?: boolean;
  name: Tenum;
  refName?: string;
  rules?: ReactHookRulesType;
};

export type FormType =
  | {
      type: 'notShown';
    }
  | {
      type: 'input';
      keyboardType?: TextInputProps['keyboardType'];
      label: string;
      placeholder?: string;
      disabled?: boolean;
      inputProps?: TextInputProps;
      customStyle?: ReactFormInputProps['customStyle'];
    }
  | {
      type: 'select';
      ref?: React.Ref<ReactFormDynamicDropdownRef>;
      isMultiple: boolean;
      label: string;
      title: string;
      options: DropdownItemProps[];
      returnedKey?: DropdownItemEnum;
      customOnChange?: (props: CustomOnChangeParamsProps) => void;
      containerStyle?: DynamicDropdownProps['containerStyle'];
      enableSearch?: DynamicDropdownProps['enableSearch'];
      disabled?: boolean;
      dynamicOptions?: boolean;
    }
  | {
      type: 'fieldArray';
      title?: string;
      form: ReactFormType[];
      fieldArray: UseFieldArrayReturn<any, any, 'id'>;
      min?: number; //default 1
      max?: number; // default 5
      shouldFocus?: boolean; // default true
      useIndex?: boolean;
      disableAppend?: boolean;
      appendCopy?: boolean | string[];
      onCheck?: (id: string, index: number) => void;
      refObj?: {
        [K: string]:
          | React.MutableRefObject<{
              [T: string]: React.RefObject<ReactFormDynamicDropdownRef>;
            }>
          | undefined;
      };
    }
  | {
      type: 'dynamic';
      form1: FormType;
      form2: FormType;
      listenTo: string;
      condition?: string;
    };
