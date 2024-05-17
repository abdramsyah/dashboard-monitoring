import React from 'react';
import BaseTable from '@sentadell-src/components/Table/BaseTable/BaseTable';
import { ShipmentQueueData } from '@sentadell-src/stores/realm/schemas/shipment';
import { fontSizeEnum } from '@sentadell-src/components/Text/TextBase';

interface DjarumGroupingScanProps {
  data: ShipmentQueueData['grouping_data_list'];
}

const DjarumGroupingScan: React.FC<DjarumGroupingScanProps> = (
  props: DjarumGroupingScanProps
) => {
  const { data } = props;

  return (
    <BaseTable
      useNum
      data={data}
      columns={[
        { title: 'No. Gul.', key: 'grouping_number' },
        { title: 'Jumlah keranjang.', key: 'bucket_total' },
        { title: 'Jumlah BB', key: 'client_net_weight_total' }
      ]}
      fontSize={fontSizeEnum.XS}
    />
  );
};

export default DjarumGroupingScan;
