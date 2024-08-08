import { Prisma } from '@prisma/client';
import prisma from '../client';
import { IPaginateOptions, IUpdateStatusRequestBody } from '../interfaces/api.interface';
import { getUnassignedThreatsWhereConditions } from './helpers/unassigned.threat.helpers.repository';
import {
  buildSortingTermsArray,
  getDateLimitsForThisMonth,
  getPrismaSqlSortFieldAndDirection,
  getWhereConditionsForAllThreats
} from './helpers/shared.helpers.repository';
import { THREAT_STATUS } from '../constants/threats.constants';
import { getWhereConditionsForQuarantinedOrSafelistedThreats } from './helpers/shared.helpers.repository';
import {
  prismaGetAllDistinctThreatsWithFilter,
  prismaGetDistinctThreatsOfThisStatusWithFilter,
  prismaGetInstancesByTenant,
  prismaGetInstancesByTenantWithDateRange,
  prismaGetMalwareListByTenantWithDateRange
} from './helpers/shared.queries.repository';
import {
  IDateLimits,
  IPrismaGetAllDistinctThreatsResult,
  IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult,
  IPrismaInstanceCountGroupedByTenant,
  IPrismaMalwareCaseOverview,
  IPrismaMalwareClassifiedCountsByTenant,
  IPrismaRankingCount,
  IWhereConditions
} from '../interfaces/prisma.interface';
import { NotFoundError } from '../utils/errors';
import { IUpdateDeviceUnresolvedQuarantinedCount } from '../interfaces/devices.interface';
import logger from '../logs/logger';
import { IWeeklyUpdatedThreatToRepo } from '../interfaces/threats.interfaces';

//TODO: need better way to catch and bubble up errors picked up by Prisma when creating threats.
const createThreats = async (data: Prisma.ThreatCreateInput[]): Promise<{ count: number }> => {
  const result = await prisma.threat.createMany({
    data: data,
    skipDuplicates: false
  });
  logger.info(`new threat instance created in db, count: ${result.count}`);
  return result;
};

/**
 * Returns latest added threat instance of this threat sha256 if it was already present.
 * @param sha256 string
 */
const getPreviouslyAddedInstanceOfThisThreat = async (
  sha256: string
): Promise<{ id: string; sha256: string; addedOn: Date; status: string; reason: string }> => {
  const results = await prisma.threat.findMany({
    where: {
      sha256: sha256
    },
    orderBy: {
      addedOn: 'desc'
    },
    select: {
      id: true,
      sha256: true,
      addedOn: true,
      status: true,
      reason: true
    }
  });
  // if threats of matching sha256 cannot be found, undefined is returned.
  return results[0];
};
const getUnassignedThreats = async (
  options: IPaginateOptions
): Promise<{
  unassignedThreats: Prisma.ThreatCreateInput[];
  total: number;
}> => {
  const { pageIndex, pageSize, globalFilter, sorting } = options;

  const skip = pageIndex > 0 ? pageIndex * pageSize : 0;

  const where = getUnassignedThreatsWhereConditions(globalFilter);

  const orderBy = [...buildSortingTermsArray(sorting) /* , { lastFound: ORDER_BY.DESCENDING } */];

  const [unassignedThreats, count] = await prisma.$transaction([
    prisma.threat.findMany({
      skip,
      take: pageSize,
      where,
      orderBy
    }),
    prisma.threat.findMany({
      where
    })
  ]);

  const total = count.length as number;

  return { unassignedThreats, total };
};

const getDistinctQuarantinedThreats = async (
  options: IPaginateOptions
): Promise<{
  results: IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult[];
  total: number;
}> => {
  const { pageSize, pageIndex, globalFilter } = options;
  const rowsToSkip = pageIndex * pageSize;
  return await prismaGetDistinctThreatsOfThisStatusWithFilter(
    THREAT_STATUS.QUARANTINED,
    globalFilter,
    rowsToSkip,
    pageSize
  );
};

const getAllInstancesOfThisQuarantinedThreat = async (
  sha256: string,
  options: IPaginateOptions
): Promise<{ results: Prisma.ThreatCreateInput[]; total: number }> => {
  const { pageIndex, pageSize, globalFilter, sorting } = options;

  const [results, allResults] = await prisma.$transaction([
    prisma.threat.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      where: getWhereConditionsForQuarantinedOrSafelistedThreats(
        globalFilter,
        THREAT_STATUS.QUARANTINED,
        sha256
      ),
      orderBy: buildSortingTermsArray(sorting)
    }),
    prisma.threat.findMany({
      where: getWhereConditionsForQuarantinedOrSafelistedThreats(
        globalFilter,
        THREAT_STATUS.QUARANTINED,
        sha256
      )
    })
  ]);

  const totalResults = allResults as Prisma.ThreatCreateInput[];

  return {
    results: results as Prisma.ThreatCreateInput[],
    total: totalResults.length
  };
};

const getDistinctSafelistedThreats = async (
  options: IPaginateOptions
): Promise<{
  results: IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult[];
  total: number;
}> => {
  const { pageSize, pageIndex, globalFilter } = options;
  const rowsToSkip = pageIndex * pageSize;
  return await prismaGetDistinctThreatsOfThisStatusWithFilter(
    THREAT_STATUS.SAFELISTED,
    globalFilter,
    rowsToSkip,
    pageSize
  );
};

const getAllInstancesOfThisSafelistedThreat = async (
  sha256: string,
  options: IPaginateOptions
): Promise<{
  results: Prisma.ThreatCreateInput[];
  total: number;
}> => {
  const { pageIndex, pageSize, globalFilter, sorting } = options;

  const [results, allResults] = await prisma.$transaction([
    prisma.threat.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      where: getWhereConditionsForQuarantinedOrSafelistedThreats(
        globalFilter,
        THREAT_STATUS.SAFELISTED,
        sha256
      ),
      orderBy: buildSortingTermsArray(sorting)
    }),
    prisma.threat.findMany({
      where: getWhereConditionsForQuarantinedOrSafelistedThreats(
        globalFilter,
        THREAT_STATUS.SAFELISTED,
        sha256
      )
    })
  ]);

  const totalResults = allResults as Prisma.ThreatCreateInput[];

  return { results: results as Prisma.ThreatCreateInput[], total: totalResults.length };
};

const getAllDistinctSHA256 = async (
  options: IPaginateOptions
): Promise<{ results: IPrismaGetAllDistinctThreatsResult[]; total: number }> => {
  const { pageSize, pageIndex, globalFilter } = options;
  const rowsToSkip = pageIndex * pageSize;

  return await prismaGetAllDistinctThreatsWithFilter(globalFilter, rowsToSkip, pageSize);
};

const getAllInstancesOfThisSHA256 = async (
  sha256: string,
  options: IPaginateOptions
): Promise<{ results: Prisma.ThreatCreateInput[]; total: number }> => {
  const { pageIndex, pageSize, globalFilter, sorting } = options;

  const [results, allResults] = await prisma.$transaction([
    prisma.threat.findMany({
      skip: pageIndex * pageSize,
      take: pageSize,
      where: getWhereConditionsForAllThreats(globalFilter, sha256),
      orderBy: buildSortingTermsArray(sorting)
    }),
    prisma.threat.findMany({
      where: getWhereConditionsForAllThreats(globalFilter, sha256)
    })
  ]);

  const totalResults = allResults as Prisma.ThreatCreateInput[];

  return {
    results: results as Prisma.ThreatCreateInput[],
    total: totalResults.length as number
  };
};

const getThisMonthCountForThreatInstancesOfThisStatus = async (
  threatStatus: string
): Promise<number> => {
  const { dateObjDay1ThisMonth, dateObjDay1NextMonth } = getDateLimitsForThisMonth();
  return await prisma.threat.count({
    where: {
      status: threatStatus,
      addedOn: {
        gte: dateObjDay1ThisMonth,
        lt: dateObjDay1NextMonth
      }
    }
  });
};

const getCountAllThreatInstancesByStatus = async (
  whereConditions: IWhereConditions | undefined = undefined
): Promise<
  (Prisma.PickEnumerable<Prisma.ThreatGroupByOutputType, 'status'[]> & {
    _count: {
      status: number;
    };
  })[]
> => {
  const result = prisma.threat.groupBy({
    by: ['status'],
    _count: {
      status: true
    },
    ...whereConditions,
    orderBy: {
      status: 'desc'
    }
  });
  return result;
};

const getCountOfInstancesByWhereConditions = async (
  whereConditions: IWhereConditions | undefined = undefined
): Promise<number> => {
  const result = await prisma.threat.count(whereConditions);
  return result;
};

const getCountGroupByThisFieldAndWhereConditions = async (
  field: Prisma.ThreatScalarFieldEnum,
  whereOrCountConditions: IWhereConditions | undefined = undefined
): Promise<number> => {
  const results = await prisma.threat.groupBy({
    by: [field],
    ...whereOrCountConditions
  });
  return results.length;
};

//TODO: Remove unused function
const getAllCountsGroupedByMonth = async (dateStringLimits: IDateLimits): Promise<any> => {
  const { date1, date2 } = dateStringLimits;

  const results = await prisma.$queryRaw`
    SELECT DATE_PART('Year', "addedOn"), EXTRACT(MONTH FROM "addedOn") AS month, status, 
    CAST (COUNT(id) AS INTEGER) AS count
    FROM "Threat" t WHERE t."addedOn" >= ${date1} AND t."addedOn" < ${date2}
    GROUP BY DATE_PART('Year', "addedOn"), EXTRACT(MONTH FROM "addedOn"), status
    `;

  return results;
};

const getMalwareCaseOverviewByDay = async (dateRange: {
  startDate: Date;
  endDate: Date;
}): Promise<IPrismaMalwareCaseOverview[]> => {
  logger.info(`Get malware case overview - START`);

  const results: IPrismaMalwareCaseOverview[] = await prisma.$queryRaw`
    WITH Date_Range AS (SELECT
      EXTRACT(DAY FROM date) AS day,
      EXTRACT(MONTH FROM date) AS month,
      EXTRACT(YEAR FROM date) AS year,
      date as startOfMonth,
      date + INTERVAL '1 day' as nextMonth
      FROM generate_series(CAST(${dateRange.startDate} AS DATE),
      CAST(${dateRange.endDate} AS DATE),
      INTERVAL '1 day') AS mr(date))

    SELECT dr.day, dr.month, dr.year, dr.startOfMonth, 
    CAST(COUNT(t) as INTEGER) as allCase,
    CAST(SUM(case when "status" = ${THREAT_STATUS.QUARANTINED} then 1 else 0 end) as INTEGER) as quarantinedCase 
    FROM Date_Range as dr
    LEFT JOIN "Threat" as t
    on t."addedOn" >= dr.startOfMonth
    AND t."addedOn" < dr.nextMonth
    GROUP BY dr.day, dr.month, dr.year, dr.startOfMonth
    ORDER BY dr.startOfMonth
  `;
  return results;
};

const getMalwareCaseOverviewByMonth = async (dateRange: {
  startDate: Date;
  endDate: Date;
}): Promise<IPrismaMalwareCaseOverview[]> => {
  logger.info(`Get malware case overview - START`);

  const results: IPrismaMalwareCaseOverview[] = await prisma.$queryRaw`
    WITH Date_Range AS (SELECT
      EXTRACT(MONTH FROM date) AS month,
      EXTRACT(YEAR FROM date) AS year,
      date as startOfMonth,
      date + INTERVAL '1 month' as nextMonth
      FROM generate_series(CAST(${dateRange.startDate} AS DATE),
      CAST(${dateRange.endDate} AS DATE),
      INTERVAL '1 month') AS mr(date))

    SELECT dr.month, dr.year, dr.startOfMonth, 
    CAST(COUNT(t) as INTEGER) as allCase,
    CAST(SUM(case when "status" = ${THREAT_STATUS.QUARANTINED} then 1 else 0 end) as INTEGER) as quarantinedCase 
    FROM Date_Range as dr
    LEFT JOIN "Threat" as t
    on t."lastFound" >= dr.startOfMonth
    AND t."lastFound" < dr.nextMonth
    GROUP BY dr.month, dr.year, dr.startOfMonth
    ORDER BY dr.startOfMonth
  `;
  return results;
};

const getTop10RankedByNumberOfInstancesByDateRange = async (
  field: Prisma.ThreatScalarFieldEnum,
  dateRange: { startDate: Date; endDate: Date },
  countConditions?: { [key: string]: boolean }
): Promise<IPrismaRankingCount[]> => {
  logger.info(`Get top 10 ranked by number of instances by date range - START`);

  const groupByFields: Prisma.ThreatScalarFieldEnum[] = [field];
  let orderByField = field;

  if (field === Prisma.ThreatScalarFieldEnum.cylanceDeviceId) {
    groupByFields.push(Prisma.ThreatScalarFieldEnum.deviceName);
    orderByField = Prisma.ThreatScalarFieldEnum.deviceName;
  }

  const results = await prisma.threat.groupBy({
    by: groupByFields,
    where: {
      addedOn: {
        gte: dateRange.startDate,
        lt: dateRange.endDate
      }
    },
    _count: countConditions || { [field]: true },
    orderBy: [
      {
        _count: {
          [orderByField]: 'desc'
        }
      },
      ...(field === Prisma.ThreatScalarFieldEnum.cylanceDeviceId
        ? [{ deviceName: 'asc' as const }]
        : [])
    ],
    take: 10
  });

  const transformedResults: IPrismaRankingCount[] = results.map((result) => {
    const transformedResult: any = { ...result };

    if (field === Prisma.ThreatScalarFieldEnum.cylanceDeviceId) {
      transformedResult[field] = result.deviceName;
    }

    return {
      ...transformedResult,
      _count: result._count
    };
  });

  logger.info(`Get top 10 ranked by number of instances by date range - END`);
  return transformedResults;
};

const getInstancesByTenant = async (
  options: IPaginateOptions
): Promise<IPrismaInstanceCountGroupedByTenant[]> => {
  const { pageSize, pageIndex, sorting } = options;
  const rowsToSkip = pageIndex * pageSize;

  return await prismaGetInstancesByTenant(sorting, rowsToSkip, pageSize);
};

const getInstancesByTenantWithDateRange = async (
  options: IPaginateOptions,
  dateRange: { startDate: Date; endDate: Date }
): Promise<{ data: IPrismaInstanceCountGroupedByTenant[]; total: number }> => {
  const { pageSize, pageIndex, sorting } = options;
  const rowsToSkip = pageIndex * pageSize;

  return await prismaGetInstancesByTenantWithDateRange(sorting, rowsToSkip, pageSize, dateRange);
};

const getTenantNamesAndIds = async (): Promise<
  Prisma.PickEnumerable<Prisma.ThreatGroupByOutputType, ('dashboardTenantId' | 'tenantName')[]>[]
> => {
  const result = await prisma.threat.groupBy({
    by: [Prisma.ThreatScalarFieldEnum.dashboardTenantId, Prisma.ThreatScalarFieldEnum.tenantName]
  });

  return result;
};

const getMalwareClassifcationByTenantWithDateRange = async (
  options: IPaginateOptions,
  dateRange: { startDate: Date; endDate: Date }
): Promise<{ data: IPrismaMalwareClassifiedCountsByTenant[]; total: number }> => {
  logger.info(`Get malware classification by tenant with date range - START`);
  const { pageSize, pageIndex, sorting } = options;
  const { field, direction } = getPrismaSqlSortFieldAndDirection(sorting);
  const rowsToSkip = pageIndex * pageSize;
  return await prismaGetMalwareListByTenantWithDateRange(
    field,
    direction,
    rowsToSkip,
    pageSize,
    dateRange
  );
};

const getFilePathOfThreatBySha256 = async (sha256: string): Promise<string> => {
  const result = await prisma.threat.findFirst({
    where: {
      sha256: sha256
    },
    select: {
      [Prisma.ThreatScalarFieldEnum.downloadPath]: true
    },
    orderBy: {
      addedOn: 'desc'
    }
  });
  if (result === null) throw new NotFoundError('Threat instance not found.');
  return result.downloadPath;
};

const updateThreatStatus = async (
  updateData: IUpdateStatusRequestBody,
  newStatus: THREAT_STATUS.QUARANTINED | THREAT_STATUS.SAFELISTED
): Promise<Prisma.BatchPayload> => {
  const { applicableTo, sha256, reason } = updateData;
  const result = await prisma.threat.updateMany({
    where: {
      sha256,
      dashboardTenantId: { in: applicableTo }
    },
    data: {
      appliedTo: JSON.stringify(applicableTo),
      reason,
      status: newStatus
    }
  });
  return result;
};

const getDeviceIdsOfThisSHA256 = async (
  updateData: IUpdateStatusRequestBody
): Promise<IUpdateDeviceUnresolvedQuarantinedCount[]> => {
  const { sha256, applicableTo } = updateData;
  return await prisma.threat.findMany({
    where: {
      sha256,
      dashboardTenantId: { in: applicableTo }
    },
    select: {
      cylanceDeviceId: true,
      status: true
    }
  });
};

const weeklyUpdateThreatStatus = async (
  weeklyUpdatedThreat: IWeeklyUpdatedThreatToRepo
): Promise<{
  prevRecords: IUpdateDeviceUnresolvedQuarantinedCount[];
  updatedCount: Prisma.BatchPayload;
}> => {
  const { dashboardTenantId, global_quarantined, safelisted, sha256, status, addedBy } =
    weeklyUpdatedThreat;

  const [prevRecords, updatedCount] = await prisma.$transaction([
    prisma.threat.findMany({
      where: {
        sha256,
        dashboardTenantId
      },
      select: {
        cylanceDeviceId: true,
        status: true
      }
    }),
    prisma.threat.updateMany({
      where: {
        sha256,
        dashboardTenantId
      },
      data: {
        appliedTo: JSON.stringify([dashboardTenantId]),
        globalQuarantined: global_quarantined,
        safelisted,
        status,
        addedBy,
        addedOn: new Date()
      }
    })
  ]);

  return { prevRecords, updatedCount };
};

export default {
  createThreats,
  getPreviouslyAddedInstanceOfThisThreat,
  getUnassignedThreats, // TODO: to check again for deletion, appears unused.
  getDistinctQuarantinedThreats,
  getAllInstancesOfThisQuarantinedThreat,
  getDistinctSafelistedThreats,
  getAllInstancesOfThisSafelistedThreat,
  getAllDistinctSHA256,
  getAllInstancesOfThisSHA256,
  getThisMonthCountForThreatInstancesOfThisStatus,
  getCountAllThreatInstancesByStatus,
  getCountOfInstancesByWhereConditions,
  getCountGroupByThisFieldAndWhereConditions,
  getAllCountsGroupedByMonth,
  getMalwareCaseOverviewByDay,
  getMalwareCaseOverviewByMonth,
  getTop10RankedByNumberOfInstancesByDateRange,
  getInstancesByTenant,
  getInstancesByTenantWithDateRange,
  getTenantNamesAndIds,
  getMalwareClassifcationByTenantWithDateRange,
  updateThreatStatus,
  getDeviceIdsOfThisSHA256,
  getFilePathOfThreatBySha256,
  weeklyUpdateThreatStatus
};
