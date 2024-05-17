import { View, TouchableOpacity, ViewStyle, FlatList } from 'react-native';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import TextBase from '../Text/TextBase';
import BottomSheetModal from '../Modals/BottomSheetModal/BottomSheetModal';
import { ChevronDown, Xicon } from '@sentadell-src/config/Svgs';
import Colors from '@sentadell-src/config/Colors';
import {
  alignStyle,
  flexiStyle,
  marginStyle
} from '@sentadell-src/utils/moderateStyles';
import { ActivityIndicator } from 'react-native-paper';
import RadioButton from '../RadioButton/RadioButton';
import styles from './Dropdown.styles';
import Input from '../Form/Input/Input';
import { showMessage } from 'react-native-flash-message';

export enum DropdownItemEnum {
  VALUE = 'value',
  LABEL = 'label',
  SELECTED = 'selected',
  DATA = 'data',
  ENUM = 'enum'
}

type onPressItemProps =
  | {
      item: DropdownItemProps;
      filteredMode: true;
      index?: null;
      disableToogle?: boolean;
    }
  | {
      item: DropdownItemProps;
      filteredMode?: false;
      index: number;
      disableToogle?: boolean;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DropdownItemProps<TEnum = string, TData = any> = {
  [DropdownItemEnum.VALUE]: string | number;
  [DropdownItemEnum.LABEL]: string;
  [DropdownItemEnum.SELECTED]: boolean;
  [DropdownItemEnum.DATA]?: TData;
  [DropdownItemEnum.ENUM]?: TEnum;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface dropdownBaseProps<TEnum = string, TData = any> {
  label: string;
  options: DropdownItemProps<TEnum, TData>[];
  title?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  errorMessage?: string;
  enableSearch?: boolean;
  // returnedKey?: DropdownItemEnum;
  onForceSelect?: () => void;
  onBlur?: () => void;
  dynamicOptions?: boolean;
}

interface DropdownSingleSelect extends dropdownBaseProps {
  isMultiple?: false;
  onChange: (item: DropdownItemProps) => void;
  forceSelect?: DropdownItemProps;
}

interface DropdownMultiSelect extends dropdownBaseProps {
  isMultiple: true;
  onChange: (item: DropdownItemProps[]) => void;
  forceSelect?: DropdownItemProps[];
}

export type DynamicDropdownProps = DropdownSingleSelect | DropdownMultiSelect;

export type DynamicDropdownRef = {
  focus: () => void;
  blur: () => void;
};

const Dropdown = React.forwardRef(function (
  props: DynamicDropdownProps,
  ref: React.ForwardedRef<DynamicDropdownRef>
) {
  const {
    isMultiple,
    title,
    label,
    options,
    onChange,
    containerStyle,
    disabled,
    loading,
    errorMessage,
    enableSearch,
    forceSelect,
    onForceSelect,
    onBlur,
    dynamicOptions
  } = props;

  const DropdownButton = useRef<TouchableOpacity>(null);
  const [visible, setVisible] = useState(false);
  const [selectOptions, setSelectOptions] = useState<DropdownItemProps[]>([]);
  const [searchText, setSearchText] = useState('');
  const [onSearch, setOnSearch] = useState(false);

  useImperativeHandle(
    ref,
    function getRefValue() {
      return {
        focus: () => toogleDropdown(true),
        blur: () => toogleDropdown(false)
      };
    },
    []
  );

  const toogleDropdown = (newState?: boolean) => {
    setOnSearch(false);
    setVisible(state => {
      if (!(newState || !state) && onBlur) onBlur();
      return newState || !state;
    });
  };

  const searchOptions = useMemo(() => {
    const searchCopy: DropdownItemProps<string>[] = JSON.parse(
      JSON.stringify([...selectOptions])
    );

    if (searchText) {
      return searchCopy.filter(e => {
        return (
          e[DropdownItemEnum.LABEL]
            .toString()
            .toLowerCase()
            .indexOf(searchText.toLowerCase()) > -1
        );
      });
    }

    setOnSearch(false);

    return [...searchCopy];
  }, [searchText]);

  const onPressItem = useCallback(
    ({ item, filteredMode, index, disableToogle }: onPressItemProps) => {
      try {
        if (isMultiple) {
          if (filteredMode) {
            const searchIndex = selectOptions.findIndex(
              select =>
                select[DropdownItemEnum.VALUE] === item[DropdownItemEnum.VALUE]
            );

            selectOptions[searchIndex][DropdownItemEnum.SELECTED] =
              !item[DropdownItemEnum.SELECTED];
          } else {
            selectOptions[index][DropdownItemEnum.SELECTED] =
              !item[DropdownItemEnum.SELECTED];
          }

          setSelectOptions([...selectOptions]);
          onChange(
            selectOptions.filter(select => select[DropdownItemEnum.SELECTED])
          );
        } else {
          const newData = selectOptions.map(option => ({
            ...option,
            selected: false
          }));

          if (filteredMode) {
            const searchIndex = selectOptions.findIndex(
              select =>
                select[DropdownItemEnum.VALUE] === item[DropdownItemEnum.VALUE]
            );

            newData[searchIndex][DropdownItemEnum.SELECTED] =
              !item[DropdownItemEnum.SELECTED];
          } else {
            newData[index][DropdownItemEnum.SELECTED] =
              !item[DropdownItemEnum.SELECTED];
          }

          setSelectOptions([...newData]);
          onChange(item);
          if (!disableToogle) {
            toogleDropdown();
          }
        }
      } catch (err) {
        showMessage({
          type: 'danger',
          message: 'Terjadi Kesalahan! ' + err
        });
      }
    },
    [isMultiple, selectOptions]
  );

  useEffect(() => {
    setSelectOptions([...options]);
  }, []);

  useEffect(() => {
    if (searchText) {
      setOnSearch(true);
    }
  }, [searchText]);

  useEffect(() => {
    if (dynamicOptions) setSelectOptions([...options]);
  }, [options]);

  useEffect(() => {
    if (isMultiple && forceSelect?.length) {
      forceSelect.forEach(item => {
        onPressItem({ item, filteredMode: true, disableToogle: true });
      });
      if (onForceSelect) onForceSelect();
    } else if (!isMultiple && forceSelect) {
      onPressItem({
        item: forceSelect,
        filteredMode: true,
        disableToogle: true
      });
      if (onForceSelect) onForceSelect();
    }
  }, [isMultiple, forceSelect, onForceSelect, onPressItem]);

  const renderTitle = () => {
    if (title) {
      return <TextBase.S>{title}</TextBase.S>;
    }

    return null;
  };

  const renderItem = ({
    item,
    index
  }: {
    item: DropdownItemProps;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        key={index.toString()}
        activeOpacity={0.7}
        style={[
          styles.item,
          index === 0 ? styles.firstItemBorder : styles.itemBorder
        ]}
        onPress={() => {
          if (onSearch) {
            onPressItem({ item, filteredMode: onSearch });
          } else {
            onPressItem({ item, index });
          }
        }}>
        <TextBase.M>{item[DropdownItemEnum.LABEL]}</TextBase.M>
        <RadioButton selected={item[DropdownItemEnum.SELECTED]} />
      </TouchableOpacity>
    );
  };

  const renderSearch = () => {
    if (enableSearch)
      return (
        <View
          style={{
            paddingHorizontal: 20,
            marginBottom: 20
          }}>
          <Input
            outlined
            inputProps={{
              // onFocus: () => setOnSearch(true),
              // onBlur: () => setOnSearch(false),
              onChangeText: setSearchText,
              placeholder: 'Pencarian'
            }}
          />
        </View>
      );

    return null;
  };

  const renderDropdown = () => (
    <BottomSheetModal
      visible={visible}
      customSize={{ minH: 300 }}
      onClose={toogleDropdown}
      maskCloseArea>
      <TouchableOpacity style={styles.xButton} onPress={() => toogleDropdown()}>
        <Xicon
          stroke={Colors.base.fullBlack}
          height={18}
          width={18}
          strokeWidth={3}
        />
      </TouchableOpacity>
      <View style={[alignStyle.allCenter, marginStyle.mv20]}>
        <TextBase.M style={styles.fw700}>Pilih {title}</TextBase.M>
      </View>
      {renderSearch()}
      <FlatList
        data={onSearch ? searchOptions : selectOptions}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={flexiStyle.flexGrow1}
      />
    </BottomSheetModal>
  );

  const renderDropdownLabel = () => {
    if (loading) return <ActivityIndicator size={'small'} />;

    const selected = selectOptions.filter(
      select => select[DropdownItemEnum.SELECTED]
    );

    if (selected.length)
      if (isMultiple) {
        return (
          <View style={styles.dropdownLabelListContainer}>
            {selected.map((e, idx) => (
              <View key={idx.toString()} style={styles.dropdownLabelContainer}>
                <TextBase.S>{e[DropdownItemEnum.LABEL]}</TextBase.S>
              </View>
            ))}
          </View>
        );
      } else {
        return (
          <View style={styles.dropdownLabelListContainer}>
            {selected.map((e, idx) => (
              <TextBase.S key={idx.toString()}>
                {e[DropdownItemEnum.LABEL]}
              </TextBase.S>
            ))}
          </View>
        );
      }

    return <TextBase.S>{label}</TextBase.S>;
  };

  const renderValidationMessage = () => {
    if (errorMessage)
      return (
        <TextBase.XS style={styles.errMessageText}>{errorMessage}</TextBase.XS>
      );

    return null;
  };

  return (
    <View style={containerStyle}>
      {renderTitle()}
      <TouchableOpacity
        ref={DropdownButton}
        style={[styles.dropdown, (loading || disabled) && styles.bgBlack10]}
        onPress={() => toogleDropdown()}
        disabled={disabled}>
        {renderDropdown()}
        {renderDropdownLabel()}
        <ChevronDown stroke={Colors.base.fullBlack} strokeWidth={3} />
      </TouchableOpacity>
      {renderValidationMessage()}
    </View>
  );
});

export default Dropdown;
