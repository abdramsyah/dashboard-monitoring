import { View } from 'react-native';
import React from 'react';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import { QUERY_KEY } from '@sentadell-src/apis/queries/key';
import { useQuery } from '@tanstack/react-query';
import TextBase, {
  fontSizeEnum
} from '@sentadell-src/components/Text/TextBase';
import { BucketData } from '@sentadell-src/types/invoices';
import { getInvoiceDetail } from '@sentadell-src/apis/queries/fetch';
import BaseTable, {
  ColumnType
} from '@sentadell-src/components/Table/BaseTable/BaseTable';
import styles from './InvoiceDetail.style';
import { formatCurrency } from '@sentadell-src/utils/commons';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import { headerDetail } from '@sentadell-src/constants/invoices';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.COORDINATOR_INVOICE_DETAIL
>;

type RoutesProps = RouteProp<
  RootNavigationParams,
  routes.COORDINATOR_INVOICE_DETAIL
>;

interface InvoiceDetailScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const columns: ColumnType<BucketData>[] = [
  {
    title: 'Nomor Seri',
    render: item => (
      <TextBase.XS>{item.serial_number.split('-')[1]}</TextBase.XS>
    ),
    width: '12%'
  },
  {
    title: 'Petani',
    key: 'farmer_name',
    width: '20%'
  },
  {
    title: 'BK',
    render: item => (
      <TextBase.XS>{item.purchase_gross_weight / 1000}</TextBase.XS>
    ),
    width: '6%'
  },
  {
    title: 'BB',
    render: item => (
      <TextBase.XS>{item.purchase_net_weight / 1000}</TextBase.XS>
    ),
    width: '6%'
  },
  {
    title: 'Harga',
    render: item => (
      <TextBase.XS style={styles.textAlignRight}>
        {formatCurrency(item.unit_price, true)}
      </TextBase.XS>
    ),
    width: '15%'
  },
  {
    title: 'Jumlah',
    render: item => (
      <TextBase.XS style={styles.textAlignRight}>
        {formatCurrency(item.purchase_price, true)}
      </TextBase.XS>
    ),
    width: '18%'
  }
];

const InvoiceDetailScreen: React.FC<InvoiceDetailScreenProps> = (
  props: InvoiceDetailScreenProps
) => {
  const { route } = props;

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getInvoiceDetail(route.params.invoiceNumber),
    queryKey: [QUERY_KEY.GET_INVOICE_DETAIL],
    refetchInterval: 600000
  });

  const renderBottomInformation = () => {
    if (!data) return;

    const {
      fee_price,
      fee_value,
      tax_price,
      tax_value,
      purchase_price_accum,
      bucket_quantity,
      repayment_list
    } = data.data.data;

    const receivedValue = () => {
      const accumInvoiceRepayment = repayment_list?.reduce(
        (prev, curr) => prev + curr.value,
        0
      );

      return (
        (purchase_price_accum || 0) -
        (tax_price || 0) -
        (fee_price || 0) -
        (accumInvoiceRepayment || 0)
      );
    };

    return (
      <>
        <View style={styles.bottomRowContainer}>
          <TextBase.XS style={styles.bottomRowTitle}>Potongan</TextBase.XS>
          <TextBase.XS style={styles.bottomRowMiddle}>{`${formatCurrency(
            fee_value,
            true
          )} x ${bucket_quantity}`}</TextBase.XS>
          <TextBase.XS style={styles.bottomRowValue}>
            {formatCurrency(fee_price, true)}
          </TextBase.XS>
        </View>
        <View style={styles.bottomRowContainer}>
          <TextBase.XS style={styles.bottomRowTitle}>Titipan (%)</TextBase.XS>
          <TextBase.XS style={styles.bottomRowValue}>{`${tax_value?.toFixed(
            2
          )} % x ${formatCurrency(purchase_price_accum, true)}`}</TextBase.XS>
          <TextBase.XS style={styles.bottomRowValue}>
            {formatCurrency(tax_price, true)}
          </TextBase.XS>
        </View>
        <View style={styles.repaymentContainer}>
          <TextBase.XS style={styles.bottomRowTitle}>
            Potongan Pinjaman
          </TextBase.XS>
          {repayment_list?.map(e => (
            <View style={flexiStyle.flexRow}>
              <TextBase.XS style={styles.repaymentLoanCode}>
                - {e.loan_code}
              </TextBase.XS>
              <TextBase.XS style={styles.bottomRowValue}>
                {e.reference_name}
              </TextBase.XS>
              <TextBase.XS style={styles.bottomRowValue}>
                {formatCurrency(e.value, true)}
              </TextBase.XS>
            </View>
          ))}
        </View>
        <View style={styles.horizontalLine} />
        <View style={styles.bottomRowContainer}>
          <TextBase.XS style={styles.bottomRowTitle}>
            Jumlah Diterima
          </TextBase.XS>
          <TextBase.XS style={styles.receivedValue}>
            {formatCurrency(receivedValue(), true)}
          </TextBase.XS>
        </View>
      </>
    );
  };

  return (
    <Base headerTitle={'Invoice Detail'} noScroll>
      <View style={styles.headerContainer}>
        <View>
          {headerDetail(data?.data.data).map(e => (
            <View style={flexiStyle.flexRow}>
              <View style={styles.headerRow}>
                <TextBase.S>{e.title}</TextBase.S>
                <TextBase.S>:</TextBase.S>
              </View>
              <TextBase.S>{e.value}</TextBase.S>
            </View>
          ))}
        </View>
        <BaseTable
          useNum
          columns={columns}
          data={data?.data.data.bucket_list}
          isLoading={isFetching}
          refreshing={isFetching}
          onRefresh={refetch}
          fontSize={fontSizeEnum.XS}
          renderFooter={
            <View style={styles.tableFooterContainer}>
              <View style={styles.totalSpan}>
                <TextBase.XS style={styles.totalText}>Total</TextBase.XS>
              </View>
              <View style={styles.totalValueWrapper}>
                <View style={styles.totalValueContainer}>
                  <TextBase.XS style={styles.totalValueText}>
                    {formatCurrency(data?.data.data.purchase_price_accum, true)}
                  </TextBase.XS>
                </View>
              </View>
            </View>
          }
        />
        {renderBottomInformation()}
      </View>
    </Base>
  );
};

export default InvoiceDetailScreen;
