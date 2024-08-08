export const DUMMY_TENANT_NAME = 'DUMMY_TENANT_NAME';
export const DUMMY_VALUE = 'DUMMY_VALUE';
export const DUMMY_DASHBOARD_APP = 'DUMMY_DASHBOARD_APP';
export const MOCK_ID = 'MOCK_ID';

export const EMPTY_STRING = '';
export const DASHBOARD_APP = 'DASHBOARD';
export const DASHBOARD_AUTO_ASSIGN = 'DASHBOARD_AUTO_ASSIGN';
export const SYSTEM = 'SYSTEM';

export enum DATE_PRESET {
  PAST_YEAR = 'pastYear',
  PAST_6_MONTHS = 'pastSixMonths',
  PAST_3_MONTHS = 'pastThreeMonths',
  CUSTOM = 'custom'
}

export const toLookBackMonths: { [key: string]: number } = {
  [DATE_PRESET.PAST_3_MONTHS]: 3,
  [DATE_PRESET.PAST_6_MONTHS]: 6,
  [DATE_PRESET.PAST_YEAR]: 12
};

export enum RANKING {
  THREATS = 'threats',
  DEVICES = 'devices',
  ZONES = 'zones'
}

export const monthNumberToAlphabet: { [key: string]: string } = {
  '1': 'Jan',
  '2': 'Feb',
  '3': 'Mar',
  '4': 'Apr',
  '5': 'May',
  '6': 'Jun',
  '7': 'Jul',
  '8': 'Aug',
  '9': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec'
};
