import { TouchableOpacity } from 'react-native';
import React from 'react';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Colors from '@sentadell-src/config/Colors';
import styles from './PageNumberButton.styles';
import { fwStyle } from '@sentadell-src/utils/moderateStyles';

interface PageNumberButtonProps {
  page: number;
  selected: boolean;
  onPress: () => void;
}

const PageNumberButton: React.FC<PageNumberButtonProps> = (
  props: PageNumberButtonProps
) => {
  const { page, selected, onPress } = props;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[
        styles.container,
        {
          backgroundColor: selected
            ? Colors.base.oxfordBlue
            : Colors.base.fullWhite
        }
      ]}
      onPress={onPress}>
      <TextBase.L
        style={[
          fwStyle[600],
          { color: selected ? Colors.text.fullWhite : Colors.text.fullBlack }
        ]}>
        {page}
      </TextBase.L>
    </TouchableOpacity>
  );
};

export default PageNumberButton;
