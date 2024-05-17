import React, { useMemo, useRef, useState } from 'react';
import ReactFormBuilder from '@sentadell-src/components/Form/ReactFormBuilder/ReactFormBuilder';
import { shipmentFormList } from '@sentadell-src/constants/shipment';
import { useForm } from 'react-hook-form';
import { ShipmentQueueData } from '@sentadell-src/stores/realm/schemas/shipment';
import {
  DropdownItemEnum,
  DropdownItemProps
} from '@sentadell-src/components/Dropdown/Dropdown';
import {
  CustomOnChangeParamsProps,
  ReactFormDynamicDropdownRef
} from '@sentadell-src/components/Form/ReactFormDropdown/ReactFormDropdown';
import BottomSheetModal from '@sentadell-src/components/Modals/BottomSheetModal/BottomSheetModal';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { getClients } from '@sentadell-src/apis/queries/fetch';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import { ClientModel } from '@sentadell-src/types/clients';
import { View } from 'react-native';
import Colors from '@sentadell-src/config/Colors';
import { fwStyle, paddingStyle } from '@sentadell-src/utils/moderateStyles';
import { useCreateFetchQueue } from '@sentadell-src/stores/realm/actions/fetchQueue';
import { CreateShipmentFormProps } from '@sentadell-src/types/shipment';

const parseClientToDropdownItems: (
  client: ClientModel
) => DropdownItemProps = client => ({
  label: client.client_name,
  value: client.id,
  selected: false,
  data: client
});

interface ManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCreateLocal: (fetchQueueId?: string) => void;
}

const ManageModal: React.FC<ManageModalProps> = (props: ManageModalProps) => {
  const { isOpen, onClose, onSuccessCreateLocal } = props;

  const clientRef = useRef<ReactFormDynamicDropdownRef>(null);
  const methods = useForm<CreateShipmentFormProps>({
    mode: 'all',
    defaultValues: {
      shipment_type: 'GOODS'
    }
  });
  const { create, isLoading } = useCreateFetchQueue();

  const { data: clientRes } = useQuery({
    queryFn: () => getClients(),
    queryKey: [QUERY_KEY.GET_CLIENTS],
    refetchInterval: 7200000
  });

  const isGrouping = methods.watch('shipment_type') === 'GROUPING';

  const clientOptions = useMemo(() => {
    const dropdownOpt: DropdownItemProps[] = [];

    clientRes?.data.data.every(e => {
      if (isGrouping && e.code === 'DJRM') {
        dropdownOpt.push(parseClientToDropdownItems(e));
        return false;
      }
      dropdownOpt.push(parseClientToDropdownItems(e));
      return true;
    });

    return dropdownOpt;
  }, [isGrouping, clientRes?.data.data]);

  const [addressOptions, setAddressOptions] = useState<DropdownItemProps[]>([]);

  const submitRequest = (form: CreateShipmentFormProps) => {
    const {
      shipment_type,
      client_data,
      address_data,
      driver,
      license_plate,
      pic
    } = form;

    const shipmentData = {
      shipment_type,
      client_id: client_data.id,
      client_code: client_data.code,
      address_id: address_data.id,
      address_text: address_data.address,
      driver,
      license_plate,
      pic
    } as ShipmentQueueData;

    create({
      type: 'SHIPMENT',
      status: 'PAUSED',
      data: shipmentData,
      onSuccess: fq => onSuccessCreateLocal(fq?._id)
    });
  };

  const onChangeShipmentType = (cProps: CustomOnChangeParamsProps) => {
    const { data, isMultiple } = cProps;

    if (!isMultiple) {
      if (data[DropdownItemEnum.VALUE] === 'GROUPING') {
        const djrmItem = clientOptions.find(e => {
          const eData = e[DropdownItemEnum.DATA] as ClientModel;

          return eData?.code === 'DJRM';
        });

        if (djrmItem)
          clientRef.current?.setSelected(djrmItem as DropdownItemProps);
      }
    }
  };

  const onChangeClientData = (cProps: CustomOnChangeParamsProps) => {
    const { data, isMultiple } = cProps;

    if (!isMultiple) {
      const newAddressOpt = (
        data[DropdownItemEnum.DATA] as ClientModel
      ).address_list?.map<DropdownItemProps>(e => ({
        value: e.id || 0,
        label: e.address || '',
        selected: false,
        data: e
      }));

      setAddressOptions(newAddressOpt || []);
    }
  };

  return (
    <BottomSheetModal
      visible={isOpen}
      onClose={onClose}
      maskCloseArea
      customStyle={{
        contentStyle: paddingStyle.p20
      }}>
      <View
        style={{
          paddingTop: 5,
          paddingBottom: 20,
          marginBottom: 10,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.purpleOcean
        }}>
        <TextBase.L style={fwStyle[700]}>Buat Baru</TextBase.L>
      </View>
      <ReactFormBuilder
        methods={methods}
        formList={shipmentFormList({
          onChangeShipmentType,
          onChangeClientData,
          clientOptions,
          clientDisabled: isGrouping,
          clientRef,
          addressOptions
        })}
        isLoading={isLoading}
        onSubmit={submitRequest}
      />
    </BottomSheetModal>
  );
};

export default ManageModal;
