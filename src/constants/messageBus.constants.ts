export enum TOPIC {
  GATEWAY_THREATS = 'gateway-threats',
  THREAT_MGMT_SERVICE = 'threat-mgmt-service',
  THREATS_DEVICES = 'threats-devices'
}

export enum MESSAGE_TYPE {
  PUSHED_GLOBAL_LIST_UPDATE = 'pushed:global-list-update',
  PUSHED_THREATS = 'pushed:threats',
  PUSHED_THREATS_WEEKLY_UPDATE = 'pushed:threats-weekly-update',
  PUSHED_DEVICE_THREAT_COUNT_UPDATE = 'weekly-pushed:device-threat-count-update'
}
