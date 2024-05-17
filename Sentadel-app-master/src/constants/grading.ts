import {
  DropdownItemEnum,
  DropdownItemProps
} from '@sentadell-src/components/Dropdown/Dropdown';
import {
  CustomOnChangeParamsProps,
  ReactFormDynamicDropdownRef
} from '@sentadell-src/components/Form/ReactFormDropdown/ReactFormDropdown';
import Colors from '@sentadell-src/config/Colors';
import { FetchQueueStatus } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import { GradingQueueDataStatus } from '@sentadell-src/stores/realm/schemas/grading';
import {
  GradingQueueEnum,
  GradingQueueProps
} from '@sentadell-src/types/grading';
import { ReactFormType } from '@sentadell-src/types/reactForm';
import { UseFieldArrayReturn } from 'react-hook-form';
import { TextInputProps } from 'react-native';

export const graderList: DropdownItemProps[] = [
  {
    value: 'Evan',
    label: 'Evan',
    selected: false
  },
  {
    value: 'Jopie',
    label: 'Jopie',
    selected: false
  }
];

type gradingFormListOtherType = {
  salesCode?: TextInputProps;
  gradeOptions: DropdownItemProps[];
  onCheck?: (id: string, index: number) => void;
  customOnChange: (props: CustomOnChangeParamsProps) => void;
  ref?: React.MutableRefObject<{
    [K: string]: React.RefObject<ReactFormDynamicDropdownRef>;
  }>;
};

export const gradingFormList: (
  fieldArray: UseFieldArrayReturn<
    GradingQueueProps,
    GradingQueueEnum.BUCKETS,
    'id'
  >,
  other: gradingFormListOtherType
) => ReactFormType<GradingQueueEnum>[] = (fieldArray, other) => [
  {
    name: GradingQueueEnum.BUCKETS,
    formType: {
      type: 'fieldArray',
      fieldArray: fieldArray,
      title: 'Data',
      min: 0,
      max: 40,
      shouldFocus: false,
      useIndex: true,
      appendCopy: ['grade_data', 'unit_price'],
      onCheck: other.onCheck,
      refObj: { grade_data: other.ref },
      form: [
        {
          name: 'serial_number',
          formType: {
            type: 'input',
            label: 'No. Seri',
            customStyle: {
              container: {
                width: 100
              }
            }
          },
          rules: { required: 'Nomor seri tidak boleh kosong' }
        },
        {
          name: 'grade_data',
          formType: {
            isMultiple: false,
            type: 'select',
            label: 'Grade',
            title: 'Grade',
            options: other?.gradeOptions,
            returnedKey: DropdownItemEnum.DATA,
            containerStyle: {
              width: 180
            },
            enableSearch: true,
            customOnChange: other.customOnChange
          },
          rules: { required: 'Pilih salah satu grade' }
        },
        {
          name: 'unit_price',
          formType: {
            type: 'input',
            label: 'Harga',
            keyboardType: 'numeric',
            customStyle: {
              container: {
                width: 80
              }
            },
            inputProps: other?.salesCode
          },
          rules: { required: 'Harga harus diisi' }
        },
        {
          name: 'sales_code',
          formType: {
            type: 'input',
            label: 'Barcode',
            customStyle: {
              container: {
                width: 80
              }
            }
          },
          rules: { required: 'Barcode Penjualan harus diisi' }
        }
      ]
    }
  }
];

export const gradingQueueDataStatusTheme: {
  [K in GradingQueueDataStatus]: string;
} = {
  FAILED: Colors.chip.red,
  SUCCESS: Colors.chip.green,
  ON_PROGRESS: Colors.chip.blueOnProgress,
  CREATED: Colors.base.chineseGold,
  VALIDATED: Colors.base.chineseGold,
  USED: Colors.base.chineseGold,
  UPDATED: Colors.base.gainsboro
};

export const gradingQueueStatusTheme: {
  [K in FetchQueueStatus]: string;
} = {
  QUEUED: '#eee',
  PAUSED: Colors.base.coolGrey,
  COMPLETED: Colors.base.greenApproved,
  ON_PROGRESS: Colors.base.blueOnProgress
};
