import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import styles from './OperationalWeigh.styles';
import Button from '@sentadell-src/components/Button/Button';
import Input from '@sentadell-src/components/Form/Input/Input';
import BaseTable, {
  ColumnType
} from '@sentadell-src/components/Table/BaseTable/BaseTable';
import { useDebounce } from '@sentadell-src/utils/hooks/useDebounce';
import { getGoodsInformation } from '@sentadell-src/apis/queries/fetch';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import {
  GoodsInformationListPayload,
  GetGoodsModel
} from '@sentadell-src/types/goods';
import { LOG, formatDateTime } from '@sentadell-src/utils/commons';
import { alignStyle } from '@sentadell-src/utils/moderateStyles';
import { useQuery } from '@tanstack/react-query';
import TextBase, {
  fontSizeEnum
} from '@sentadell-src/components/Text/TextBase';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_WEIGH
>;

type RoutesProps = RouteProp<RootNavigationParams, routes.OPERATIONAL_WEIGH>;

interface OperationalWeighScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const columns: ColumnType<GetGoodsModel>[] = [
  {
    title: 'Nomor Seri',
    key: 'serial_number',
    width: '12%'
  },
  {
    title: 'Barcode Penjualan',
    render: item => (
      <TextBase.XS>{item.grading_data[0]?.sales_code}</TextBase.XS>
    ),
    width: '15%'
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
    title: 'Tanggal Grading',
    render: item => (
      <TextBase.XS>
        {formatDateTime(item.grading_data[0]?.grading_date || '')}
      </TextBase.XS>
    ),
    width: '10%'
  },
  {
    title: 'Tanggal Timbang',
    render: item => (
      <TextBase.XS>
        {formatDateTime(item.weigh_data[0]?.weigh_date || '')}
      </TextBase.XS>
    ),
    width: '10%'
  },
  {
    title: 'BK',
    render: item => (
      <TextBase.XS style={styles.weightCol}>
        {item.weigh_data[0]?.gross_weight / 1000 || null}
      </TextBase.XS>
    )
  }
];

const OperationalWeighScreen: React.FC<OperationalWeighScreenProps> = (
  props: OperationalWeighScreenProps
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
              navigation.push(routes.OPERATIONAL_WEIGH_SCAN);
            }}
          />
          <Input
            outlined
            customStyle={{ container: styles.inputContainer }}
            inputProps={{
              value: keyword,
              placeholder: 'Pencarian',
              onChangeText: text => {
                LOG.info('Pencarian', text);
                setKeyword(text);
                debounce(() => {
                  LOG.info('Pencarian - debounce', text);
                  // refetch();
                  setPayload(state => ({ ...state, keyword: text }));
                }, 1000);
              }
            }}
          />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <BaseTable
          useNum
          columns={columns}
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

export default OperationalWeighScreen;
