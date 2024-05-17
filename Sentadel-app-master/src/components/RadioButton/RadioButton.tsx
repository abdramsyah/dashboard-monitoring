import { View } from 'react-native';
import React from 'react';
import styles from './RadioButton.styles';
import { alignStyle } from '@sentadell-src/utils/moderateStyles';

type RadioButtonProps = {
  selected: boolean;
  outerRadioSize?: number;
  innerRadioSize?: number;
};

const RadioButton: React.FC<RadioButtonProps> = (props: RadioButtonProps) => {
  const { selected, outerRadioSize = 26, innerRadioSize = 14 } = props;

  return (
    <View
      style={[
        styles(outerRadioSize, innerRadioSize).outerContainer,
        alignStyle.allCenter
      ]}>
      {selected && (
        <View style={styles(outerRadioSize, innerRadioSize).innerContainer} />
      )}
    </View>
  );
};

export default RadioButton;
