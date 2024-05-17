import {
  View,
  TextStyle,
  ViewStyle,
  Pressable,
  TextInput,
  TextInputProps
} from 'react-native';
import React, {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle
} from 'react';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import Colors from '@sentadell-src/config/Colors';
import styles from './Input.styles';
import {} from 'react-native-gesture-handler';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { EyeOffSvg, EyeSvg, Xicon } from '@sentadell-src/config/Svgs';

export type SentadelInputBaseProps = {
  label?: string;
  outlined?: boolean;
  inputProps?: TextInputProps;
  errorMessage?: string;
  customStyle?: {
    container?: ViewStyle | TextStyle | ViewStyle[] | TextStyle[];
    inputContainer?: ViewStyle | TextStyle;
    input?: ViewStyle | TextStyle;
  };
};

interface SentadelInputPropsWithSecurePassword extends SentadelInputBaseProps {
  isPassword?: true;
  clearText?: false;
}

interface SentadelInputPropsWithClearText extends SentadelInputBaseProps {
  isPassword?: false;
  clearText?: true;
  onClearText?: () => void;
}

export type SentadelInputProps =
  | SentadelInputPropsWithSecurePassword
  | SentadelInputPropsWithClearText;

const Input = forwardRef<TextInput, SentadelInputProps>((props, ref?) => {
  const {
    label,
    isPassword,
    clearText,
    outlined,
    errorMessage,
    customStyle,
    inputProps
  } = props;

  const innerRef = useRef<TextInput>(null);

  const [isSecure, setSecure] = useState<boolean>(true);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useImperativeHandle(ref, () => innerRef.current!, []);

  const outlinedErrorColor = errorMessage
    ? Colors.border.dangerWarn
    : Colors.border.purpleOcean;

  const renderLabel = () => {
    if (label) return <TextBase.S>{label}</TextBase.S>;

    return null;
  };

  const renderTrailing = () => {
    if (isPassword)
      return (
        <Pressable
          onPress={() => setSecure(state => !state)}
          style={styles.secureButton}>
          {!isSecure ? (
            <EyeSvg color={Colors.base.fullBlack} height={16} />
          ) : (
            <EyeOffSvg color={Colors.base.fullBlack} height={16} />
          )}
        </Pressable>
      );

    if (clearText)
      return (
        <Pressable
          onPress={() => {
            innerRef.current?.clear();
            if (props.onClearText) props.onClearText();
          }}
          style={styles.secureButton}>
          {inputProps?.value && (
            <Xicon color={Colors.base.fullBlack} height={16} />
          )}
        </Pressable>
      );
  };

  const renderValidationMessage = () => {
    if (errorMessage)
      return (
        <TextBase.XS style={styles.errMessageText}>{errorMessage}</TextBase.XS>
      );

    return null;
  };

  const renderInput = () => {
    return (
      <View style={[flexiStyle.flex1]}>
        <View
          style={[
            outlined
              ? { ...styles.outlinedContainer, borderColor: outlinedErrorColor }
              : styles.inputContainer,
            inputProps?.editable === false ? styles.disabledContainer : {},
            customStyle?.inputContainer,
            flexiStyle.flexRow
          ]}>
          <TextInput
            ref={innerRef}
            style={[
              { color: Colors.text.black },
              styles.input,
              customStyle?.input
            ]}
            placeholderTextColor={Colors.text.grayD9}
            multiline={!!inputProps?.numberOfLines}
            secureTextEntry={isPassword && isSecure}
            importantForAutofill="yes"
            {...inputProps}
          />
          {renderTrailing()}
        </View>
        {renderValidationMessage()}
      </View>
    );
  };

  if (isPassword)
    return (
      <View style={customStyle?.container}>
        {renderLabel()}
        <View style={styles.rowContainer}>{renderInput()}</View>
      </View>
    );

  return (
    <View style={customStyle?.container}>
      {renderLabel()}
      <View style={styles.rowContainer}>{renderInput()}</View>
    </View>
  );
});

export default Input;
