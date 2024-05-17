import { createStackNavigator } from '@react-navigation/stack';
import { RootNavigationParams, routes } from './RootNavigationParams';
import LoginScreen from '@sentadell-src/screen/LoginScreen/Login.screen';
import SplashScreen from '@sentadell-src/screen/SplashScreen/Splash.screen';
import QueueRequestTableScreen from '@sentadell-src/screen/QueueRequestTable/QueueRequestTable.screen';
import { RoleEnum, ModuleEnum } from '@sentadell-src/types/auth';
import { LOG } from '@sentadell-src/utils/commons';
import { useMemo } from 'react';
import { QueueBar, ScanFrame } from '@sentadell-src/config/Svgs';
import { SvgProps } from 'react-native-svg';
import PourOutScanner from '@sentadell-src/screen/PourOutScanner/PourOutScanner.screen';
import OperationalGradingScreen from '@sentadell-src/screen/OperationalGrading/OperationalGrading.screen';
import OperationalPourOut from '@sentadell-src/screen/OperationalPourOut/OperationalPourOut.screen';
import QueueRequestFormScreen from '@sentadell-src/screen/QueueRequestForm/QueueRequestForm.screen';
import QueueRequestDetailScreen from '@sentadell-src/screen/QueueRequestDetail/QueueRequestDetail.screen';
import OperationalWeighScreen from '@sentadell-src/screen/OperationalWeigh/OperationalWeigh.screen';
import OperationalWeighScanScreen from '@sentadell-src/screen/OperationalWeighScan/OperationalWeighScan.screen';
import OperationalGradingScanScreen from '@sentadell-src/screen/OperationalGradingScan/OperationalGradingScan.screen';
import InvoiceListScreen from '@sentadell-src/screen/InvoiceList/InvoiceList.screen';
import InvoiceDetailScreen from '@sentadell-src/screen/InvoiceDetail/InvoiceDetail.screen';
import OperationalFetchQueueScreen from '@sentadell-src/screen/OperationalFetchQueue/OperationalFetchQueue.screen';
import OperationalGroupingScreen from '@sentadell-src/screen/OperationalGrouping/OperationalGrouping.screen';
import OperationalGroupingScanScreen from '@sentadell-src/screen/OperationalGroupingScan/OperationalGroupingScan.screen';
import OperationalGroupingDetailScreen from '@sentadell-src/screen/OperationalGroupingDetail/OperationalGroupingDetail.screen';
import OperationalShipmentScreen from '@sentadell-src/screen/OperationalShipment/OperationalShipment.screen';
import OperationalShipmentScanScreen from '@sentadell-src/screen/OperationalShipmentScan/OperationalShipmentScan.screen';
import OperationalShipmentDetailScreen from '@sentadell-src/screen/OperationalShipmentDetail/OperationalShipmentDetail.screen';

const Stack = createStackNavigator<RootNavigationParams>();

type roleNavigation = {
  route: routes;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  screen: React.FC<any>;
  icon?: React.FC<SvgProps>;
  isSideNav?: boolean;
};

export const drawerNavigationData: {
  [K in RoleEnum]?: { [M in ModuleEnum]?: roleNavigation[] };
} = {
  [RoleEnum.OPERATIONAL_ADMINISTRATOR]: {
    [ModuleEnum.POUR_OUT]: [
      {
        route: routes.OPERATIONAL_POUR_OUT,
        title: 'Numplek',
        screen: OperationalPourOut,
        icon: ScanFrame,
        isSideNav: true
      },
      {
        route: routes.OPERATIONAL_POUR_OUT_SCANNER,
        title: 'Numplek Scan',
        screen: PourOutScanner,
        icon: ScanFrame
      }
    ],
    [ModuleEnum.GRADING]: [
      {
        route: routes.OPERATIONAL_GRADING,
        title: 'Grading',
        screen: OperationalGradingScreen,
        icon: QueueBar,
        isSideNav: true
      },
      {
        route: routes.OPERATIONAL_GRADING_SCAN,
        title: 'Grading',
        screen: OperationalGradingScanScreen
        // icon: QueueBar,
      }
    ],
    [ModuleEnum.WEIGH]: [
      {
        route: routes.OPERATIONAL_WEIGH,
        title: 'Timbangan',
        screen: OperationalWeighScreen,
        icon: QueueBar,
        isSideNav: true
      },
      {
        route: routes.OPERATIONAL_WEIGH_SCAN,
        title: 'Timbangan Scan',
        screen: OperationalWeighScanScreen
      }
    ],
    [ModuleEnum.GROUPING]: [
      {
        route: routes.OPERATIONAL_GROUPING,
        title: 'Gulungan',
        screen: OperationalGroupingScreen,
        icon: QueueBar,
        isSideNav: true
      },
      {
        route: routes.OPERATIONAL_GROUPING_SCAN,
        title: 'Scan Gulungan',
        screen: OperationalGroupingScanScreen
      },
      {
        route: routes.OPERATIONAL_GROUPING_DETAIL,
        title: 'Detail Gulungan',
        screen: OperationalGroupingDetailScreen
      }
    ],
    [ModuleEnum.SHIPMENT]: [
      {
        route: routes.OPERATIONAL_SHIPMENT,
        title: 'Pengiriman',
        screen: OperationalShipmentScreen,
        icon: QueueBar,
        isSideNav: true
      },
      {
        route: routes.OPERATIONAL_SHIPMENT_SCAN,
        title: 'Pengiriman (Scan)',
        screen: OperationalShipmentScanScreen,
        icon: QueueBar
      },
      {
        route: routes.OPERATIONAL_SHIPMENT_DETAIL,
        title: 'Detail Pengiriman',
        screen: OperationalShipmentDetailScreen,
        icon: QueueBar
      }
    ]
  },
  [RoleEnum.COORDINATOR]: {
    [ModuleEnum.QUEUE_REQUEST]: [
      {
        route: routes.COORDINATOR_QUEUE_REQUEST_TABLE,
        title: 'Data Antrian',
        screen: QueueRequestTableScreen,
        icon: QueueBar,
        isSideNav: true
      },
      {
        route: routes.COORDINATOR_QUEUE_REQUEST_FORM,
        title: 'Tambahkan Barang Tani',
        screen: QueueRequestFormScreen,
        icon: QueueBar,
        isSideNav: true
      },
      {
        route: routes.COORDINATOR_QUEUE_REQUEST_DETAIL,
        title: 'Detail',
        screen: QueueRequestDetailScreen
      }
    ],
    [ModuleEnum.COORDINATOR_INVOICE]: [
      {
        route: routes.COORDINATOR_INVOICE_LIST,
        title: 'Invoice List',
        screen: InvoiceListScreen,
        icon: QueueBar,
        isSideNav: true
      },
      {
        route: routes.COORDINATOR_INVOICE_DETAIL,
        title: 'Invoice Detail',
        screen: InvoiceDetailScreen,
        icon: QueueBar
      }
    ]
  }
};

export const RootNavigation = () => {
  const roleNavigation = useMemo(() => {
    const dummy: roleNavigation[] = [];

    Object.values(drawerNavigationData).forEach(e =>
      Object.values(e).forEach(e1 => dummy.push(...e1))
    );

    return dummy;
  }, []);

  LOG.warn('RootNavigation - screen');

  return (
    <Stack.Navigator
      initialRouteName={routes.SPLASH_SCREEN}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name={routes.SPLASH_SCREEN} component={SplashScreen} />
      <Stack.Screen name={routes.LOGIN_SCREEN} component={LoginScreen} />
      <Stack.Screen
        name={routes.OPERATIONAL_FETCH_QUEUE}
        component={OperationalFetchQueueScreen}
      />
      {roleNavigation.map(e => (
        <Stack.Screen
          key={e.route}
          name={e.route}
          component={e.screen}
          initialParams={{ title: e.title }}
        />
      ))}
    </Stack.Navigator>
  );
};
