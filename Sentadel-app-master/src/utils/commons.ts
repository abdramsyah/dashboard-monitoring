import { dayName, monthName } from '@sentadell-src/constants/global';
import { store } from '@sentadell-src/database/reduxStore';
import { drawerNavigationData } from '@sentadell-src/navigation/RootNavigation';
import { setIsAuth } from '@sentadell-src/stores/rtk/actions/auth';
import {
  RoleEnum,
  DecodedTokenType,
  ModuleEnum
} from '@sentadell-src/types/auth';
import { configLoggerType, consoleTransport, logger } from 'react-native-logs';

const configLogger: configLoggerType = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  severity: 'debug',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: 'green',
      warn: 'yellow',
      error: 'redBright'
    }
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true
};

export const LOG = logger.createLogger(configLogger);

export const decodeToken = (token?: string | null) => {
  if (token) {
    const base64Url = token?.split('.')[1];
    const base64 = base64Url?.replace(/-/g, '+').replace(/_/g, '/');

    if (base64) {
      const base64ToString = Buffer.from(base64, 'base64').toString();

      return JSON.parse(base64ToString);
    }

    return;
  }
};

export const authChecker = (
  decodedTokenString: string,
  callback?: (isAuth: boolean, roles?: RoleEnum[]) => void
) => {
  if (decodedTokenString) {
    const decodedToken: DecodedTokenType = JSON.parse(decodedTokenString);

    const now = new Date().getTime();

    LOG.warn(`authChecker - ${now / 1000} > ${decodedToken.exp}`);

    if (now / 1000 > decodedToken.exp) {
      store.dispatch(setIsAuth(false));
      if (callback) callback(false);
    } else {
      store.dispatch(setIsAuth(true));
      if (callback)
        callback(
          true,
          decodedToken.rolesModules.map(roleM => roleM.role_name)
        );
    }
  } else {
    store.dispatch(setIsAuth(false));
    if (callback) callback(false);
  }
};

export const getInitialNavigation = (roles: RoleEnum[]) => {
  const availableRole = roles.findIndex(e => drawerNavigationData[e]);

  const navData = drawerNavigationData[roles[availableRole]];

  if (navData) {
    const moduleKeys = Object.keys(navData) as ModuleEnum[];
    const routes = navData[moduleKeys[0]];

    if (routes?.length) return routes[0].route;

    return;
  }

  return;
};

type caseType =
  | 'original'
  | 'camel'
  | 'snake'
  | 'kebab'
  | 'pascal'
  | 'first-uppercase'
  | 'first-word-uppercase';

export const caseConverter = (val: string, to: caseType, from?: caseType) => {
  if (!val) return;

  let fromVal = val;

  if (from) {
    // transform to original
    switch (from) {
      case 'camel':
        fromVal = fromVal.replace(/([a-z])([A-Z])/g, '$1 $2');
        break;

      case 'kebab':
        fromVal = fromVal.toLowerCase().split('-').join(' ');
        break;

      case 'pascal':
        fromVal = fromVal
          // Look for long acronyms and filter out the last letter
          .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
          // Look for lower-case letters followed by upper-case letters
          .replace(/([a-z\d])([A-Z])/g, '$1 $2')
          // Look for lower-case letters followed by numbers
          .replace(/([a-zA-Z])(\d)/g, '$1 $2')
          .replace(/^./, function (str) {
            return str.toUpperCase();
          })
          // Remove any white space left around the word
          .trim();
        break;

      case 'snake':
        fromVal = fromVal.toLowerCase().split('_').join(' ');
        break;

      default:
        break;
    }
  }

  let toVal = '';
  const lowerFromVal = fromVal.toLowerCase();

  switch (to) {
    case 'camel':
      toVal = lowerFromVal
        .split(' ')
        .map((e, i) => {
          if (i === 0) return e;

          if (e.length) return e.charAt(0).toUpperCase();

          return e.charAt(0).toUpperCase() + e.substring(1, e.length);
        })
        .join();

      break;

    case 'first-uppercase':
      toVal =
        lowerFromVal.charAt(0).toUpperCase() +
        lowerFromVal.substring(1, fromVal.length);

      break;

    case 'first-word-uppercase':
      toVal = lowerFromVal
        .split(' ')
        .map(e => {
          if (e.length) return e.charAt(0).toUpperCase();

          return e.charAt(0).toUpperCase() + e.substring(1, e.length);
        })
        .join(' ');

      break;

    case 'kebab':
      toVal = lowerFromVal.split(' ').join('-');

      break;

    case 'pascal':
      toVal = lowerFromVal
        .split(' ')
        .map(e => {
          if (e.length) return e.charAt(0).toUpperCase();

          return e.charAt(0).toUpperCase() + e.substring(1, e.length);
        })
        .join();

      break;

    case 'snake':
      toVal = lowerFromVal
        .split(' ')
        .map(e => {
          if (e.length) return e.charAt(0).toUpperCase();

          return e.charAt(0).toUpperCase() + e.substring(1, e.length);
        })
        .join();

      break;

    case 'original':
      toVal = fromVal;

      break;

    default:
      break;
  }

  return toVal;
};

export const snakeToFirstCapital = (val: string, isReverse?: boolean) => {
  if (val) {
    if (isReverse) {
      const list = val.split(' ');
      const newList = list.map(e => e.toUpperCase());

      return newList.join('_');
    } else {
      const list = val.split('_');
      const newList = list.map(
        e => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()
      );

      return newList.join(' ');
    }
  }

  return '';
};

export const getInitialName = (name?: string) => {
  if (name) {
    return name
      .split(' ')
      .map(e => e[0])
      .join('')
      .toUpperCase();
  }

  return '/NA/';
};

export const formatCurrency = (amount?: number, withoutPrevix?: boolean) => {
  if (!amount) return;
  if (withoutPrevix) return Intl.NumberFormat('id-ID').format(amount);

  let currencyReplaced = false;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    // currencyDisplay: 'code',
    minimumFractionDigits: 0
  })
    .formatToParts(amount)
    .map((item, idx, arr) => {
      if (
        (item.type === 'currency' || item.type === 'literal') &&
        currencyReplaced
      )
        return '';

      const nextCurrency =
        arr[idx + 1] && arr[idx + 1].type === 'currency' && arr[idx + 1].value;

      if (item.type === 'minusSign' && nextCurrency && !currencyReplaced) {
        currencyReplaced = true;
        return `${nextCurrency} ${item.value}`;
      }
      return `${item.value}`;
    })
    .join('');
};

export const formatDateTime = (dt: string) => {
  if (!dt) return '';

  const newDateClass = new Date(dt);
  const ms = newDateClass.getTime();
  const currDateClass = new Date(ms);
  const currDateLocale = currDateClass.getDate();
  const today = new Date();
  const currDate = () => {
    if (
      currDateClass.getMonth() === today.getMonth() &&
      currDateClass.getFullYear() === today.getFullYear()
    ) {
      if (currDateLocale === today.getDate()) return 'Hari ini';
      if (currDateLocale === today.getDate() - 1) return 'Kemarin';
    }
    return `${dayName[currDateClass.getDay()].substring(
      0,
      3
    )}, ${currDateClass.getDate()} ${monthName[
      currDateClass.getMonth()
    ].substring(0, 3)} ${currDateClass.getFullYear()}`;
  };
  const currTime = currDateClass
    .toLocaleTimeString()
    .split('.')
    .slice(0, 2)
    .join('.');

  return `${currDate()} ${currTime}`;
};

export const tcpOnReadDataFromScale = (
  buffer: Buffer | string,
  options?: {
    onSuccess: (gw: number) => void;
    onError: (err: unknown) => void;
  }
) => {
  try {
    const stringBuffer = buffer.toString('utf8');

    if (stringBuffer.charAt(1) !== '+')
      throw 'Pastikan indikator dimulai dari 0 sebelum diberikan beban';

    const weight = () => {
      const decimalDigit = parseInt(stringBuffer.charAt(8));

      if (isNaN(decimalDigit) && Number.isInteger(decimalDigit))
        throw 'Desimal point bukan integer,' + decimalDigit;

      const decimalStartPos = -(decimalDigit + 4);

      const decimalValue = stringBuffer.slice(decimalStartPos, 8);
      const integerValue = parseInt(stringBuffer.slice(2, 8 - decimalDigit));

      if (isNaN(integerValue) && Number.isInteger(integerValue))
        throw 'Nilai bukan integer,' + integerValue;

      const floatValue = parseFloat(`${integerValue}.${decimalValue}`);

      if (isNaN(floatValue) && !Number.isInteger(floatValue))
        throw 'Nilai bukan floating point,' + floatValue;

      // LOG.warn(
      //   `useGetScaleData - on data - stringBuffer -> ${stringBuffer} - decimalStartPos -> ${decimalStartPos} - decimalValue -> ${decimalValue} - integerValue -> ${integerValue} - floatValue -> ${floatValue}`
      // );

      return floatValue;
    };

    if (options?.onSuccess) options?.onSuccess(weight());
  } catch (err) {
    LOG.error('useGetScaleData - getData - error', err);
    if (options?.onError) options?.onError(err);
  }
};
