import { View } from 'react-native';
import React from 'react';
import CenteredModal from '@sentadell-src/components/Modals/ModalCenter/CenteredModal';
import {
  fwStyle,
  flexiStyle,
  alignStyle
} from '@sentadell-src/utils/moderateStyles';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import { ShipmentQueueData } from '@sentadell-src/stores/realm/schemas/shipment';

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchQueue: FetchQueue;
}

const informationList: {
  title: string;
  key: keyof Omit<ShipmentQueueData, 'grouping_data_list' | 'goods_data_list'>;
}[] = [
  { title: 'Client', key: 'client_code' },
  { title: 'Jenis', key: 'shipment_type' },
  { title: 'Alamat', key: 'address_text' },
  { title: 'Nopol. Kendaraan', key: 'license_plate' },
  { title: 'Sopir', key: 'driver' },
  { title: 'PIC', key: 'pic' }
];

const InformationModal: React.FC<InformationModalProps> = (
  props: InformationModalProps
) => {
  const { isOpen, onClose, fetchQueue } = props;

  return (
    <CenteredModal
      visible={isOpen}
      onClose={onClose}
      customStyle={{ container: { width: 350, gap: 10 } }}>
      <TextBase.L style={fwStyle[700]}>INFO</TextBase.L>
      {fetchQueue.shipmentData &&
        informationList.map(e => {
          if (fetchQueue.shipmentData && fetchQueue.shipmentData[e.key])
            return (
              <View
                key={e.key}
                style={[flexiStyle.flexRow, alignStyle.centerBetween]}>
                <TextBase.S style={flexiStyle.flex2}>{e.title}</TextBase.S>
                <TextBase.S style={{ width: 15 }}> : </TextBase.S>
                <TextBase.S style={flexiStyle.flex3}>
                  {fetchQueue.shipmentData[e.key] as string}
                </TextBase.S>
              </View>
            );

          return null;
        })}
    </CenteredModal>
  );
};

export default InformationModal;
