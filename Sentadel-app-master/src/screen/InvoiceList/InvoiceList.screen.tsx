import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import { useDebounce } from '@sentadell-src/utils/hooks/useDebounce';
import { getInvoiceList } from '@sentadell-src/apis/queries/fetch';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import { LOG } from '@sentadell-src/utils/commons';
import { alignStyle } from '@sentadell-src/utils/moderateStyles';
import { useQuery } from '@tanstack/react-query';
import { SearchFilterSortParams } from '@sentadell-src/types/global';
import styles from './InvoiceList.style';
import Input from '@sentadell-src/components/Form/Input/Input';
import TextBase from '@sentadell-src/components/Text/TextBase';
import {
  invoiceCardParamsList,
  invoiceStatusLabel
} from '@sentadell-src/constants/invoices';
import { InvoiceDetail } from '@sentadell-src/types/invoices';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.COORDINATOR_INVOICE_LIST
>;

type RoutesProps = RouteProp<
  RootNavigationParams,
  routes.COORDINATOR_INVOICE_LIST
>;

interface InvoiceListScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const InvoiceListScreen: React.FC<InvoiceListScreenProps> = (
  props: InvoiceListScreenProps
) => {
  const { navigation, route } = props;

  const debounce = useDebounce();

  const [payload, setPayload] = useState<SearchFilterSortParams>({
    page: 1,
    limit: 10,
    keyword: '',
    'filter[0]': 'coordinator_mode:',
    'filter[1]': 'excl_status:ON_PROGRESS'
  });
  const [keyword, setKeyword] = useState('');

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getInvoiceList(payload),
    queryKey: [QUERY_KEY.GET_INVOICE_LIST],
    refetchInterval: 600000
  });

  useEffect(() => {
    refetch();
  }, [payload]);

  const renderItem = useCallback(
    ({ item }: { item: InvoiceDetail }) => {
      const statusKey =
        (item.invoice_status_list && item.invoice_status_list[0].status) ||
        'ON_PROGRESS';

      return (
        <TouchableOpacity
          style={styles.invoiceContainer}
          onPress={() => {
            navigation.push(routes.COORDINATOR_INVOICE_DETAIL, {
              invoiceNumber: item.invoice_number
            });
          }}>
          <View style={styles.invoiceHeaderContainer}>
            <TextBase.S style={styles.textWhite}>
              {item.invoice_number}
            </TextBase.S>
            <TextBase.S style={styles.textWhite}>
              {item.delivery_number}
            </TextBase.S>
          </View>
          <View style={styles.invoiceContentContainer}>
            {invoiceCardParamsList(item).map((e, i) => (
              <View key={i.toString()} style={styles.contentRow}>
                <TextBase.XS style={{ flex: 8 }}>{e.title}</TextBase.XS>
                <TextBase.XS style={{ flex: 1 }}>:</TextBase.XS>
                <TextBase.XS style={{ flex: 10, textAlign: 'right' }}>
                  {e.value}
                </TextBase.XS>
              </View>
            ))}
            <View
              style={{
                backgroundColor: invoiceStatusLabel[statusKey].color,
                ...styles.invoiceStatusChip
              }}>
              <TextBase.XS style={styles.textWhite}>
                {invoiceStatusLabel[statusKey].label}
              </TextBase.XS>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [invoiceStatusLabel]
  );

  return (
    <Base
      headerTitle={route.params?.title}
      noScroll
      customContainerStyle={alignStyle.startBetween}>
      <View style={styles.headerContainer}>
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
      <View>
        <FlatList
          data={data?.data.data}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.contentContainerStyle}
          refreshControl={
            <RefreshControl
              enabled
              refreshing={isFetching}
              onRefresh={refetch}
            />
          }
          renderItem={renderItem}
        />
      </View>
    </Base>
  );
};

export default InvoiceListScreen;
