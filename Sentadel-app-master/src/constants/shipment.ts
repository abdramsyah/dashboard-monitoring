import {
  DropdownItemEnum,
  DropdownItemProps
} from '@sentadell-src/components/Dropdown/Dropdown';
import {
  CustomOnChangeParamsProps,
  ReactFormDynamicDropdownRef
} from '@sentadell-src/components/Form/ReactFormDropdown/ReactFormDropdown';
import { ReactFormType } from '@sentadell-src/types/reactForm';
import { CreateShipmentFormProps } from '@sentadell-src/types/shipment';

export const ShipmentTypeOptions: DropdownItemProps[] = [
  {
    value: 'GROUPING',
    label: 'Gulungan',
    selected: false
  },
  {
    value: 'GOODS',
    label: 'Barang',
    selected: true
  }
];

type ShipmentFormListProps = {
  onChangeShipmentType: (props: CustomOnChangeParamsProps) => void;
  clientOptions: DropdownItemProps[];
  clientDisabled: boolean;
  clientRef: React.Ref<ReactFormDynamicDropdownRef>;
  onChangeClientData: (props: CustomOnChangeParamsProps) => void;
  addressOptions: DropdownItemProps[];
};

export const shipmentFormList: (
  props: ShipmentFormListProps
) => ReactFormType<keyof CreateShipmentFormProps>[] = ({
  onChangeShipmentType,
  clientOptions,
  clientRef,
  clientDisabled,
  onChangeClientData,
  addressOptions
}) => [
  {
    name: 'shipment_type',
    formType: {
      isMultiple: false,
      type: 'select',
      title: 'Pilih Jenis',
      label: 'Pilih Jenis',
      returnedKey: DropdownItemEnum.VALUE,
      options: ShipmentTypeOptions,
      customOnChange: onChangeShipmentType
    },
    rules: { required: 'Jenis pengiriman wajib dipilih' }
  },
  {
    name: 'client_data',
    formType: {
      isMultiple: false,
      ref: clientRef,
      type: 'select',
      title: 'Pilih Client',
      label: 'Pilih Client',
      returnedKey: DropdownItemEnum.DATA,
      options: clientOptions,
      enableSearch: true,
      disabled: clientDisabled,
      customOnChange: onChangeClientData,
      dynamicOptions: true
    },
    rules: { required: 'Client wajib dipilih' }
  },
  {
    name: 'address_data',
    formType: {
      isMultiple: false,
      type: 'select',
      title: 'Pilih Alamat',
      label: 'Pilih Alamat',
      returnedKey: DropdownItemEnum.DATA,
      options: addressOptions,
      enableSearch: true,
      dynamicOptions: true
    },
    rules: { required: 'Alamat wajib dipilih' }
  },
  {
    name: 'license_plate',
    formType: {
      type: 'input',
      title: 'No. Pol. Kendaraan',
      label: 'No. Pol. Kendaraan'
    },
    rules: { required: 'Nomor polisi kendaraan wajib diisi' }
  },
  {
    name: 'driver',
    formType: {
      type: 'input',
      title: 'Sopir',
      label: 'Sopir'
    },
    rules: { required: 'Sopir wajib diisi' }
  },
  {
    name: 'pic',
    formType: {
      type: 'input',
      title: 'Penanggung Jawab',
      label: 'Penanggung Jawab'
    }
  }
];
