import {
  View,
  ActivityIndicator,
  FlatList,
  ViewStyle,
  TextStyle,
  RefreshControl,
  StyleProp,
  ViewProps,
  TouchableOpacity,
  TouchableOpacityProps
} from 'react-native';
import React, { ReactElement, forwardRef, useCallback } from 'react';
import TextBase, { TextBaseProps, fontSizeEnum } from '../../Text/TextBase';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import Colors from '@sentadell-src/config/Colors';
import { MetaType } from '@sentadell-src/types/global';
import PageNumberButton from '../PageNumberButton/PageNumberButton';
import styles from './BaseTable.styles';

type ColumnBaseType = {
  title: string;
  width?: ViewStyle['width'];
};

interface ColumnWithRender<T> extends ColumnBaseType {
  key: keyof T;
  render?: undefined;
}

interface ColumnWithKey<T> extends ColumnBaseType {
  key?: undefined;
  render: (item: T) => React.ReactNode;
}

export type ColumnType<T> = ColumnWithRender<T> | ColumnWithKey<T>;

interface BaseTableProps<T> {
  data?: T[];
  columns?: ColumnType<T>[];
  isLoading?: boolean;
  useNum?: boolean;
  rowWrap?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  fontSize?: fontSizeEnum;
  pagination?: {
    meta?: MetaType;
    onPressPage: (page: number) => void;
  };
  renderFooter?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onPressItem?: (item: T, index: number) => void;
}

interface RenderTextProps extends TextBaseProps {
  fontSize?: fontSizeEnum;
}

const RenderText = (props: RenderTextProps) => {
  switch (props.fontSize) {
    case fontSizeEnum.XS:
      return <TextBase.XS {...props}>{props.children}</TextBase.XS>;

    case fontSizeEnum.M:
      return <TextBase.M {...props}>{props.children}</TextBase.M>;

    default:
      return <TextBase.S {...props}>{props.children}</TextBase.S>;
  }
};

interface RenderItemViewProps extends ViewProps {
  isPressable?: false;
  children?: React.ReactNode;
}

interface RenderItemTouchableProps extends TouchableOpacityProps {
  isPressable: true;
  children?: React.ReactNode;
}

type RenderItemContainerProps = RenderItemViewProps | RenderItemTouchableProps;

const RenderItemContainer = (props: RenderItemContainerProps) => {
  if (props.isPressable) {
    return <TouchableOpacity {...props}>{props.children}</TouchableOpacity>;
  }

  return <View {...props}>{props.children}</View>;
};

const RNTable = <T,>(
  props: BaseTableProps<T>,
  ref?: React.ForwardedRef<FlatList<T>>
) => {
  const {
    data,
    columns,
    isLoading,
    useNum,
    rowWrap,
    refreshing,
    onRefresh,
    fontSize,
    pagination,
    renderFooter,
    contentContainerStyle,
    onPressItem
  } = props;

  const getWidth = (width: TextStyle['width']) => {
    if (width) return { width };

    return flexiStyle.flex1;
  };

  const renderHeader = () => {
    return (
      <View
        style={[
          styles.headerContainer,
          rowWrap && flexiStyle.flexWrap,
          { backgroundColor: Colors.base.oxfordBlue }
        ]}>
        {useNum && (
          <RenderText
            fontSize={fontSize}
            key={'Num'}
            style={styles.headerNumCell}>
            No
          </RenderText>
        )}
        {columns?.map((e, i) => (
          <RenderText
            fontSize={fontSize}
            key={i.toString()}
            style={[getWidth(e.width), styles.headerCell]}>
            {e.title}
          </RenderText>
        ))}
      </View>
    );
  };

  const renderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const bandedRows =
        index % 2 !== 0 ? Colors.base.coolGrey11 : Colors.base.fullWhite;

      const renderNum = () => {
        if (useNum && !!pagination)
          return (
            <RenderText fontSize={fontSize} style={styles.contentNumCell}>
              {(pagination.meta?.limit || 0) *
                ((pagination.meta?.page || 1) - 1) +
                index +
                1}
            </RenderText>
          );

        return (
          <RenderText fontSize={fontSize} style={styles.contentNumCell}>
            {index + 1}
          </RenderText>
        );
      };

      const getRenderItemContainerProps: () => RenderItemContainerProps =
        () => {
          if (onPressItem)
            return {
              isPressable: !!onPressItem,
              onPress: () => onPressItem(item, index)
            };

          return { isPressable: false };
        };

      return (
        <RenderItemContainer
          {...getRenderItemContainerProps()}
          style={[
            styles.contentRowContainer,
            rowWrap && flexiStyle.flexWrap,
            { backgroundColor: bandedRows }
          ]}>
          {renderNum()}
          {columns?.map((e, i) => {
            if (e.render) {
              return (
                <View key={i.toString()} style={[getWidth(e.width)]}>
                  {e.render(item)}
                </View>
              );
            } else if (e.key) {
              const val = item[e.key] || '';

              if (typeof val === 'number' || typeof val === 'string')
                return (
                  <RenderText
                    fontSize={fontSize}
                    key={i.toString()}
                    style={[getWidth(e.width)]}>
                    {val || ''}
                  </RenderText>
                );

              return (
                <RenderText
                  fontSize={fontSize}
                  key={i.toString()}
                  style={[getWidth(e.width)]}>
                  Cant render array/object
                </RenderText>
              );
            }
          })}
        </RenderItemContainer>
      );
    },
    [columns, rowWrap, useNum, pagination?.meta]
  );

  const renderPagination = () => {
    if (!pagination) return [];
    if (!pagination.meta) return [];

    const dummy: React.ReactNode[] = [];

    for (let i = 1; i <= pagination.meta.pages; i++) {
      if (i >= pagination.meta.page - 3 && i <= pagination.meta.page + 3) {
        dummy.push(
          <PageNumberButton
            key={`page` + i}
            page={i}
            selected={pagination.meta.page === i}
            onPress={() => pagination.onPressPage(i)}
          />
        );
      } else if (i === pagination.meta.pages) {
        dummy.push(<TextBase.L>. . .</TextBase.L>);
        dummy.push(
          <PageNumberButton
            key={`page` + i}
            page={i}
            selected={pagination.meta.page === i}
            onPress={() => pagination.onPressPage(i)}
          />
        );
      } else if (i === 1) {
        dummy.push(
          <PageNumberButton
            key={`page` + i}
            page={i}
            selected={pagination.meta.page === i}
            onPress={() => pagination.onPressPage(i)}
          />
        );
        dummy.push(<TextBase.L>. . .</TextBase.L>);
      }
    }

    return dummy;
  };

  const renderBody = () => {
    if (isLoading)
      return (
        <ActivityIndicator size={'large'} color={Colors.base.blueOnProgress} />
      );

    return (
      <FlatList
        ref={ref}
        data={data}
        refreshControl={
          <RefreshControl
            enabled
            refreshing={refreshing || false}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={contentContainerStyle}
        ListFooterComponent={() => renderFooter}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
      />
    );
  };

  return (
    <View style={!!pagination ? flexiStyle.flex1 : null}>
      {renderHeader()}
      {renderBody()}
      {!!pagination && (
        <View style={styles.paginationContainer}>{renderPagination()}</View>
      )}
    </View>
  );
};

// export default BaseTable
const BaseTable = forwardRef(RNTable) as <T>(
  p: BaseTableProps<T> & { ref?: React.ForwardedRef<FlatList<T>> }
) => ReactElement;

export default BaseTable;
