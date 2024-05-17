import {
  View,
  Animated,
  PanResponder,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { screenHeight } from '@sentadell-src/config/Sizes';
import styles from './BottomSheetModal.styles';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import { LOG } from '@sentadell-src/utils/commons';

interface BottomSheetModal {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  dragable?: boolean;
  isMasked?: boolean;
  maskCloseArea?: boolean;
  customStyle?: {
    contentStyle?: ViewStyle;
    panGestureStyle?: ViewStyle;
    maskStyle?: ViewStyle;
  };
  customSize?: {
    minH?: number;
    maxH?: number;
  };
}

const BottomSheetModal = (props: BottomSheetModal) => {
  const {
    visible,
    children,
    onClose,
    dragable,
    isMasked = true,
    maskCloseArea,
    customStyle,
    customSize
  } = props;

  const [heightView, setHeightView] = useState(0);

  const minHeightBottomSheet = screenHeight * 0.2;
  const maxHeightBottomSheet = screenHeight * 0.9;
  const panMask = useRef(new Animated.ValueXY()).current;
  const { maxH, minH } = customSize || {};

  const enhancedOnClose = () => {
    LOG.warn('Back from scanner page');
    if (onClose) {
      return onClose();
    }

    return null;
  };

  const panResponder = useCallback(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
          if (gestureState.dy > 0) {
            Animated.event([null, { dy: panMask.y }], {
              useNativeDriver: false
            })(event, gestureState);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > heightView / 2) {
            enhancedOnClose();
          } else {
            Animated.spring(panMask, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false
            });
          }
        }
      }),
    [onClose, heightView, panMask]
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={enhancedOnClose}>
      <KeyboardAvoidingView
        enabled
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={isMasked ? styles.rootMask : styles.root}>
        <TouchableOpacity
          style={[flexiStyle.flex1, customStyle?.maskStyle]}
          activeOpacity={1}
          onPress={() => {
            maskCloseArea ? enhancedOnClose() : null;
          }}
        />
        <Animated.View
          onLayout={event => {
            const { height } = event.nativeEvent.layout;

            setHeightView(height);
          }}
          style={[
            styles.container,
            customStyle?.contentStyle,
            {
              minHeight: minH ?? minHeightBottomSheet,
              maxHeight: maxH ?? maxHeightBottomSheet,
              transform: panMask.getTranslateTransform()
            }
          ]}>
          {dragable && (
            <Animated.View
              style={[styles.panGesture, customStyle?.panGestureStyle]}
              {...panResponder().panHandlers}>
              <View style={styles.gap} />
            </Animated.View>
          )}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BottomSheetModal;
