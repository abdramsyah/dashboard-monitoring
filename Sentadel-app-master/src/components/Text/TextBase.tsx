import { Text, TextProps, TextStyle } from 'react-native';
import React from 'react';
import Colors from '@sentadell-src/config/Colors';

export interface TextBaseProps extends TextProps {
  children: React.ReactNode;
  style?: Omit<TextStyle, 'fontSize'> | Omit<TextStyle, 'fontSize'>[];
}

export enum fontSizeEnum {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL'
}

const fontSizes: { [K in fontSizeEnum]: number } = {
  [fontSizeEnum.XS]: 12,
  [fontSizeEnum.S]: 14,
  [fontSizeEnum.M]: 16,
  [fontSizeEnum.L]: 18,
  [fontSizeEnum.XL]: 20,
  [fontSizeEnum.XXL]: 22,
  [fontSizeEnum.XXXL]: 24
};

const customText = (fontSize: number) => (props: TextBaseProps) => {
  const { children, style } = props;

  return (
    <Text
      style={[
        { fontSize },
        { color: Colors.text.black },
        style
        // { color: style?.color || Colors.text.fullBlack }
      ]}>
      {children}
    </Text>
  );
};

type textBaseType = {
  [K in fontSizeEnum]: (props: TextBaseProps) => React.ReactNode;
};

const TextBase: textBaseType = {
  [fontSizeEnum.XS]: customText(fontSizes[fontSizeEnum.XS]),
  [fontSizeEnum.S]: customText(fontSizes[fontSizeEnum.S]),
  [fontSizeEnum.M]: customText(fontSizes[fontSizeEnum.M]),
  [fontSizeEnum.L]: customText(fontSizes[fontSizeEnum.L]),
  [fontSizeEnum.XL]: customText(fontSizes[fontSizeEnum.XL]),
  [fontSizeEnum.XXL]: customText(fontSizes[fontSizeEnum.XXL]),
  [fontSizeEnum.XXXL]: customText(fontSizes[fontSizeEnum.XXXL])
};

export default TextBase;
