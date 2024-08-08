import { Prisma } from '@prisma/client';
import prisma from '../../client';
import {
  IPrismaGetAllDistinctThreatsResult,
  IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult,
  IPrismaInstanceCountGroupedByTenant,
  IPrismaMalwareClassifiedCountsByTenant,
  IPrismaTotalCount
} from '../../interfaces/prisma.interface';
import { ISorting } from '../../interfaces/api.interface';
import { ORDER_BY, RAW_QUERY } from '../../constants/prisma.constants';
import { buildSortConditionForRawQuery } from './shared.helpers.repository';
import logger from '../../logs/logger';
import { EMPTY_STRING } from '../../constants/common.constants';

const getPagination = (rowsToSkip: number, pageSize: number) => {
  return Prisma.sql([
    ` ORDER BY "addedOn" DESC
      OFFSET ${rowsToSkip}
      LIMIT ${pageSize}`
  ]);
};

//TODO: Remove unused function
export const prismaGetMalwareListByTenant = async (
  field: Prisma.Sql,
  direction: Prisma.Sql,
  rowsToSkip: number,
  pageSize: number
): Promise<IPrismaMalwareClassifiedCountsByTenant[]> => {
  const result = await prisma.$queryRaw<IPrismaMalwareClassifiedCountsByTenant[]>`
      WITH core as
        (
        SELECT 
          "dashboardTenantId", "tenantName", 
          CAST(sum(case when "subClassification" = 'trojan' then 1 else 0 end) AS INTEGER) as trojan,
          CAST(sum(case when "subClassification" = 'virus' then 1 else 0 end) AS INTEGER) as virus,
          CAST(sum(case when "subClassification" = 'worm' then 1 else 0 end) AS INTEGER) as worm,
          CAST(sum(case when "subClassification" = 'ransom' then 1 else 0 end) AS INTEGER) as ransom,
          CAST(sum(case when "subClassification" = 'backdoor' then 1 else 0 end) AS INTEGER) as backdoor,
          CAST(sum(case when "subClassification" = 'rootkit' then 1 else 0 end) AS INTEGER) as rootkit,
          CAST(sum(case when "subClassification" = 'cryptominer' then 1 else 0 end) AS INTEGER) as cryptominer,
          CAST(sum(case when "subClassification" = 'keylogger' then 1 else 0 end) AS INTEGER) as keylogger,
          CAST(sum(case when "subClassification" = 'dropper' then 1 else 0 end) AS INTEGER) as dropper
        FROM "Threat"
        GROUP BY "dashboardTenantId", "tenantName"
        ) 
      SELECT  
        "dashboardTenantId", 
        "tenantName", 
        trojan,
        virus,
        worm,
        ransom,
        backdoor,
        rootkit,
        cryptominer, 
        keylogger,
        dropper
      FROM core
      ORDER BY ${field} ${direction}
      OFFSET ${rowsToSkip}
      LIMIT ${pageSize}
    `;
  return result;
};

export const prismaGetMalwareListByTenantWithDateRange = async (
  field: Prisma.Sql,
  direction: Prisma.Sql,
  rowsToSkip: number,
  pageSize: number,
  dateRange: { startDate: Date; endDate: Date }
): Promise<{ data: IPrismaMalwareClassifiedCountsByTenant[]; total: number }> => {
  logger.info(`prisma get malware list by tenant with date range - START`);
  const malwareMatchCondition = Prisma.sql`WITH core as
        (
        SELECT 
          "dashboardTenantId", "tenantName", 
          CAST(sum(case when "subClassification" = 'trojan' then 1 else 0 end) AS INTEGER) as trojan,
          CAST(sum(case when "subClassification" = 'virus' then 1 else 0 end) AS INTEGER) as virus,
          CAST(sum(case when "subClassification" = 'worm' then 1 else 0 end) AS INTEGER) as worm,
          CAST(sum(case when "subClassification" = 'ransom' then 1 else 0 end) AS INTEGER) as ransom,
          CAST(sum(case when "subClassification" = 'backdoor' then 1 else 0 end) AS INTEGER) as backdoor,
          CAST(sum(case when "subClassification" = 'rootkit' then 1 else 0 end) AS INTEGER) as rootkit,
          CAST(sum(case when "subClassification" = 'cryptominer' then 1 else 0 end) AS INTEGER) as cryptominer,
          CAST(sum(case when "subClassification" = 'keylogger' then 1 else 0 end) AS INTEGER) as keylogger,
          CAST(sum(case when "subClassification" = 'dropper' then 1 else 0 end) AS INTEGER) as dropper
        FROM "Threat"
        WHERE "addedOn" >= ${dateRange.startDate} AND "addedOn" <= ${dateRange.endDate}
        GROUP BY "dashboardTenantId", "tenantName"
        ) `;

  const [data, total] = await prisma.$transaction([
    prisma.$queryRaw<IPrismaMalwareClassifiedCountsByTenant[]>`
      ${malwareMatchCondition}
      SELECT  
        "dashboardTenantId", 
        "tenantName", 
        trojan,
        virus,
        worm,
        ransom,
        backdoor,
        rootkit,
        cryptominer, 
        keylogger,
        dropper
      FROM core
      ORDER BY ${field} ${direction}
      OFFSET ${rowsToSkip}
      LIMIT ${pageSize}
    `,
    prisma.$queryRaw<IPrismaTotalCount[]>`
      ${malwareMatchCondition}
      SELECT CAST(COUNT(*) AS INTEGER) FROM core
    `
  ]);

  const newCount = total as IPrismaTotalCount[];

  return { data, total: newCount[0].count };
};

//TODO: Remove unused function
// TODO: might have to amend and look for ways to not rely on string concatenation
export const prismaGetInstancesByTenant = async (
  sorting: ISorting[],
  rowsToSkip: number,
  pageSize: number
): Promise<IPrismaInstanceCountGroupedByTenant[]> => {
  const sort =
    sorting.length > 0
      ? Prisma.sql([`${buildSortConditionForRawQuery(sorting)}`])
      : Prisma.sql([
          `${RAW_QUERY.ORDER_BY} ${'"' + Prisma.ThreatScalarFieldEnum.tenantName + '"'} ${ORDER_BY.ASC}`
        ]);

  const result = await prisma.$queryRaw<IPrismaInstanceCountGroupedByTenant[]>`
  WITH core as
  (
    SELECT 
      "dashboardTenantId", "tenantName", 
      CAST(sum(case when status = 'unassigned' then 1 else 0 end) AS INTEGER) as "unlabelledCount",
      CAST(sum(case when status = 'quarantined' then 1 else 0 end) AS INTEGER) as quarantined,
      CAST(sum(case when status = 'safelisted' then 1 else 0 end) AS INTEGER) as safelisted
    FROM "Threat"
    GROUP BY "dashboardTenantId", "tenantName"
  ) 
  SELECT  
    "dashboardTenantId",
    "tenantName",
    "unlabelledCount", 
    (quarantined + safelisted) AS "labelledCount",
    ROUND(((quarantined + safelisted) / (quarantined + safelisted + "unlabelledCount") * 100)) AS "labelRate"
  FROM core 
  ${sort}
  OFFSET ${rowsToSkip}
  LIMIT ${pageSize}
  `;

  return result;
};

export const prismaGetInstancesByTenantWithDateRange = async (
  sorting: ISorting[],
  rowsToSkip: number,
  pageSize: number,
  dateRange: { startDate: Date; endDate: Date }
): Promise<{ data: IPrismaInstanceCountGroupedByTenant[]; total: number }> => {
  const sort =
    sorting.length > 0
      ? Prisma.sql([`${buildSortConditionForRawQuery(sorting)}`])
      : Prisma.sql([
          `${RAW_QUERY.ORDER_BY} ${'"' + Prisma.ThreatScalarFieldEnum.tenantName + '"'} ${ORDER_BY.ASC}`
        ]);

  const instancesMatchCondition = Prisma.sql`
  WITH core as (
      SELECT 
        "dashboardTenantId", "tenantName", 
        CAST(sum(case when status = 'unassigned' then 1 else 0 end) AS NUMERIC) as "unlabelledCount",
        CAST(sum(case when status = 'quarantined' then 1 else 0 end) AS NUMERIC) as quarantined,
        CAST(sum(case when status = 'safelisted' then 1 else 0 end) AS NUMERIC) as safelisted
      FROM "Threat"
      WHERE "addedOn" >= ${dateRange.startDate} AND "addedOn" <= ${dateRange.endDate}
      GROUP BY "dashboardTenantId", "tenantName"
    )`;

  const [data, total] = await prisma.$transaction([
    prisma.$queryRaw<IPrismaInstanceCountGroupedByTenant[]>`
   ${instancesMatchCondition}
  SELECT  
    "dashboardTenantId",
    "tenantName",
    "unlabelledCount", 
    (quarantined + safelisted) AS "labelledCount",
    ROUND(((quarantined + safelisted)/(quarantined + safelisted + "unlabelledCount") * 100), 1) AS "labelRate"
  FROM core 
  ${sort}
  OFFSET ${rowsToSkip}
  LIMIT ${pageSize}
  `,
    prisma.$queryRaw<IPrismaTotalCount[]>`
  ${instancesMatchCondition}
  SELECT CAST(COUNT(*) AS INTEGER) FROM core`
  ]);

  const newTotal = total as IPrismaTotalCount[];

  return { data, total: newTotal[0].count };
};

export const prismaGetDistinctThreatsOfThisStatusWithFilter = async (
  threatStatus: string,
  globalFilter: string | undefined,
  rowsToSkip: number,
  pageSize: number
): Promise<{
  results: IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult[];
  total: number;
}> => {
  const distinctThreatsOfThisStatus = Prisma.sql([
    `WITH distinctThreatTable AS (
        SELECT *
        FROM
        (
          SELECT "sha256","addedOn","status","appliedTo", "addedBy","reason" ,
          ROW_NUMBER() OVER(PARTITION BY "sha256" ORDER BY "addedOn" DESC) as rn
          FROM "Threat"
        ) t
        WHERE rn = 1
        AND status = '${threatStatus}'
      )
      SELECT "sha256","addedOn","status","appliedTo", "addedBy","reason" 
      FROM distinctThreatTable`
  ]);

  const paginateSQLterms = getPagination(rowsToSkip, pageSize);

  let dbSearchTerm = EMPTY_STRING;
  if (globalFilter && globalFilter !== '') {
    dbSearchTerm = '%' + globalFilter + '%';
  }

  const globalFilterTerms =
    globalFilter === EMPTY_STRING
      ? Prisma.sql([``])
      : Prisma.sql([
          ` WHERE "sha256" ILIKE '${dbSearchTerm}'
           OR "appliedTo" ILIKE '${dbSearchTerm}'
           OR "addedBy" ILIKE '${dbSearchTerm}'
           OR "reason" ILIKE '${dbSearchTerm}'
           OR "status" ILIKE '${dbSearchTerm}'`
        ]);

  const [results, allResults] = await prisma.$transaction([
    prisma.$queryRaw`${distinctThreatsOfThisStatus}${globalFilterTerms}${paginateSQLterms}`,
    prisma.$queryRaw`${distinctThreatsOfThisStatus}${globalFilterTerms}`
  ]);

  const totalResults = allResults as IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult[];

  return {
    results: results as IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult[],
    total: totalResults.length as number
  };
};

export const prismaGetAllDistinctThreatsWithFilter = async (
  globalFilter: string | undefined,
  rowsToSkip: number,
  pageSize: number
): Promise<{
  results: IPrismaGetAllDistinctThreatsResult[];
  total: number;
}> => {
  const distinctThreats = Prisma.sql([
    `WITH distinctThreatTable AS (
        SELECT *
        FROM
        (
          SELECT "sha256","addedOn","status",
          ROW_NUMBER() OVER(PARTITION BY "sha256" ORDER BY "addedOn" DESC) as rn
          FROM "Threat"
        ) t
        WHERE rn = 1
      )
      SELECT "sha256","addedOn","status"
      FROM distinctThreatTable`
  ]);
  const paginateSQLterms = getPagination(rowsToSkip, pageSize);

  let dbSearchTerm = EMPTY_STRING;
  if (globalFilter && globalFilter !== '') {
    dbSearchTerm = '%' + globalFilter + '%';
  }
  const globalFilterTerms =
    globalFilter === EMPTY_STRING
      ? Prisma.sql([``])
      : Prisma.sql([
          ` WHERE "sha256" ILIKE '${dbSearchTerm}'
           OR "status" ILIKE '${dbSearchTerm}'`
        ]);

  const [results, allResults] = await prisma.$transaction([
    prisma.$queryRaw`${distinctThreats}${globalFilterTerms}${paginateSQLterms}`,
    prisma.$queryRaw`${distinctThreats}${globalFilterTerms}`
  ]);

  const totalResults = allResults as IPrismaGetAllDistinctThreatsResult[];

  return {
    results: results as IPrismaGetAllDistinctThreatsResult[],
    total: totalResults.length
  };
};
