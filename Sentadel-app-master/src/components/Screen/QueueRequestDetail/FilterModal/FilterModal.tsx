import { View } from 'react-native';
import React, { useState } from 'react';
import Dropdown, {
  DropdownItemEnum,
  DropdownItemProps
} from '@sentadell-src/components/Dropdown/Dropdown';
import CenteredModal from '@sentadell-src/components/Modals/ModalCenter/CenteredModal';
import { groupByDetailList } from '@sentadell-src/constants/queue';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Button from '@sentadell-src/components/Button/Button';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import { GroupByQueueGroupDetailEnum } from '@sentadell-src/types/queue';
import styles from './FilterModal.styles';

type filterType = {
  group_by?: GroupByQueueGroupDetailEnum;
};

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (filter: filterType) => void;
  onReset: () => void;
}

const FilterModal: React.FC<FilterModalProps> = (props: FilterModalProps) => {
  const { visible, onClose, onSubmit, onReset } = props;

  const [optionsList, setOptionsList] = useState<{
    options1?: DropdownItemProps[];
  }>({
    options1: JSON.parse(JSON.stringify(groupByDetailList))
  });

  const [filter, setFilter] = useState<filterType>({});

  return (
    <CenteredModal
      visible={visible}
      customStyle={{ container: styles.container }}
      onClose={onClose}>
      <TextBase.L>Filter</TextBase.L>
      <View style={styles.bodyContainer}>
        <View style={styles.body}>
          <Dropdown
            isMultiple={false}
            title="Group By"
            label="Pilih Salah Satu"
            options={optionsList.options1 || []}
            onChange={val => {
              setFilter(state => ({
                ...state,
                group_by: val[
                  DropdownItemEnum.ENUM
                ] as GroupByQueueGroupDetailEnum
              }));
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
                setFilter({ group_by: GroupByQueueGroupDetailEnum.FARMER });
                setOptionsList({
                  options1: JSON.parse(JSON.stringify(groupByDetailList))
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
              onPress={() => {
                onSubmit(filter);
              }}
            />
          </View>
        </View>
      </View>
    </CenteredModal>
  );
};

export default FilterModal;
