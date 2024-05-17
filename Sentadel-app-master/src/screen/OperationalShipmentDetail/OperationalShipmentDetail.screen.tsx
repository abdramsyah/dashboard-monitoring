import { View } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import styles from './OperationalShipmentDetail.styles';
import { screenHeight } from '@sentadell-src/config/Sizes';
import BaseTable, {
  ColumnType
} from '@sentadell-src/components/Table/BaseTable/BaseTable';
import TextBase, {
  fontSizeEnum
} from '@sentadell-src/components/Text/TextBase';
import { RouteProp } from '@react-navigation/native';
import {
  GroupingAndGoodsModel,
  GroupingDetailPayload
} from '@sentadell-src/types/grouping';
import { useQuery } from '@tanstack/react-query';
import { getGroupingDetail } from '@sentadell-src/apis/queries/fetch';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_GROUPING_DETAIL
>;

type RoutesProps = RouteProp<
  RootNavigationParams,
  routes.OPERATIONAL_GROUPING_DETAIL
>;

interface OperationalScanScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const column: ColumnType<GroupingAndGoodsModel>[] = [
  { title: 'Nomor Seri', key: 'serial_number', width: 70 },
  {
    title: 'Petani',
    render: item => {
      return (
        <TextBase.XS>{`${item.coordinator_code} - ${item.farmer_name}`}</TextBase.XS>
      );
    }
  },
  { title: 'Barcode Penjualan', key: 'sales_code' },
  { title: 'Jenis', key: 'product_type', width: 60 },
  { title: 'Grade', key: 'grade', width: 50 }
];

const OperationalScanScreen: React.FC<OperationalScanScreenProps> = (
  props: OperationalScanScreenProps
) => {
  const {
    route: {
      params: { groupingId, groupingNumber }
    }
  } = props;

  const payload: GroupingDetailPayload = {
    // limit: 100,
    page: 1,
    keyword: '',
    is_edit: false
  };

  const { data, isFetching, refetch } = useQuery({
    queryFn: () =>
      getGroupingDetail(groupingId || groupingNumber || '', payload),
    queryKey: [QUERY_KEY.GET_GROUPING_DETAIL],
    refetchInterval: false
  });

  const headerData = [
    { title: 'Client', value: data?.data.data.client_name },
    {
      title: 'Jumlah keranjang',
      value: data?.data.data.grouping_data_json?.length
    },
    { title: 'Grade', value: data?.data.data.grade_initial },
    { title: 'UB', value: data?.data.data.ub }
  ];

  return (
    <Base
      headerTitle={data?.data.data.grouping_number || groupingNumber}
      noScroll>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View
            style={{
              flexWrap: 'wrap',
              gap: 48,
              rowGap: 16
            }}>
            {headerData.map(e => {
              if (data?.data.data.client_code !== 'DJRM' && e.title === 'UB')
                return;

              return (
                <View key={e.title} style={flexiStyle.flexRowG1}>
                  <TextBase.L style={{ width: 150, fontWeight: '700' }}>
                    {e.title}
                  </TextBase.L>
                  <TextBase.L>:</TextBase.L>
                  <TextBase.L>{e.value}</TextBase.L>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.groupingDataContainer}>
          <View
            style={{
              height: screenHeight * 0.6
            }}>
            <BaseTable
              data={data?.data.data.grouping_data_json}
              useNum
              columns={column}
              fontSize={fontSizeEnum.XS}
              isLoading={isFetching}
              refreshing={isFetching}
              onRefresh={refetch}
            />
          </View>
        </View>
      </View>
    </Base>
  );
};

export default OperationalScanScreen;
