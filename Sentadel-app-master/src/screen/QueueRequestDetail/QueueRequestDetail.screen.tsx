import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  TouchableOpacity,
  View
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import { getQueueGroupDetail } from '@sentadell-src/apis/queries/fetch';
import {
  GroupByQueueGroupDetailEnum,
  QueueGroupDetailModel,
  QueueGroupDetailPayload
} from '@sentadell-src/types/queue';
import { FilterIcon, TobaccoBucketIcon } from '@sentadell-src/config/Svgs';
import Colors from '@sentadell-src/config/Colors';
import Input from '@sentadell-src/components/Form/Input/Input';
import { widthStyle } from '@sentadell-src/utils/moderateStyles';
import styles from './QueueRequestDetail.styles';
import QueueGroupDetailCard from '@sentadell-src/components/Screen/QueueRequestDetail/QueueGroupDetailCard/QueueGroupDetailCard';
import FilterModal from '@sentadell-src/components/Screen/QueueRequestDetail/FilterModal/FilterModal';
import { LOG } from '@sentadell-src/utils/commons';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.COORDINATOR_QUEUE_REQUEST_DETAIL
>;

type RoutesProps = RouteProp<
  RootNavigationParams,
  routes.COORDINATOR_QUEUE_REQUEST_DETAIL
>;

interface QueueRequestDetailScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const QueueRequestDetailScreen: React.FC<QueueRequestDetailScreenProps> = (
  props: QueueRequestDetailScreenProps
) => {
  const { route } = props;

  const [params, setParams] = useState<QueueGroupDetailPayload>({
    delivery_number: route.params?.data?.delivery_number || '',
    group_by: GroupByQueueGroupDetailEnum.FARMER
  });
  const [filterModal, setFilterModal] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_QUEUE_GROUP_DETAIL],
    queryFn: () => getQueueGroupDetail(params),
    enabled: !!route.params?.data?.delivery_number
  });

  useEffect(() => {
    refetch();
  }, [params]);

  const renderModal = () => {
    return (
      <View>
        <FilterModal
          visible={filterModal}
          onClose={() => setFilterModal(false)}
          onSubmit={filter => {
            LOG.info('onSubmit - filter', filter);
            setParams(state => ({
              ...state,
              group_by: filter.group_by || GroupByQueueGroupDetailEnum.FARMER
            }));
            setFilterModal(false);
          }}
          onReset={() => {
            setParams(state => ({
              ...state,
              group_by: GroupByQueueGroupDetailEnum.FARMER
            }));
          }}
        />
      </View>
    );
  };

  const renderItem: ListRenderItem<QueueGroupDetailModel> = useCallback(
    ({ item, index }) => {
      return (
        <QueueGroupDetailCard
          expandable
          item={item}
          index={index}
          groupBy={params.group_by}
        />
      );
    },
    []
  );

  const renderBody = () => {
    if (route.params?.data?.delivery_number) {
      return (
        <View>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.filter}
              onPress={() => setFilterModal(true)}>
              <FilterIcon stroke={Colors.base.fullWhite} height={20} />
              <TextBase.L style={styles.textWhite}>Filter</TextBase.L>
            </TouchableOpacity>
            <Input
              outlined
              inputProps={{
                placeholder: 'Nomor Seri',
                placeholderTextColor: Colors.text.darkGray,
                onChangeText: text =>
                  setParams(state => ({
                    ...state,
                    keyword: text
                  }))
              }}
              customStyle={{
                container: widthStyle.width50
              }}
            />
          </View>
          <FlatList
            data={data?.data.data}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.contentContainerStyle}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                enabled
                refreshing={isFetching}
                onRefresh={refetch}
              />
            }
          />
        </View>
      );
    }

    const paramsData = route.params?.data;

    return (
      <View>
        {paramsData?.queue_data.map((queue, qIdx) => {
          return (
            <View key={qIdx.toString()} style={styles.cardHeader}>
              <View style={styles.cardHeader1}>
                <TextBase.M style={styles.textWhite600}>
                  {`${qIdx + 1})   ${queue.farmer_name}`}
                </TextBase.M>
                <View style={styles.totalBucket}>
                  <TobaccoBucketIcon stroke={Colors.base.fullWhite} />
                  <TextBase.M style={styles.textWhite600}>
                    {queue.quantity_bucket}
                  </TextBase.M>
                </View>
              </View>
              <TextBase.M style={styles.textWhite600}>
                Jenis: {queue.product_type}
              </TextBase.M>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Base headerTitle={route.params?.title} noScroll>
      <View style={styles.container}>{renderBody()}</View>
      {renderModal()}
    </Base>
  );
};

export default QueueRequestDetailScreen;
