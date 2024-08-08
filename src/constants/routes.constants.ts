export const API_PATH = '/api/v1';

export enum API {
  DOCS = '/docs',
  THREATS = '/threats'
}

export enum PATH {
  UNASSIGNED = '/unassigned',
  QUARANTINED = '/quarantined',
  SAFELISTED = '/safelisted',
  ALL = '/all',
  OVERVIEW = '/overview',
  DOWNLOAD = '/download',
  COUNTS = '/counts',
  UNASSIGNED_AND_QUARANTINED = '/unassignedAndQuarantined',
  MARK_QUARANTINE = '/markQuarantine',
  MARK_SAFE = '/markSafe'
}

export enum COMPONENT {
  TABLE = '/table',
  INNER = '/inner',
  SUMMARY = '/summary',
  GRAPH_LINE = '/lineGraph',
  GRAPH_BAR = '/barGraph',
  RANKING = '/ranking',
  INCIDENTS = '/incidents',
  MALWARE = '/malware',
  DEPLOYED_POLICIES = '/policiesDeployed',
  DISTRIBUTION_OS = '/osDistribution',
  DEVICES_ERASABLE = '/erasableDevices'
}

export enum EXTERNAL_API {
  DEVICES = '/devices',
  TENANTS = '/tenants'
}

export enum EXTERNAL_PATHS {
  UPDATE_UNRESOLVED_AND_QUARANTINED_COUNTS = '/updateUnresolvedAndQuarantinedCounts'
}
