export enum THREAT_STATUS {
  UNASSIGNED = 'unassigned',
  QUARANTINED = 'quarantined',
  SAFELISTED = 'safelisted'
}

// TODO: need confirmation from PO for more data on device state values in Cylance
export enum DEVICE_STATE {
  ONLINE = 'online',
  OFFLINE = 'offline',
  INACTIVE = 'inactive'
}

export enum ASSIGN_STATUS {
  UNASSIGNED = 'Unassigned',
  ASSIGNED = 'Assigned'
}

export const toFrontEndStatus = {
  [THREAT_STATUS.UNASSIGNED as string]: 'Unassigned',
  [THREAT_STATUS.QUARANTINED as string]: 'Quarantined',
  [THREAT_STATUS.SAFELISTED as string]: 'Safelisted'
};
