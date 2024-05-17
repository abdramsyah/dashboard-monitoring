import { ReactNode } from 'react';
import {
  ActivityIndicator,
  ColorValue,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import styles from './Button.styles';
import TextBase from '../Text/TextBase';
import Colors from '@sentadell-src/config/Colors';

type buttonTheme = 'solid-blue' | 'solid-red' | 'outlined-red';

export type ButtonProps = {
  theme?: buttonTheme;
  onPress?: () => void;
  title?: string;
  customStyle?: {
    container?: ViewStyle | ViewStyle[];
    button?: ViewStyle | ViewStyle[];
    text?: TextStyle;
  };
  children?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
};

type colorThemeTHyme = {
  [K in buttonTheme]: {
    view: ViewStyle;
    text: TextStyle;
    loading: ColorValue;
  };
};

const Button = (props: ButtonProps) => {
  const { theme, onPress, title, customStyle, children, disabled, isLoading } =
    props;

  const customTheme: colorThemeTHyme = {
    'solid-blue': {
      view: disabled ? styles.solidDisabled : styles.solidBlue,
      text: disabled ? styles.textDisabled : styles.textSolid,
      loading: Colors.base.fullWhite
    },
    'solid-red': {
      view: disabled ? styles.solidDisabled : styles.solidRed,
      text: disabled ? styles.textDisabled : styles.textSolid,
      loading: Colors.base.fullWhite
    },
    'outlined-red': {
      view: disabled ? styles.outlinedDisabled : styles.outlinedRed,
      text: disabled ? styles.textDisabled : styles.textOutlineRed,
      loading: Colors.button.red
    }
  };

  const renderChild = () => {
    if (isLoading) return <ActivityIndicator color={Colors.base.fullWhite} />;

    if (children) return children;

    return (
      <TextBase.M
        style={{
          fontWeight: '600',
          ...customTheme[theme || 'solid-blue'].text,
          ...customStyle?.text
        }}>
        {title}
      </TextBase.M>
    );
  };

  return (
    <View style={customStyle?.container}>
      <TouchableOpacity
        style={[
          styles.base,
          customTheme[theme || 'solid-blue'].view,
          customStyle?.button
        ]}
        disabled={disabled || isLoading}
        onPress={onPress}>
        {renderChild()}
      </TouchableOpacity>
    </View>
  );
};

export default Button;
