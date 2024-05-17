import {
  View,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  RefreshControl
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Base from '@sentadell-src/components/Base/Base';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import { RouteProp } from '@react-navigation/native';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Colors from '@sentadell-src/config/Colors';
import {
  FarmerIcon,
  FilterIcon,
  PlusIcon,
  TobaccoBucketIcon
} from '@sentadell-src/config/Svgs';
import Input from '@sentadell-src/components/Form/Input/Input';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import { getQueueGroup } from '@sentadell-src/apis/queries/fetch';
import {
  ProgressStatus,
  QueueGroupModel,
  QueueGroupPayload
} from '@sentadell-src/types/queue';
import dayjs from 'dayjs';
import styles from './QueueRequestTable.styles';
import Button from '@sentadell-src/components/Button/Button';
import { widthStyle } from '@sentadell-src/utils/moderateStyles';
import { queueStatusTrans } from '@sentadell-src/constants/queue';
import FilterModal from '@sentadell-src/components/Screen/QueueRequestTable/FilterModal/FilterModal';
import { FilterParamsType } from '@sentadell-src/types/global';

const statusTheme: { [K in ProgressStatus]: ViewStyle } = {
  APPROVED: styles.queueGroupStatusApproved,
  ON_PROGRESS: styles.queueGroupStatusOnProgress,
  REJECTED: styles.queueGroupStatusRejected
};

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.COORDINATOR_QUEUE_REQUEST_TABLE
>;

type RoutesProps = RouteProp<
  RootNavigationParams,
  routes.COORDINATOR_QUEUE_REQUEST_TABLE
>;

interface QueueRequestTableScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const QueueRequestTableScreen: React.FC<QueueRequestTableScreenProps> = (
  props: QueueRequestTableScreenProps
) => {
  const { navigation, route } = props;

  const [params, setParams] = useState<QueueGroupPayload>({
    limit: 10,
    page: 1
  });
  const [filterModal, setFilterModal] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_QUEUE_GROUP],
    queryFn: () => getQueueGroup(params)
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
            const filterParams: FilterParamsType = {};

            Object.keys(params).forEach(e => {
              if (e.startsWith('filter')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete params[e as any];
              }
            });

            filter.forEach((e, idx) => {
              filterParams[`filter[${idx}]`] = e;
            });

            setParams(state => ({ ...state, ...filterParams }));
            setFilterModal(false);
          }}
          onReset={() =>
            Object.keys(params).forEach(e => {
              if (e.startsWith('filter')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete params[e as any];
              }
            })
          }
        />
      </View>
    );
  };

  const renderItem = useCallback(
    ({ item, index }: { item: QueueGroupModel; index: number }) => {
      return (
        <TouchableOpacity
          style={styles.queueGroupContainer}
          onPress={() =>
            navigation.push(routes.COORDINATOR_QUEUE_REQUEST_DETAIL, {
              title: item.delivery_number || 'Detail',
              data: item
            })
          }>
          <View style={styles.queueGroupHeader}>
            <TextBase.M style={styles.fw600}>
              {`${params.page * (index + 1)})    `} DO:{' '}
              {item.delivery_number || '-'}
            </TextBase.M>
            <View style={statusTheme[item.status]}>
              <TextBase.S style={styles.textWhite}>
                {queueStatusTrans[item.status]}
              </TextBase.S>
            </View>
          </View>
          <View style={styles.horizontalLine} />
          <View style={styles.queueGroupContent}>
            <View style={styles.rowContainer}>
              <TobaccoBucketIcon stroke={Colors.base.fullBlack} />
              <TextBase.M>{item.quantity_bucket}</TextBase.M>
            </View>
            <View style={styles.rowContainer}>
              <FarmerIcon />
              <TextBase.M>{item.queue_data.length}</TextBase.M>
            </View>
          </View>
          <TextBase.M>
            Tanggal Pengajuan Terakhir :{'    '}
            {dayjs(item.last_created_at)
              .locale('id')
              .format('ddd, DD MMM YYYY')}
          </TextBase.M>
        </TouchableOpacity>
      );
    },
    [params.page, statusTheme]
  );

  return (
    <Base headerTitle={route.params?.title} noScroll>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.filter}
            onPress={() => setFilterModal(true)}>
            <FilterIcon stroke={Colors.base.fullWhite} height={20} />
            <TextBase.L style={styles.textWhite}>Filter</TextBase.L>
          </TouchableOpacity>
          <Button
            theme="solid-blue"
            onPress={() => {
              navigation.navigate(routes.COORDINATOR_QUEUE_REQUEST_FORM);
            }}>
            <PlusIcon stroke={Colors.base.fullWhite} />
          </Button>
          <Input
            outlined
            inputProps={{
              placeholder: 'Pencarian',
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
          style={styles.flatListStyle}
          refreshControl={
            <RefreshControl
              enabled
              refreshing={isFetching}
              onRefresh={refetch}
            />
          }
          contentContainerStyle={styles.flatListContentContainer}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
        />
      </View>
      {renderModal()}
    </Base>
  );
};

export default QueueRequestTableScreen;
