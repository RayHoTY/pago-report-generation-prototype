import { IPaginateOptions } from './../src/interfaces/api.interface';

const validThreat = {
  agent_version: '3.1.1001',
  auto_run: false,
  av_industry: null,
  cert_publisher: '',
  cert_issuer: '',
  cert_timestamp: '0001-01-01T00:00:00',
  classification: '',
  cylance_device_id: '03c40f35-bbab-4a57-93c9-32f2f476d4a4',
  cylance_score: -0.036,
  detected_by: 'Background Threat Detection',
  device_name: 'LCHDPLMPOB1',
  device_state: 'OnLine',
  file_name: 'ism_ora.exe',
  file_path: 'C:\\tmp\\ISM_DBMS_Oracle_Win_2.0.4.8\\ism_ora.exe',
  file_size: 87456,
  file_status: 'Quarantined',
  global_quarantined: false,
  safelisted: false,
  ip_addresses: ['165.244.95.207'],
  last_found: '2023-10-05T05:50:17',
  mac_addresses: ['00-50-56-B1-79-3D'],
  md5: '984F6F98C08864859E5772BE6945EE44',
  running: false,
  sha256: '88D8537772A70F5D473975FF151A16FCF18AB25C72FB57310E9A7DAB82904C14',
  signed: false,
  sub_classification: '',
  unique_to_cylance: false,
  tenantId: '140078f4-da05-47c8-ace0-7b1992c9b02f'
};

const threatInvalidFileSize = {
  agent_version: '3.1.1001',
  auto_run: false,
  av_industry: null,
  cert_publisher: '',
  cert_issuer: '',
  cert_timestamp: '0001-01-01T00:00:00',
  classification: '',
  cylance_device_id: '03c40f35-bbab-4a57-93c9-32f2f476d4a4',
  cylance_score: -0.036,
  detected_by: 'Background Threat Detection',
  device_name: 'LCHDPLMPOB1',
  device_state: 'OnLine',
  file_name: 'ism_ora.exe',
  file_path: 'C:\\tmp\\ISM_DBMS_Oracle_Win_2.0.4.8\\ism_ora.exe',
  file_size: 'apple',
  file_status: 'Quarantined',
  global_quarantined: false,
  safelisted: false,
  ip_addresses: ['165.244.95.207'],
  last_found: '2023-10-05T05:50:17',
  mac_addresses: ['00-50-56-B1-79-3D'],
  md5: '984F6F98C08864859E5772BE6945EE44',
  running: false,
  sha256: '88D8537772A70F5D473975FF151A16FCF18AB25C72FB57310E9A7DAB82904C14',
  signed: false,
  sub_classification: '',
  unique_to_cylance: false,
  tenantId: '140078f4-da05-47c8-ace0-7b1992c9b02f'
};

const threatInvalidSHA = {
  agent_version: '3.1.1001',
  auto_run: false,
  av_industry: null,
  cert_publisher: '',
  cert_issuer: '',
  cert_timestamp: '0001-01-01T00:00:00',
  classification: '',
  cylance_device_id: '03c40f35-bbab-4a57-93c9-32f2f476d4a4',
  cylance_score: -0.036,
  detected_by: 'Background Threat Detection',
  device_name: 'LCHDPLMPOB1',
  device_state: 'OnLine',
  file_name: 'ism_ora.exe',
  file_path: 'C:\\tmp\\ISM_DBMS_Oracle_Win_2.0.4.8\\ism_ora.exe',
  file_size: 87456,
  file_status: 'Quarantined',
  global_quarantined: false,
  safelisted: false,
  ip_addresses: ['165.244.95.207'],
  last_found: '2023-10-05T05:50:17',
  mac_addresses: ['00-50-56-B1-79-3D'],
  md5: '984F6F98C08864859E5772BE6945EE44',
  running: false,
  sha256: '88D8537772A70F5D4735FF151A16FCF18AB25C72FB57310E9A7DAB82904C14',
  signed: false,
  sub_classification: '',
  unique_to_cylance: false,
  tenantId: '140078f4-da05-47c8-ace0-7b1992c9b02f'
};

const threatInvalidMD5 = {
  agent_version: '3.1.1001',
  auto_run: false,
  av_industry: null,
  cert_publisher: '',
  cert_issuer: '',
  cert_timestamp: '0001-01-01T00:00:00',
  classification: '',
  cylance_device_id: '03c40f35-bbab-4a57-93c9-32f2f476d4a4',
  cylance_score: -0.036,
  detected_by: 'Background Threat Detection',
  device_name: 'LCHDPLMPOB1',
  device_state: 'OnLine',
  file_name: 'ism_ora.exe',
  file_path: 'C:\\tmp\\ISM_DBMS_Oracle_Win_2.0.4.8\\ism_ora.exe',
  file_size: 87456,
  file_status: 'Quarantined',
  global_quarantined: false,
  safelisted: false,
  ip_addresses: ['165.244.95.207'],
  last_found: '2023-10-05T05:50:17',
  mac_addresses: ['00-50-56-B1-79-3D'],
  md5: '984F6F98C08864859E5772BE694E44',
  running: false,
  sha256: '88D8537772A70F5D473975FF151A16FCF18AB25C72FB57310E9A7DAB82904C14',
  signed: false,
  sub_classification: '',
  unique_to_cylance: false,
  tenantId: '140078f4-da05-47c8-ace0-7b1992c9b02f'
};

const threatInvalidIP = {
  agent_version: '3.1.1001',
  auto_run: false,
  av_industry: null,
  cert_publisher: '',
  cert_issuer: '',
  cert_timestamp: '0001-01-01T00:00:00',
  classification: '',
  cylance_device_id: '03c40f35-bbab-4a57-93c9-32f2f476d4a4',
  cylance_score: -0.036,
  detected_by: 'Background Threat Detection',
  device_name: 'LCHDPLMPOB1',
  device_state: 'OnLine',
  file_name: 'ism_ora.exe',
  file_path: 'C:\\tmp\\ISM_DBMS_Oracle_Win_2.0.4.8\\ism_ora.exe',
  file_size: 87456,
  file_status: 'Quarantined',
  global_quarantined: false,
  safelisted: false,
  ip_addresses: [],
  last_found: '2023-10-05T05:50:17',
  mac_addresses: ['00-50-56-B1-79-3D'],
  md5: '984F6F98C08864859E5772BE694E44',
  running: false,
  sha256: '88D8537772A70F5D473975FF151A16FCF18AB25C72FB57310E9A7DAB82904C14',
  signed: false,
  sub_classification: '',
  unique_to_cylance: false,
  tenantId: '140078f4-da05-47c8-ace0-7b1992c9b02f'
};

const threatInvalidMAC = {
  agent_version: '3.1.1001',
  auto_run: false,
  av_industry: null,
  cert_publisher: '',
  cert_issuer: '',
  cert_timestamp: '0001-01-01T00:00:00',
  classification: '',
  cylance_device_id: '03c40f35-bbab-4a57-93c9-32f2f476d4a4',
  cylance_score: -0.036,
  detected_by: 'Background Threat Detection',
  device_name: 'LCHDPLMPOB1',
  device_state: 'OnLine',
  file_name: 'ism_ora.exe',
  file_path: 'C:\\tmp\\ISM_DBMS_Oracle_Win_2.0.4.8\\ism_ora.exe',
  file_size: 87456,
  file_status: 'Quarantined',
  global_quarantined: false,
  safelisted: false,
  ip_addresses: ['165.244.95.207'],
  last_found: '2023-10-05T05:50:17',
  mac_addresses: [],
  md5: '984F6F98C08864859E5772BE694E44',
  running: false,
  sha256: '88D8537772A70F5D473975FF151A16FCF18AB25C72FB57310E9A7DAB82904C14',
  signed: false,
  sub_classification: '',
  unique_to_cylance: false,
  tenantId: '140078f4-da05-47c8-ace0-7b1992c9b02f'
};

const validThreatsMessage = {
  type: 'pushed:threats',
  payload: { threats: [validThreat] },
  lastFetched: 'Tue, 16 Apr 2024 03:10:46 GMT'
};

const threatsMessageTypeIsEmptyString = {
  type: '',
  payload: { threats: [validThreat] },
  lastFetched: 'Tue, 16 Apr 2024 03:10:46 GMT'
};

const validGetUnassignedThreatsReqBody: IPaginateOptions = {
  pageIndex: 0,
  pageSize: 10,
  globalFilter: '-.207',
  sorting: []
};

const getUnassignedThreatsReqBodyNegativePageIndex: IPaginateOptions = {
  pageIndex: -1,
  pageSize: 10,
  globalFilter: '-.207',
  sorting: []
};

const getUnassignedThreatsReqBodyInvalidPageSize: IPaginateOptions = {
  pageIndex: 0,
  pageSize: 1000,
  globalFilter: '-.207',
  sorting: []
};

const getUnassignedThreatsReqBodySearchStringExceed50: IPaginateOptions = {
  pageIndex: 0,
  pageSize: 1000,
  globalFilter: '943eBpWYTDpY6zZs4Z09v768AknZneTGUtE9wzbzJK6twW65eDp',
  sorting: []
};

const getUnassignedThreatsReqBodySearchStringInvalidChar: IPaginateOptions = {
  pageIndex: 0,
  pageSize: 50,
  globalFilter: '943eBpWYTDpY6zZs4Z09v768AknZneGUtE9wzbzJK6twW65eD',
  sorting: []
};

const stringWith101characters =
  '3a222b2aca12313a2212accbabb1b1ba32322abc3aa2c21233c1bcb1bcab2bbc11c21b113ab3c12ac3aa1c131b23121c3aa1a';

export default {
  validThreat,
  threatInvalidFileSize,
  threatInvalidSHA,
  threatInvalidMD5,
  threatInvalidIP,
  threatInvalidMAC,
  validThreatsMessage,
  threatsMessageTypeIsEmptyString,
  validGetUnassignedThreatsReqBody,
  getUnassignedThreatsReqBodyNegativePageIndex,
  getUnassignedThreatsReqBodyInvalidPageSize,
  getUnassignedThreatsReqBodySearchStringExceed50,
  getUnassignedThreatsReqBodySearchStringInvalidChar,
  stringWith101characters
};
