import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import styles from './OperationalGrouping.styles';
import Button from '@sentadell-src/components/Button/Button';
import { alignStyle } from '@sentadell-src/utils/moderateStyles';
import { useDebounce } from '@sentadell-src/utils/hooks/useDebounce';
import { SearchFilterSortParams } from '@sentadell-src/types/global';
import { getGroupingList } from '@sentadell-src/apis/queries/fetch';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import Input from '@sentadell-src/components/Form/Input/Input';
import BaseTable from '@sentadell-src/components/Table/BaseTable/BaseTable';
import { fontSizeEnum } from '@sentadell-src/components/Text/TextBase';
import FetchQueueList from '@sentadell-src/components/Screen/OperationalGrade/GradingQueueList/FetchQueueList';
import { useGetFetchQueues } from '@sentadell-src/stores/realm/actions/fetchQueue';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_GROUPING
>;

type RoutesProps = RouteProp<RootNavigationParams, routes.OPERATIONAL_GROUPING>;

interface OperationalGroupingScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const OperationalGroupingScreen: React.FC<OperationalGroupingScreenProps> = (
  props: OperationalGroupingScreenProps
) => {
  const { navigation, route } = props;

  const debounce = useDebounce();

  const [payload, setPayload] = useState<SearchFilterSortParams>({
    page: 1,
    limit: 10,
    keyword: ''
  });
  const [keyword, setKeyword] = useState('');
  const [pages, setPages] = useState(0);

  const { data, isFetching, isSuccess, refetch } = useQuery({
    queryFn: () => getGroupingList(payload),
    queryKey: [QUERY_KEY.GET_GROUPING_LIST],
    refetchInterval: 7200000
  });

  const fetchQueue = useGetFetchQueues({
    filter: { type: 'GROUPING' },
    limit: 5,
    isReversed: true
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
          <Input
            outlined
            customStyle={{ container: styles.inputContainer }}
            inputProps={{
              value: keyword,
              placeholder: 'Pencarian',
              onChangeText: text => {
                setKeyword(text);
                debounce(() => {
                  setPayload(state => ({ ...state, keyword: text }));
                }, 1000);
              }
            }}
          />
          <Button
            title={'Buat Baru'}
            theme={'solid-blue'}
            onPress={() => {
              navigation.push(routes.OPERATIONAL_GROUPING_SCAN);
            }}
          />
        </View>
        <FetchQueueList
          fetchQueue={fetchQueue}
          customHeight={140}
          onPressItem={queue =>
            navigation.push(routes.OPERATIONAL_GROUPING_SCAN, {
              fetchQueueId: queue._id
            })
          }
        />
      </View>

      <View style={styles.contentContainer}>
        <BaseTable
          useNum
          columns={[
            {
              title: 'Nomor Glg.',
              key: 'grouping_number'
            },
            {
              title: 'Nomor Client',
              key: 'grouping_client_number'
            },
            {
              title: 'Client.',
              key: 'client_code',
              width: 50
            },
            {
              title: 'Grade',
              key: 'grade_initial',
              width: 40
            },
            {
              title: 'UB',
              key: 'ub',
              width: 30
            },
            {
              title: 'Jumlah Krj.',
              key: 'total_goods',
              width: 50
            },
            // {
            //   title: 'Upd. Terakhir',
            //   render: item => (
            //     <TextBase.XS>{formatDateTime(item.last_updated)}</TextBase.XS>
            //   )
            // },
            {
              title: 'Dibuat oleh',
              key: 'created_by'
            }
          ]}
          onPressItem={item => {
            navigation.navigate(routes.OPERATIONAL_GROUPING_DETAIL, {
              groupingId: item.grouping_id
            });
          }}
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

export default OperationalGroupingScreen;
