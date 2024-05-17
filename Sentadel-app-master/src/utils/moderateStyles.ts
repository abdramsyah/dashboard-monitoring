import { TextStyle, ViewStyle } from 'react-native';

export type AlignType =
  | 'startCenter'
  | 'endCenter'
  | 'centerStart'
  | 'allCenter'
  | 'centerEnd'
  | 'allEnd'
  | 'centerBetween'
  | 'centerAround'
  | 'centerEvenly'
  | 'betweenCenter'
  | 'aroundCenter'
  | 'startBetween'
  | 'endBetween';

export const alignStyle: Record<AlignType, ViewStyle> = {
  startCenter: {
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  endCenter: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  centerStart: {
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  centerEnd: {
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  allCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  allEnd: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  centerBetween: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  centerAround: {
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  centerEvenly: {
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  betweenCenter: {
    alignContent: 'space-between',
    justifyContent: 'center'
  },
  aroundCenter: {
    alignContent: 'space-around',
    justifyContent: 'center'
  },
  startBetween: {
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  endBetween: {
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  }
};

export type PaddingType =
  | 'ph5'
  | 'ph10'
  | 'ph15'
  | 'ph20'
  | 'ph25'
  | 'ph30'
  | 'pv5'
  | 'pv10'
  | 'pv15'
  | 'pv20'
  | 'pv25'
  | 'pv30'
  | 'pt5'
  | 'pt10'
  | 'pt15'
  | 'pt20'
  | 'pt25'
  | 'pt30'
  | 'pb5'
  | 'pb10'
  | 'pb15'
  | 'pb20'
  | 'pb25'
  | 'pb30'
  | 'pl5'
  | 'pl10'
  | 'pl15'
  | 'pl20'
  | 'pl25'
  | 'pl30'
  | 'pr5'
  | 'pr10'
  | 'pr15'
  | 'pr20'
  | 'pr25'
  | 'pr30'
  | 'p5'
  | 'p10'
  | 'p15'
  | 'p20'
  | 'p25'
  | 'p30';

export const paddingStyle: Record<PaddingType, ViewStyle> = {
  ph5: { paddingHorizontal: 5 },
  ph10: { paddingHorizontal: 10 },
  ph15: { paddingHorizontal: 15 },
  ph20: { paddingHorizontal: 20 },
  ph25: { paddingHorizontal: 25 },
  ph30: { paddingHorizontal: 30 },
  pv5: { paddingVertical: 5 },
  pv10: { paddingVertical: 10 },
  pv15: { paddingVertical: 15 },
  pv20: { paddingVertical: 20 },
  pv25: { paddingVertical: 25 },
  pv30: { paddingVertical: 30 },
  pt5: { paddingTop: 5 },
  pt10: { paddingTop: 10 },
  pt15: { paddingTop: 15 },
  pt20: { paddingTop: 20 },
  pt25: { paddingTop: 25 },
  pt30: { paddingTop: 30 },
  pb5: { paddingBottom: 5 },
  pb10: { paddingBottom: 10 },
  pb15: { paddingBottom: 15 },
  pb20: { paddingBottom: 20 },
  pb25: { paddingBottom: 25 },
  pb30: { paddingBottom: 30 },
  pl5: { paddingLeft: 5 },
  pl10: { paddingLeft: 10 },
  pl15: { paddingLeft: 15 },
  pl20: { paddingLeft: 20 },
  pl25: { paddingLeft: 25 },
  pl30: { paddingLeft: 30 },
  pr5: { paddingRight: 5 },
  pr10: { paddingRight: 10 },
  pr15: { paddingRight: 15 },
  pr20: { paddingRight: 20 },
  pr25: { paddingRight: 25 },
  pr30: { paddingRight: 30 },
  p5: { padding: 5 },
  p10: { padding: 10 },
  p15: { padding: 15 },
  p20: { padding: 20 },
  p25: { padding: 25 },
  p30: { padding: 30 }
};

export type MarginType =
  | 'mh5'
  | 'mh10'
  | 'mh15'
  | 'mh20'
  | 'mh25'
  | 'mh30'
  | 'mt5'
  | 'mt10'
  | 'mt15'
  | 'mt20'
  | 'mt25'
  | 'mt30'
  | 'mb5'
  | 'mb10'
  | 'mb15'
  | 'mb20'
  | 'mb25'
  | 'mb30'
  | 'mv5'
  | 'mv10'
  | 'mv15'
  | 'mv20'
  | 'mv25'
  | 'mv30'
  | 'mr5'
  | 'mr10'
  | 'mr15'
  | 'mr20'
  | 'mr25'
  | 'mr30'
  | 'ml5'
  | 'ml10'
  | 'ml15'
  | 'ml20'
  | 'ml25'
  | 'ml30'
  | 'm5'
  | 'm10'
  | 'm15'
  | 'm20'
  | 'm25'
  | 'm30';

export const marginStyle: Record<MarginType, ViewStyle> = {
  mh5: { marginHorizontal: 5 },
  mh10: { marginHorizontal: 10 },
  mh15: { marginHorizontal: 15 },
  mh20: { marginHorizontal: 20 },
  mh25: { marginHorizontal: 25 },
  mh30: { marginHorizontal: 30 },
  mt5: { marginTop: 5 },
  mt10: { marginTop: 10 },
  mt15: { marginTop: 15 },
  mt20: { marginTop: 20 },
  mt25: { marginTop: 25 },
  mt30: { marginTop: 30 },
  mb5: { marginBottom: 5 },
  mb10: { marginBottom: 10 },
  mb15: { marginBottom: 15 },
  mb20: { marginBottom: 20 },
  mb25: { marginBottom: 25 },
  mb30: { marginBottom: 30 },
  mv5: { marginVertical: 5 },
  mv10: { marginVertical: 10 },
  mv15: { marginVertical: 15 },
  mv20: { marginVertical: 20 },
  mv25: { marginVertical: 25 },
  mv30: { marginVertical: 30 },
  mr5: { marginRight: 5 },
  mr10: { marginRight: 10 },
  mr15: { marginRight: 15 },
  mr20: { marginRight: 20 },
  mr25: { marginRight: 25 },
  mr30: { marginRight: 30 },
  ml5: { marginLeft: 5 },
  ml10: { marginLeft: 10 },
  ml15: { marginLeft: 15 },
  ml20: { marginLeft: 20 },
  ml25: { marginLeft: 25 },
  ml30: { marginLeft: 30 },
  m5: { margin: 5 },
  m10: { margin: 10 },
  m15: { margin: 15 },
  m20: { margin: 20 },
  m25: { margin: 25 },
  m30: { margin: 30 }
};

export type FlexiType =
  | 'flex1'
  | 'flex2'
  | 'flex3'
  | 'flexRow'
  | 'flexGrow1'
  | 'flexRow1'
  | 'flexRowG1'
  | 'flexRowG2'
  | 'flexWrap';

const multiplier = 8;

export const flexiStyle: Record<FlexiType, ViewStyle> = {
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  flexRow: { flexDirection: 'row' },
  flexRowG1: { flexDirection: 'row', gap: multiplier },
  flexRowG2: { flexDirection: 'row', gap: multiplier * 1 },
  flexGrow1: { flexGrow: 1 },
  flexRow1: { flex: 1, flexDirection: 'row' },
  flexWrap: { flex: 1, flexWrap: 'wrap' }
};

export type FontWeightType = '900' | '800' | '700' | '600' | '500' | '400';

export const fwStyle: Record<FontWeightType, TextStyle> = {
  '900': { fontWeight: '900' },
  '800': { fontWeight: '800' },
  '700': { fontWeight: '700' },
  '600': { fontWeight: '600' },
  '500': { fontWeight: '500' },
  '400': { fontWeight: '400' }
};

export type WidthType =
  | 'width100'
  | 'width90'
  | 'width80'
  | 'width70'
  | 'width60'
  | 'width50'
  | 'width40'
  | 'width30'
  | 'width20'
  | 'width10';

export const widthStyle: Record<WidthType, ViewStyle> = {
  width100: { width: '100%' },
  width90: { width: '90%' },
  width80: { width: '80%' },
  width70: { width: '70%' },
  width60: { width: '60%' },
  width50: { width: '50%' },
  width40: { width: '40%' },
  width30: { width: '30%' },
  width20: { width: '20%' },
  width10: { width: '10%' }
};
