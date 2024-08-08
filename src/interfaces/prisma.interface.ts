import { Prisma } from '@prisma/client';
import { ORDER_BY } from '../constants/prisma.constants';

export interface IPrismaOrderBy {
  [key: string]: ORDER_BY.ASCENDING | ORDER_BY.DESCENDING;
}

export interface IPrismaGetCountByStatusResult {
  _count: {
    status: number;
  };
  status: string;
}

export interface IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult {
  sha256: string;
  addedOn: Date | string;
  status: string;
  appliedTo: string;
  addedBy: string;
  reason: string;
}

export interface IPrismaGetAllDistinctThreatsResult {
  sha256: string;
  addedOn: Date | string;
  status: string;
}

export interface IWhereConditions {
  where: IConditions;
}

interface IConditions {
  sha256?: string;
  status?: string;
  addedBy?: string;
  cylanceDeviceId?: string;
}

export interface IGroupByMonthCount {
  month: string;
  status: string;
  count: number;
  date_part: number;
}

export interface IDateLimits {
  date1: Date;
  date2: Date;
}

export interface IPrismaRankingCount extends Prisma.ThreatCreateInput {
  _count: {
    [x: string]: never | number;
  };
}

export interface IPrismaDeviceRankingCount {
  [Prisma.ThreatScalarFieldEnum.deviceName]: string;
  [Prisma.ThreatScalarFieldEnum.cylanceDeviceId]: string;
  count: number;
}

export interface IPrismaInstanceCountGroupedByTenant {
  [Prisma.ThreatScalarFieldEnum.dashboardTenantId]: string;
  [Prisma.ThreatScalarFieldEnum.tenantName]: string;
  unlabelledCount: number;
  labelledCount: number;
  labelRate: number;
}

export interface IPrismaMalwareClassifiedCountsByTenant {
  [Prisma.ThreatScalarFieldEnum.dashboardTenantId]: string;
  [Prisma.ThreatScalarFieldEnum.tenantName]: string;
  trojan: number;
  virus: number;
  worm: number;
  ransom: number;
  backdoor: number;
  rootkit: number;
  cryptominer: number;
  keylogger: number;
  dropper: number;
}

export interface IPrismaMalwareCaseOverview {
  day?: number;
  month: number;
  year: number;
  startOfMonth: Date;
  allcase: number;
  quarantinedcase: number;
}

export interface IPrismaTotalCount {
  count: number;
}
