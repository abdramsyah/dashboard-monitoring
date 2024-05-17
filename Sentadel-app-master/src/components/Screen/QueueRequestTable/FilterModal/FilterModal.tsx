import { View } from 'react-native';
import React, { useState } from 'react';
import Dropdown, {
  DropdownItemEnum,
  DropdownItemProps
} from '@sentadell-src/components/Dropdown/Dropdown';
import CenteredModal from '@sentadell-src/components/Modals/ModalCenter/CenteredModal';
import {
  productTypeList,
  queueStatusList
} from '@sentadell-src/constants/queue';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Button from '@sentadell-src/components/Button/Button';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import styles from './FilterModal.styles';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (filter: string[]) => void;
  onReset: () => void;
}

const FilterModal: React.FC<FilterModalProps> = (props: FilterModalProps) => {
  const { visible, onClose, onSubmit, onReset } = props;

  const [optionsList, setOptionsList] = useState<{
    options1?: DropdownItemProps[];
    options2?: DropdownItemProps[];
  }>({
    options1: JSON.parse(JSON.stringify(productTypeList)),
    options2: JSON.parse(JSON.stringify(queueStatusList))
  });

  const [filter, setFilter] = useState<{
    selected1?: string;
    selected2?: string;
  }>({});

  return (
    <CenteredModal
      visible={visible}
      customStyle={{
        container: styles.container
      }}
      onClose={onClose}>
      <TextBase.L>Filter</TextBase.L>
      <View style={styles.bodyContainer}>
        <View style={styles.body}>
          <Dropdown
            isMultiple
            title="Jenis Produk"
            label="Jenis Produk"
            options={optionsList.options1 || []}
            onChange={val => {
              setFilter(state => {
                if (val.length) {
                  state['selected1'] = `product_type:${val
                    .map(e => `${e[DropdownItemEnum.LABEL]}`)
                    .join(',')}`;
                } else {
                  delete state.selected1;
                }

                return { ...state };
              });
            }}
          />
          <Dropdown
            isMultiple
            title="Status"
            label="Status"
            options={optionsList.options2 || []}
            onChange={val => {
              setFilter(state => {
                if (val.length) {
                  state['selected2'] = `status:${val
                    .map(e => `${e[DropdownItemEnum.ENUM]}`)
                    .join(',')}`;
                } else {
                  delete state.selected2;
                }

                return { ...state };
              });
            }}
          />
          <View style={flexiStyle.flexRowG1}>
            <Button
              theme={'outlined-red'}
              title="Reset"
              customStyle={{
                container: flexiStyle.flex1
              }}
              onPress={() => {
                setFilter({});
                setOptionsList({
                  options1: JSON.parse(JSON.stringify(productTypeList)),
                  options2: JSON.parse(JSON.stringify(queueStatusList))
                });
                onReset();
              }}
            />
            <Button
              theme={'solid-blue'}
              title="Submit"
              customStyle={{
                container: flexiStyle.flex1
              }}
              onPress={() => onSubmit(Object.values(filter))}
            />
          </View>
        </View>
      </View>
    </CenteredModal>
  );
};

export default FilterModal;
