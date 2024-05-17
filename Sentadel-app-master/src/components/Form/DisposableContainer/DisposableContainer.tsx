import { View, ViewStyle, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { TrashIcon } from '@sentadell-src/config/Svgs';
import Colors from '@sentadell-src/config/Colors';
import styles from './DisposableContainer.styles';
import RadioButton from '@sentadell-src/components/RadioButton/RadioButton';

interface DisposableContainerProps {
  id: string;
  index?: number;
  children: React.ReactNode;
  customStyle?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  onCheck?: (id: string, index: number) => void;
}

const DisposableContainer: React.FC<DisposableContainerProps> = (
  props: DisposableContainerProps
) => {
  const { id, index, children, customStyle, onPress, disabled, onCheck } =
    props;
  const [selected, setSelected] = useState(false);

  return (
    <View style={[styles.disposableContainer, customStyle]}>
      {typeof index !== 'undefined' && (
        <View style={styles.indexContainer}>
          {onCheck && (
            <TouchableOpacity
              style={styles.indexContainer2}
              onPress={() => {
                setSelected(state => !state);
                onCheck(id, index);
              }}>
              <RadioButton
                selected={selected}
                outerRadioSize={18}
                innerRadioSize={10}
              />
            </TouchableOpacity>
          )}
          <View style={styles.indexContainer2}>
            <TextBase.S style={styles.indexNumber}>{index + 1}</TextBase.S>
          </View>
        </View>
      )}
      <View style={styles.forms}>{children}</View>
      <View style={styles.indexContainer}>
        <TouchableOpacity
          style={styles.disposeButton}
          disabled={disabled}
          onPress={onPress}>
          <TrashIcon
            stroke={disabled ? Colors.button.disabled : Colors.button.red}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DisposableContainer;
