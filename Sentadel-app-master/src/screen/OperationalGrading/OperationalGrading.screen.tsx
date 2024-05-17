import { TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import { RouteProp } from '@react-navigation/native';
import Base from '@sentadell-src/components/Base/Base';
import styles from './OperationalGrading.styles';
import Button from '@sentadell-src/components/Button/Button';
import Input from '@sentadell-src/components/Form/Input/Input';
import { useQuery } from '@tanstack/react-query';
import { getGoodsInformation } from '@sentadell-src/apis/queries/fetch';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import {
  GoodsInformationListPayload,
  GetGoodsModel
} from '@sentadell-src/types/goods';
import {
  LOG,
  formatCurrency,
  formatDateTime
} from '@sentadell-src/utils/commons';
import { alignStyle } from '@sentadell-src/utils/moderateStyles';
import { useDebounce } from '@sentadell-src/utils/hooks/useDebounce';
import BaseTable, {
  ColumnType
} from '@sentadell-src/components/Table/BaseTable/BaseTable';
import TextBase, {
  fontSizeEnum
} from '@sentadell-src/components/Text/TextBase';

require('dayjs/locale/id');

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_GRADING
>;

type RoutesProps = RouteProp<RootNavigationParams, routes.OPERATIONAL_GRADING>;

interface OperationalGradingScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const columns: (
  onPressItem: (item: GetGoodsModel) => void
) => ColumnType<GetGoodsModel>[] = onPressItem => [
  {
    title: 'Nomor Seri',
    render: item => (
      <TouchableOpacity onPress={() => onPressItem(item)}>
        <TextBase.XS>{item.serial_number}</TextBase.XS>
      </TouchableOpacity>
    ),
    width: '12%'
  },
  {
    title: 'Tanggal Grading',
    render: item => (
      <TextBase.XS>
        {formatDateTime(item.grading_data[0]?.grading_date || '')}
      </TextBase.XS>
    ),
    width: '10%'
  },
  {
    title: 'Koordinator',
    key: 'coordinator_name',
    width: '16%'
  },
  {
    title: 'Petani',
    key: 'farmer_name',
    width: '14%'
  },
  {
    title: 'Barcode Penjualan',
    render: item => (
      <TextBase.XS>{item.grading_data[0]?.sales_code}</TextBase.XS>
    ),
    width: '15%'
  },
  {
    title: 'Grade',
    render: item => <TextBase.XS>{item.grading_data[0]?.grade}</TextBase.XS>,
    width: '8%'
  },
  {
    title: 'Harga Beli',
    render: item => (
      <TextBase.XS>
        {formatCurrency(item.grading_data[0]?.unit_price, true)}
      </TextBase.XS>
    ),
    width: '11%'
  }
];

const OperationalGradingScreen: React.FC<OperationalGradingScreenProps> = (
  props: OperationalGradingScreenProps
) => {
  const { navigation, route } = props;

  const debounce = useDebounce();

  const [payload, setPayload] = useState<GoodsInformationListPayload>({
    page: 1,
    limit: 10,
    keyword: '',
    'filter[0]': 'on_progress'
  });
  const [keyword, setKeyword] = useState('');
  const [pages, setPages] = useState(0);

  const { data, isFetching, isSuccess, refetch } = useQuery({
    queryFn: () => getGoodsInformation(payload),
    queryKey: [QUERY_KEY.GET_GRADING_INFO],
    refetchInterval: 600000
  });

  const onChangeText = (text: string) => {
    setKeyword(text);
    debounce(() => {
      LOG.info('Pencarian - debounce', text);
      setPayload(state => ({ ...state, keyword: text }));
    }, 1000);
  };

  useEffect(() => {
    refetch();
  }, [payload]);

  useEffect(() => {
    if (isSuccess) {
      setPages(data?.data?.meta?.pages || 0);
    }
  }, [isSuccess, data?.data?.meta?.pages]);

  return (
    <Base
      headerTitle={route.params?.title}
      noScroll
      customContainerStyle={alignStyle.startBetween}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Button
            title={'Scan'}
            theme={'solid-blue'}
            onPress={() => {
              navigation.push(routes.OPERATIONAL_GRADING_SCAN);
            }}
          />
          <Input
            outlined
            customStyle={{ container: styles.inputContainer }}
            clearText
            onClearText={() => onChangeText('')}
            inputProps={{
              value: keyword,
              placeholder: 'Pencarian',
              onChangeText: onChangeText
            }}
          />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <BaseTable
          useNum
          columns={columns(() => {
            // item.coordinator_code;
          })}
          data={data?.data.data}
          isLoading={isFetching}
          refreshing={isFetching}
          onRefresh={refetch}
          fontSize={fontSizeEnum.XS}
          pagination={{
            meta: {
              page: data?.data.meta?.page || payload.page,
              pages: data?.data.meta?.pages || pages,
              limit: data?.data.meta?.limit || payload.limit
            },
            onPressPage: page => setPayload(state => ({ ...state, page: page }))
          }}
        />
      </View>
    </Base>
  );
};

export default OperationalGradingScreen;
