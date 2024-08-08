import { DATE_PRESET } from '../constants/common.constants';

export interface IThreatsTablesRequestBody {
  sha256: string;
  options: IPaginateOptions;
}

export interface IPaginateOptions {
  pageIndex: number;
  pageSize: number;
  globalFilter?: string;
  sorting: ISorting[];
}

export interface ISorting {
  id: string;
  desc: boolean;
}

export interface IUpdateStatusRequestBody {
  applicableTo: Array<string>;
  reason: string;
  sha256: string;
}

export interface IUpdateDeviceThreatCountRequestBody {
  devicesToUpdate: IUpdateDeviceThreatCount[];
}

export interface IUpdateDeviceThreatCount {
  cylanceDeviceId: string;
  updateDirection: string;
}
export interface IDatePreset {
  datePreset: DATE_PRESET;
  startDate?: Date;
  endDate?: Date;
}
