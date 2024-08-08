import { RANKING } from '../constants/common.constants';
import { THREAT_STATUS } from '../constants/threats.constants';
import { IDatePreset, IPaginateOptions } from './api.interface';

export interface IThreatPrevRecord {
  cylanceDeviceId: string;
  status: THREAT_STATUS;
}

export interface IWeeklyUpdatedThreatToRepo extends IWeeklyUpdatedThreatStatus {
  status: THREAT_STATUS;
  addedBy: string;
}

export interface IWeeklyUpdatedThreatStatus {
  dashboardTenantId: string;
  global_quarantined: boolean;
  safelisted: boolean;
  sha256: string;
}

export interface IUnassignedThreatTableData {
  agentVersion: string;
  avIndustry: string;
  certPublisher: string | null;
  classification: string;
  deviceName: string;
  deviceState: string;
  ipAddress: string;
  fileName: string;
  filePath: string;
  fileStatus: string;
  macAddresses: string;
  sha256: string;
  cylanceScore: number;
  fileSize: number;
  autoRun: boolean;
  globalQuarantined: boolean;
  safeListed: boolean;
}

export interface IThreatsMessagePayload {
  threats: IThreatsFullPayload[];
}

// interface from cylance adaptor
export interface IThreatsFullPayload {
  agent_version: string;
  auto_run: boolean;
  av_industry: number | null;
  cert_issuer: string | null;
  cert_publisher: string | null;
  cert_timestamp: string;
  classification: string;
  cylance_device_id: string;
  cylance_score: number;
  detected_by: string;
  device_name: string;
  device_state: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_status: string;
  global_quarantined: boolean;
  safelisted: boolean;
  ip_addresses: string[];
  last_found: string;
  mac_addresses: string[];
  md5: string;
  running: boolean;
  sha256: string;
  signed: boolean;
  sub_classification: string;
  unique_to_cylance: boolean;
  tenantId: string;
  downloadPath: string;
  zones: Array<string>;
}

export interface IThreatOverviewPaginationWithDatePreset extends IPaginateOptions, IDatePreset {}

export interface ITop10RankingRequest extends IDatePreset {
  category: RANKING;
}

export interface ITop10RankingResponse {
  rank: number;
  name: string;
  count: number;
  percentage: number;
}
