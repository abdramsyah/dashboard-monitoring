import { View, Modal, Pressable, ViewStyle } from 'react-native';
import React from 'react';
import styles from './CenteredModal.styles';

export interface CenteredModalProps {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  customStyle?: {
    backdrop?: ViewStyle;
    container?: ViewStyle;
  };
}

const CenteredModal: React.FC<CenteredModalProps> = (
  props: CenteredModalProps
) => {
  const { visible, onClose, children, customStyle } = props;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      hardwareAccelerated
      transparent>
      <View style={styles.container}>
        <Pressable
          style={[styles.backdrop, customStyle?.backdrop]}
          onPress={onClose}
        />
        <View style={[styles.upperContainer, customStyle?.container]}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default CenteredModal;
