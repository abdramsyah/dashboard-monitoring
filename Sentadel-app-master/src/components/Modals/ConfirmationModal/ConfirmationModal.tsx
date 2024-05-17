import { View, Modal, Pressable } from 'react-native';
import React, { useState } from 'react';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Button from '@sentadell-src/components/Button/Button';
import styles from './ConfirmationModal.styles';

export interface ConfirmationModalProps {
  visible: boolean;
  onClose?: () => void;
  confirm?: string;
  onConfirm: () => void;
  cancel?: string;
  onCancel: () => void;
  title: string;
  subTitle?: string;
  cancelFocused?: boolean;
  children?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  width?: number;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = (
  props: ConfirmationModalProps
) => {
  const {
    visible,
    onClose,
    confirm,
    onConfirm,
    cancel,
    onCancel,
    title,
    subTitle,
    cancelFocused,
    children,
    isLoading,
    disabled,
    width
  } = props;

  const renderChildren = () => {
    if (children) return children;

    return null;
  };

  const [isConfirmed, setConfirmed] = useState<boolean | null>(null);

  const enhancedOnConfirm = () => {
    if (onConfirm) {
      setConfirmed(true);
      onConfirm();
    }
  };

  const enhancedOnCancel = () => {
    if (onCancel) {
      setConfirmed(false);
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      hardwareAccelerated
      style={[{ width }]}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.upperContainer}>
          <TextBase.XL style={styles.titleText}>{title}</TextBase.XL>
          <TextBase.L>{subTitle}</TextBase.L>
          {renderChildren()}
          <View style={styles.buttonContainer}>
            <Button
              title={cancel || 'Kembali'}
              theme={cancelFocused ? 'solid-red' : 'outlined-red'}
              onPress={enhancedOnCancel}
              disabled={disabled || (isConfirmed !== null && isConfirmed)}
              isLoading={isConfirmed !== null && !isConfirmed && isLoading}
            />
            <Button
              title={confirm || 'Konfirmasi'}
              theme={cancelFocused ? 'outlined-red' : 'solid-blue'}
              onPress={enhancedOnConfirm}
              disabled={disabled || (isConfirmed !== null && !isConfirmed)}
              isLoading={isConfirmed !== null && isConfirmed && isLoading}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ConfirmationModal;
