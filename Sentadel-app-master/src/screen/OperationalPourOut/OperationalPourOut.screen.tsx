import { TouchableOpacity, View } from 'react-native';
import React from 'react';
import Base from '@sentadell-src/components/Base/Base';
import styles from './OperationalPourOut.styles';
import { ScanFrame } from '@sentadell-src/config/Svgs';
import { RouteProp } from '@react-navigation/native';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import { StackNavigationProp } from '@react-navigation/stack';
import TextBase from '@sentadell-src/components/Text/TextBase';
import Colors from '@sentadell-src/config/Colors';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.OPERATIONAL_POUR_OUT
>;

type RoutesProps = RouteProp<RootNavigationParams, routes.OPERATIONAL_POUR_OUT>;

interface OperationalPourOutProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const OperationalPourOut: React.FC<OperationalPourOutProps> = (
  props: OperationalPourOutProps
) => {
  const { navigation, route } = props;

  return (
    <Base headerTitle={route.params?.title}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.scanModeCard}
          onPress={() => navigation.push(routes.OPERATIONAL_POUR_OUT_SCANNER)}>
          <ScanFrame height={100} width={100} fill={Colors.base.fullWhite} />
          <TextBase.L style={styles.scanModeTitle}>Mulai Scan</TextBase.L>
        </TouchableOpacity>
      </View>
    </Base>
  );
};

export default OperationalPourOut;
