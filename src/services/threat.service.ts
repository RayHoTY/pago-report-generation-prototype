import { Prisma } from '@prisma/client';
import {
  IThreatOverviewPaginationWithDatePreset,
  IThreatsFullPayload,
  ITop10RankingRequest,
  IWeeklyUpdatedThreatStatus
} from '../interfaces/threats.interfaces';
import threatMgmtRespository from '../repositories/threatMgmt.repository';
import { threatRepository } from '../repositories';
import {
  IDatePreset,
  IPaginateOptions,
  IUpdateStatusRequestBody
} from '../interfaces/api.interface';
import { toUnassignedThreatsTableFormat } from './helpers/unassigned.threat.helpers.service';
import {
  arrangeThreatInstancesCountByStatus,
  checkIfDateRangeMoreThan90Days,
  getPresetDateRange,
  packAllDistinctThreatsOuterTable,
  packDistinctQuarantinedOrSafelistedThreatsOuterTable,
  packIncidentsTable,
  packUpdateDeviceThreatCountPayload,
  toStoredThreatDetails,
  updateCylanceGlobalList,
  packTop10Ranking,
  getTenantIdToNameHash,
  calculateThreatStatus
} from './helpers/shared.helpers.service';
import round from 'lodash/round';
import { THREAT_STATUS } from '../constants/threats.constants';
import threatMgmtRepository from '../repositories/threatMgmt.repository';
import {
  IPrismaGetCountByStatusResult,
  IPrismaMalwareCaseOverview
} from '../interfaces/prisma.interface';
import {
  DASHBOARD_AUTO_ASSIGN,
  RANKING,
  SYSTEM,
  monthNumberToAlphabet
} from '../constants/common.constants';
import logger from '../logs/logger';
import { updateDeviceUnresolvedAndQuarantinedCount } from '../external/dashboardServices/deviceTenantService';
import s3 from '../libs/s3/s3';
import { Readable } from 'stream';
import { NotFoundError } from '../utils/errors';
import { IUpdateDeviceUnresolvedQuarantinedCount } from '../interfaces/devices.interface';
import messageBuilder from '../utils/messageBuilder';
import { MESSAGE_TYPE, TOPIC } from '../constants/messageBus.constants';
import { publishToMsgBus } from '../external/messageBus';

const loggerLevel = 'threat-service';

const createThreats = async (data: IThreatsFullPayload[]) => {
  logger.info(`${loggerLevel}: Create new threat instance in db - START`);
  //get  tenant Ids and  Names Hash from Device And Tenant Service
  const tenantIdToNameHash = await getTenantIdToNameHash();

  const newThreats: Prisma.ThreatCreateInput[] = [];
  for (let i = 0; i < data.length; i += 1) {
    const tenantName = tenantIdToNameHash[data[i].tenantId];
    newThreats.push(await toStoredThreatDetails(data[i], tenantName));
  }
  const threats = await threatMgmtRespository.createThreats(newThreats);
  return threats;
};

const getUnassignedThreats = async (options: IPaginateOptions) => {
  logger.info(`${loggerLevel}: Get unassigned threats table info - START`);

  const { unassignedThreats, total } = await threatRepository.getUnassignedThreats(options);

  const transformedResults = unassignedThreats.map((result: Prisma.ThreatCreateInput) => {
    return toUnassignedThreatsTableFormat(result);
  });

  return {
    tableList: transformedResults,
    total
  };
};

const getCountOfThreatInstancesByStatus = async () => {
  const countResults: IPrismaGetCountByStatusResult[] =
    await threatMgmtRepository.getCountAllThreatInstancesByStatus();

  return arrangeThreatInstancesCountByStatus(countResults);
};

const getUnassignedThreatsSummary = async () => {
  logger.info(`${loggerLevel}: Get unassigned threats summary - START`);
  const counts = await getCountOfThreatInstancesByStatus();

  const { unassigned, quarantined, total } = counts;

  return {
    actual: {
      trueCount: quarantined,
      allCount: total,
      tpr: total == 0 ? 0 : round((quarantined / total) * 100, 1)
    },
    processed: {
      trueCount: quarantined,
      allCount: total - unassigned,
      tpr: quarantined == 0 ? 0 : round((quarantined / (total - unassigned)) * 100, 1)
    },
    analysisRate: {
      trueCount: total - unassigned,
      allCount: total,
      tpr: total == 0 ? 0 : round(((total - unassigned) / total) * 100, 1)
    }
  };
};

const getDistinctQuarantinedSHA256 = async (options: IPaginateOptions) => {
  logger.info(`${loggerLevel}: Get quarantined threats outer table data - START`);
  const { results, total } = await threatMgmtRespository.getDistinctQuarantinedThreats(options);

  return {
    tableList: await packDistinctQuarantinedOrSafelistedThreatsOuterTable(results),
    total
  };
};

const getAllInstancesOfThisQuaratinedThreat = async (sha256: string, options: IPaginateOptions) => {
  logger.info(`${loggerLevel}: Get quarantined threats inner table data - START`);
  const { results, total } = await threatRepository.getAllInstancesOfThisQuarantinedThreat(
    sha256,
    options
  );

  const transformedResults = results.map((result: Prisma.ThreatCreateInput) => {
    return toUnassignedThreatsTableFormat(result);
  });

  return {
    tableList: transformedResults,
    total
  };
};

const getQuarantinedThreatsSummary = async () => {
  logger.info(`${loggerLevel}: Get quarantined threats summary - START`);
  const monthlyQuarantineCase =
    await threatMgmtRespository.getThisMonthCountForThreatInstancesOfThisStatus(
      THREAT_STATUS.QUARANTINED
    );
  const quarantineSHACount = await threatMgmtRespository.getCountGroupByThisFieldAndWhereConditions(
    Prisma.ThreatScalarFieldEnum.sha256,
    { where: { status: THREAT_STATUS.QUARANTINED } }
  );
  const totalQuarantineCase = await threatMgmtRespository.getCountOfInstancesByWhereConditions({
    where: { status: THREAT_STATUS.QUARANTINED }
  });
  return {
    monthlyQuarantineCase,
    quarantineSHACount,
    totalQuarantineCase
  };
};

const getDistinctSafelistedSHA256 = async (options: IPaginateOptions) => {
  logger.info(`${loggerLevel}: Get safelisted threats outer table data - START`);
  const { results, total } = await threatMgmtRespository.getDistinctSafelistedThreats(options);

  return {
    tableList: await packDistinctQuarantinedOrSafelistedThreatsOuterTable(results),
    total
  };
};

const getAllInstancesOfThisSafelistedThreat = async (sha256: string, options: IPaginateOptions) => {
  logger.info(`${loggerLevel}: Get safelisted threats inner table data - START`);
  const { results, total } = await threatMgmtRespository.getAllInstancesOfThisSafelistedThreat(
    sha256,
    options
  );

  const transformedResults = results.map((result: Prisma.ThreatCreateInput) => {
    return toUnassignedThreatsTableFormat(result);
  });

  return {
    tableList: transformedResults,
    total
  };
};

const getSafelistedThreatsSummary = async () => {
  logger.info(`${loggerLevel}: Get safelisted threats summary - START`);
  const monthlySafeCase =
    await threatMgmtRespository.getThisMonthCountForThreatInstancesOfThisStatus(
      THREAT_STATUS.SAFELISTED
    );
  const safeSHACount = await threatMgmtRespository.getCountGroupByThisFieldAndWhereConditions(
    Prisma.ThreatScalarFieldEnum.sha256,
    { where: { status: THREAT_STATUS.SAFELISTED } }
  );
  const totalSafeCase = await threatMgmtRespository.getCountOfInstancesByWhereConditions({
    where: { status: THREAT_STATUS.SAFELISTED }
  });
  return {
    monthlySafeCase,
    safeSHACount,
    totalSafeCase
  };
};

const getAllDistinctSHA256 = async (options: IPaginateOptions) => {
  logger.info(`${loggerLevel}: Get all threats outer table data - START`);
  const { results, total } = await threatMgmtRespository.getAllDistinctSHA256(options);
  return {
    tableList: packAllDistinctThreatsOuterTable(results),
    total
  };
};

const getAllInstancesOfThisThreat = async (sha256: string, options: IPaginateOptions) => {
  logger.info(`${loggerLevel}: Get all threats inner table data - START`);
  const { results, total } = await threatMgmtRespository.getAllInstancesOfThisSHA256(
    sha256,
    options
  );
  const transformedResults = results.map((result: Prisma.ThreatCreateInput) => {
    return toUnassignedThreatsTableFormat(result);
  });
  return {
    tableList: transformedResults,
    total
  };
};

const getAllInstancesSummary = async () => {
  logger.info(`${loggerLevel}: Get all threats summary - START`);
  const totalMalwareCase = await threatMgmtRepository.getCountOfInstancesByWhereConditions();
  const uniqueSHACount = await threatMgmtRepository.getCountGroupByThisFieldAndWhereConditions(
    Prisma.ThreatScalarFieldEnum.sha256
  );
  const autoAssignedCase = await threatMgmtRepository.getCountOfInstancesByWhereConditions({
    where: { addedBy: DASHBOARD_AUTO_ASSIGN }
  });
  return {
    totalMalwareCase,
    uniqueSHACount,
    autoAssignedCase
  };
};

const getOverviewSummary = async () => {
  logger.info(`${loggerLevel}: Get threats overview summary - START`);
  const { quarantined, safelisted, total } = await getCountOfThreatInstancesByStatus();

  return {
    quarantinedRateFromAll: {
      trueCount: quarantined,
      allCount: total,
      tpr: total == 0 ? 0 : round((quarantined / total) * 100, 1)
    },
    quarantinedRateFromAssigned: {
      trueCount: quarantined,
      allCount: quarantined + safelisted,
      tpr: total == 0 ? 0 : round((quarantined / (quarantined + safelisted)) * 100, 1)
    },
    analysisRate: {
      trueCount: quarantined + safelisted,
      allCount: total,
      tpr: total == 0 ? 0 : round(((quarantined + safelisted) / total) * 100, 1)
    }
  };
};

const getOverviewLineGraphWithDatePreset = async (options: IDatePreset) => {
  logger.info(`${loggerLevel}: Get threats overview line graph - START`);
  const dateRange = await getPresetDateRange(options);
  const checkMoreThan90Days = await checkIfDateRangeMoreThan90Days(
    dateRange.startDate,
    dateRange.endDate
  );

  let result: IPrismaMalwareCaseOverview[] = [];
  if (checkMoreThan90Days) {
    logger.info('Date range is more than 90 days');
    result = await threatMgmtRepository.getMalwareCaseOverviewByMonth(dateRange);
  } else {
    logger.info('Date range is less than 90 days');
    result = await threatMgmtRepository.getMalwareCaseOverviewByDay(dateRange);
  }
  const buildResult = await buildOverviewLineGraph(result);
  return buildResult;
};

async function buildOverviewLineGraph(result: IPrismaMalwareCaseOverview[]) {
  const processed = result.map((item) => {
    return {
      month: `${item.day ? item.day + ' ' : ''}${monthNumberToAlphabet[item.month]} ${item.year.toString().slice(-2)}`,
      allCase: item.allcase,
      quarantinedCase: item.quarantinedcase
    };
  });

  return processed;
}

const getOverviewTop10RankingWithDatePreset = async (options: ITop10RankingRequest) => {
  logger.info(`${loggerLevel} - Get threats overview top 10 ranking - START`);
  const dateRange = await getPresetDateRange({
    datePreset: options.datePreset,
    startDate: options.startDate,
    endDate: options.endDate
  });
  let field: Prisma.ThreatScalarFieldEnum = 'sha256';
  let countConditions: { [key: string]: boolean } = { [Prisma.ThreatScalarFieldEnum.sha256]: true };

  switch (options.category) {
    case RANKING.THREATS:
      field = Prisma.ThreatScalarFieldEnum.sha256;
      countConditions = { [Prisma.ThreatScalarFieldEnum.sha256]: true };
      break;
    case RANKING.DEVICES:
      field = Prisma.ThreatScalarFieldEnum.cylanceDeviceId;
      break;
    case RANKING.ZONES:
      field = Prisma.ThreatScalarFieldEnum.zones;
      countConditions = { [Prisma.ThreatScalarFieldEnum.zones]: true };
      break;
    default:
      throw new Error('Invalid ranking category.');
  }

  let result;
  if (options.category === RANKING.DEVICES) {
    result = await threatMgmtRepository.getTop10RankedByNumberOfInstancesByDateRange(
      field,
      dateRange
    );
  } else {
    result = await threatMgmtRepository.getTop10RankedByNumberOfInstancesByDateRange(
      field,
      dateRange,
      countConditions
    );
  }

  const packedResults = await packTop10Ranking(result, field);
  return packedResults;
};

const getOverviewIncidentsByTenantWithDatePreset = async (
  options: IThreatOverviewPaginationWithDatePreset
) => {
  logger.info(`${loggerLevel} - Get threats overview incidents by tenant - START`);
  const dateRange = await getPresetDateRange({
    datePreset: options.datePreset,
    startDate: options.startDate,
    endDate: options.endDate
  });

  const { data, total } = await threatMgmtRepository.getInstancesByTenantWithDateRange(
    options,
    dateRange
  );

  return {
    tableList: packIncidentsTable(data),
    total: total
  };
};

const getOverviewMalwareWithDatePreset = async (
  options: IThreatOverviewPaginationWithDatePreset
) => {
  logger.info(`${loggerLevel} - Getting threats overview malware classification by tenant - START`);
  const dateRange = await getPresetDateRange({
    datePreset: options.datePreset,
    startDate: options.startDate,
    endDate: options.endDate
  });

  const result = await threatMgmtRepository.getMalwareClassifcationByTenantWithDateRange(
    options,
    dateRange
  );

  return {
    tableList: result.data,
    total: result.total
  };
};

const downloadThreatFile = async (sha256: string) => {
  const fileName = await threatMgmtRepository.getFilePathOfThreatBySha256(sha256);
  logger.info(`File name retrieved: ${fileName}`);
  const file = (await s3.getFileFromS3(fileName)) as Readable;
  if (!file) {
    throw new NotFoundError('File not found - Failed to get file from S3 bucket');
  }
  logger.info(`File retrieved: ${fileName}`);
  return file;
};

const getUnassignedAndQuarantinedCountOfThisDevice = async (deviceId: string) => {
  logger.info(`${loggerLevel} - Get unassigned and quarantined count of this device - START`);
  const result = await threatMgmtRepository.getCountAllThreatInstancesByStatus({
    where: { cylanceDeviceId: deviceId }
  });

  const { unassigned, quarantined } = arrangeThreatInstancesCountByStatus(result);
  return { unassigned, quarantined };
};

const updateThreatStatusAndUpdateCylance = async (
  updateData: IUpdateStatusRequestBody,
  newStatus: THREAT_STATUS.QUARANTINED | THREAT_STATUS.SAFELISTED
) => {
  logger.info(`${loggerLevel} - Update threat status in db - START`);
  const deviceIdsAndStatus = await threatMgmtRepository.getDeviceIdsOfThisSHA256(updateData);
  const results = await threatMgmtRepository.updateThreatStatus(updateData, newStatus);

  logger.info(`${loggerLevel} - Update Cylance of change in threat status - START`);
  await updateCylanceGlobalList(updateData, newStatus);

  const updateDeviceThreatCountPayload = packUpdateDeviceThreatCountPayload(
    newStatus,
    deviceIdsAndStatus
  );
  // TODO: to change from HTTP to messageBus communication.
  await updateDeviceUnresolvedAndQuarantinedCount(updateDeviceThreatCountPayload)
    .then((response) => {
      logger.info(
        `Updating devices unresolvedCount and quarantinedCount in Device-and-Tenant-Service, status = ${response.status}`
      );
    })
    .catch((error) => {
      if (error instanceof Error) {
        logger.error(`updateThreatStatusAndUpdateCylance ERROR: ${error}`);
      }
    });

  return results;
};

const weeklyUpdateOfThreatStatus = async (updatedThreatStatus: IWeeklyUpdatedThreatStatus) => {
  logger.info(`${loggerLevel} - Conduct weekly update of all threat statuses in db - START`);
  // only 1 threat status is updated at a time, via kafka msg
  const { global_quarantined, safelisted, sha256 } = updatedThreatStatus;

  try {
    const newStatus = calculateThreatStatus(global_quarantined, safelisted);
    if (newStatus === THREAT_STATUS.UNASSIGNED) {
      logger.info(
        `weekUpdateOfThreatStatus: Updated Threat Status from Cylance: global_quarantined = false && safelisted = false`
      );
      return;
    }
    const weeklyUpdatedThreat = {
      ...updatedThreatStatus,
      status: newStatus,
      addedBy: SYSTEM
    };
    const result = await threatMgmtRepository.weeklyUpdateThreatStatus(weeklyUpdatedThreat);
    logger.info(
      `weeklyUpdateOfThreatStatus, threat sha256: ${sha256}, query result = ${JSON.stringify(result, null, 2)}`
    );
    if (result.prevRecords.length > 0 && result.updatedCount.count > 0) {
      const { prevRecords } = result;
      const deviceIdsAndStatuses = prevRecords as IUpdateDeviceUnresolvedQuarantinedCount[];
      const { devicesToUpdate } = packUpdateDeviceThreatCountPayload(
        newStatus as THREAT_STATUS.QUARANTINED | THREAT_STATUS.SAFELISTED,
        deviceIdsAndStatuses
      );
      const range = devicesToUpdate.length;
      for (let i = 0; i < range; i += 1) {
        // only send message to devices if there is a valid change in status
        if (devicesToUpdate[i].updateDirection === '') continue;

        const messagePayload = messageBuilder.weeklyUpdateDeviceThreatCount(
          MESSAGE_TYPE.PUSHED_DEVICE_THREAT_COUNT_UPDATE,
          devicesToUpdate[i]
        );
        await publishToMsgBus(TOPIC.THREATS_DEVICES, messagePayload);
        logger.info(
          `weeklyUpdateOfThreatStatus: published ${i + 1} / ${range} updated threat statuses for devices`
        );
      }
    }

    if (result.prevRecords.length === 0) {
      logger.error(
        `threatSevice.weeklyUpdateOfThreatStatus, ERROR: cylance threat not found in threats db. \n sha256: ${sha256} \n repo result: ${JSON.stringify(result)}`
      );
    }
  } catch (error) {
    logger.error(
      `REPO: Error in weekly update of threat status, sha256: ${sha256} \n Error Details: \n ${error} `
    );
  }
};

export default {
  createThreats,
  getUnassignedThreats,
  getUnassignedThreatsSummary,
  getDistinctQuarantinedSHA256,
  getAllInstancesOfThisQuaratinedThreat,
  getQuarantinedThreatsSummary,
  getDistinctSafelistedSHA256,
  getAllInstancesOfThisSafelistedThreat,
  getSafelistedThreatsSummary,
  getAllDistinctSHA256,
  getAllInstancesOfThisThreat,
  getAllInstancesSummary,
  getOverviewSummary,
  getOverviewLineGraphWithDatePreset,
  getOverviewTop10RankingWithDatePreset,
  getOverviewIncidentsByTenantWithDatePreset,
  getOverviewMalwareWithDatePreset,
  downloadThreatFile,
  getUnassignedAndQuarantinedCountOfThisDevice,
  updateThreatStatusAndUpdateCylance,
  weeklyUpdateOfThreatStatus
};
