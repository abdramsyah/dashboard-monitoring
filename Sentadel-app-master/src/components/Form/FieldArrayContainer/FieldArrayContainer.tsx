import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { PlusIcon } from '@sentadell-src/config/Svgs';
import styles from './FieldArrayContainer.styles';
import Colors from '@sentadell-src/config/Colors';
import { widthStyle } from '@sentadell-src/utils/moderateStyles';

interface FieldArrayContainerProps {
  title?: string;
  children: React.ReactNode;
  onPressAdd: () => void;
  disabled?: boolean;
}

const FieldArrayContainer: React.FC<FieldArrayContainerProps> = (
  props: FieldArrayContainerProps
) => {
  const { title, children, onPressAdd, disabled } = props;

  return (
    <View style={widthStyle.width100}>
      <View style={styles.headerContainer}>
        {title && <TextBase.L style={styles.headerTitle}>{title}</TextBase.L>}
        <TouchableOpacity
          style={styles.plusButton}
          disabled={disabled}
          onPress={onPressAdd}>
          <PlusIcon stroke={Colors.base.fullWhite} height={20} width={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.horizontalLine} />
      <View style={styles.formContainer}>{children}</View>
    </View>
  );
};

export default FieldArrayContainer;
