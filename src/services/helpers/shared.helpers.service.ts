import { Prisma } from '@prisma/client';
import { ASSIGN_STATUS, THREAT_STATUS, toFrontEndStatus } from '../../constants/threats.constants';
import { IThreatsFullPayload } from '../../interfaces/threats.interfaces';
import threatMgmtRepository from '../../repositories/threatMgmt.repository';
import {
  IDateLimits,
  IGroupByMonthCount,
  IPrismaDeviceRankingCount,
  IPrismaGetAllDistinctThreatsResult,
  IPrismaGetCountByStatusResult,
  IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult,
  IPrismaRankingCount,
  IPrismaInstanceCountGroupedByTenant,
  IPrismaMalwareClassifiedCountsByTenant
} from '../../interfaces/prisma.interface';
import {
  DASHBOARD_APP,
  DASHBOARD_AUTO_ASSIGN,
  DATE_PRESET,
  EMPTY_STRING,
  MOCK_ID
} from '../../constants/common.constants';
import { IPreLineGraphData } from '../../interfaces/widgetData.interface';
import { getDateLimitsForLineGraphBasedOnMonthsToLookBack } from '../../repositories/helpers/shared.helpers.repository';
import { format as formatDate, subMonths } from 'date-fns';
import { CATEGORY, LIST_TYPE } from '../../constants/cylance.constants';
import messageBuilder from '../../utils/messageBuilder';
import { MESSAGE_TYPE, TOPIC } from '../../constants/messageBus.constants';
import { publishToMsgBus } from '../../external/messageBus';
import { IUpdateStatusRequestBody } from '../../interfaces/api.interface';
import { IUpdateDeviceUnresolvedQuarantinedCount } from '../../interfaces/devices.interface';
import { UPDATE_COUNT_DIRECTION } from '../../constants/devices.constants';
import { IDatePreset } from '../../interfaces/api.interface';
import logger from '../../logs/logger';
import { getAllTenantNamesAndIds } from '../../external/dashboardServices/deviceTenantService';
import { ITenantIdAndName } from '../../interfaces/tenants.interface';

export const getTenantIdToNameHash = async () => {
  const tenantIdNameList = await getAllTenantNamesAndIds();
  if (tenantIdNameList.length === 0) {
    return {};
  }
  const tenantIdToNameHash: { [key: string]: string } = {};

  tenantIdNameList.map((tenantIdName: ITenantIdAndName) => {
    tenantIdToNameHash[tenantIdName.id] = tenantIdName.name;
  });

  return tenantIdToNameHash;
};

export const packUpdateDeviceThreatCountPayload = (
  newStatus: THREAT_STATUS.QUARANTINED | THREAT_STATUS.SAFELISTED,
  deviceIdsAndStatuses: IUpdateDeviceUnresolvedQuarantinedCount[]
) => {
  const updateDirectionsOfDevices = deviceIdsAndStatuses.map(
    (deviceIdAndStatus: IUpdateDeviceUnresolvedQuarantinedCount) => {
      const oldStatus = deviceIdAndStatus.status;
      const deviceIDandStatus = {
        cylanceDeviceId: deviceIdAndStatus.cylanceDeviceId,
        updateDirection: getStatusUpdateDirection(oldStatus, newStatus)
      };
      logger.info(
        `packUpdateDeviceThreatCountPayload, deviceIdAndStatus = ${JSON.stringify(deviceIDandStatus)}`
      );
      return deviceIDandStatus;
    }
  );
  return { devicesToUpdate: updateDirectionsOfDevices };
};

const getStatusUpdateDirection = (oldStatus: string, newStatus: string) => {
  const statusDirection = oldStatus + newStatus;
  let updateDirection = '';
  switch (statusDirection) {
    case `${THREAT_STATUS.QUARANTINED}${THREAT_STATUS.SAFELISTED}`:
      updateDirection = UPDATE_COUNT_DIRECTION.QUARANTINED_TO_SAFE;
      break;
    case `${THREAT_STATUS.SAFELISTED}${THREAT_STATUS.QUARANTINED}`:
      updateDirection = UPDATE_COUNT_DIRECTION.SAFE_TO_QUARANTINE;
      break;
    case `${THREAT_STATUS.UNASSIGNED}${THREAT_STATUS.SAFELISTED}`:
      updateDirection = UPDATE_COUNT_DIRECTION.UNASSIGNED_TO_SAFE;
      break;
    case `${THREAT_STATUS.UNASSIGNED}${THREAT_STATUS.QUARANTINED}`:
      updateDirection = UPDATE_COUNT_DIRECTION.UNASSIGNED_TO_QUARANTINE;
      break;
    case `${THREAT_STATUS.QUARANTINED}${THREAT_STATUS.QUARANTINED}`:
    case `${THREAT_STATUS.SAFELISTED}${THREAT_STATUS.SAFELISTED}`:
      logger.error(`Old status same as new status`);
      break;
    default:
      logger.error(`Invalid status change requested.`);
  }
  return updateDirection;
};

export const updateCylanceGlobalList = async (
  updateData: IUpdateStatusRequestBody,
  newStatus: THREAT_STATUS.QUARANTINED | THREAT_STATUS.SAFELISTED,
  category: CATEGORY | undefined = CATEGORY.NONE
) => {
  const { applicableTo, sha256, reason } = updateData;
  const list_type =
    newStatus === THREAT_STATUS.QUARANTINED ? LIST_TYPE.GLOBAL_QUARANTINE : LIST_TYPE.GLOBAL_SAFE;
  const globalListUpdate = {
    sha256,
    list_type,
    category,
    reason,
    applicableTo
  };
  const messagePayload = messageBuilder.updateGlobalList(
    MESSAGE_TYPE.PUSHED_GLOBAL_LIST_UPDATE,
    globalListUpdate
  );
  await publishToMsgBus(TOPIC.THREAT_MGMT_SERVICE, messagePayload);
  logger.info('Global list update data has been published');
  return;
};

export const packOverviewMalwareTable = (
  malwareOfTenants: IPrismaMalwareClassifiedCountsByTenant[]
) => {
  const packed = malwareOfTenants.map((malwareOfTenant: IPrismaMalwareClassifiedCountsByTenant) => {
    return {
      tenantName: malwareOfTenant.tenantName,
      trojan: malwareOfTenant.trojan,
      virus: malwareOfTenant.virus,
      worm: malwareOfTenant.worm,
      ransom: malwareOfTenant.ransom,
      backdoor: malwareOfTenant.backdoor,
      rootkit: malwareOfTenant.rootkit,
      cryptominer: malwareOfTenant.cryptominer,
      keylogger: malwareOfTenant.keylogger,
      dropper: malwareOfTenant.dropper
    };
  });

  return packed;
};

export const packIncidentsTable = (
  instancesGroupedByTenant: IPrismaInstanceCountGroupedByTenant[]
) => {
  const packed = instancesGroupedByTenant.map(
    (instanceCountOfTenant: IPrismaInstanceCountGroupedByTenant) => {
      return {
        tenantName: instanceCountOfTenant.tenantName,
        labelledCount: instanceCountOfTenant.labelledCount,
        unlabelledCount: instanceCountOfTenant.unlabelledCount,
        labelRate: instanceCountOfTenant.labelRate
      };
    }
  );
  return packed;
};

// TODO: Remove unused function
export const packDevicesRanking = (devicesRankedByInstanceCount: IPrismaDeviceRankingCount[]) => {
  const maxValue = devicesRankedByInstanceCount[0].count;
  const packed = devicesRankedByInstanceCount.map(
    (rankedDevice: IPrismaDeviceRankingCount, i: number) => {
      return {
        ranked: i + 1,
        name: rankedDevice.deviceName,
        count: rankedDevice.count,
        percentage: Math.ceil((rankedDevice.count / maxValue) * 100)
      };
    }
  );
  return packed;
};

// TODO: Remove unused function
export const packThreatsRanking = (sha256sRankedByInstanceCount: IPrismaRankingCount[]) => {
  const maxValue = sha256sRankedByInstanceCount[0]._count.sha256;
  const packed = sha256sRankedByInstanceCount.map(
    (rankedSHA256: IPrismaRankingCount, i: number) => {
      return {
        ranked: i + 1,
        name: rankedSHA256.sha256,
        count: rankedSHA256._count.sha256,
        percentage: Math.ceil((rankedSHA256._count.sha256 / maxValue) * 100)
      };
    }
  );
  return packed;
};

export const packTop10Ranking = async (
  rankings: IPrismaRankingCount[],
  field: Prisma.ThreatScalarFieldEnum
) => {
  logger.info('Packing top 10 ranking: ', rankings);
  if (rankings.length === 0) return [];
  const maxValue = rankings[0]._count[field];
  const packed = rankings.map((ranked: IPrismaRankingCount, i: number) => {
    return {
      ranked: i + 1,
      name: ranked[field],
      count: ranked._count[field],
      percentage: Math.ceil((ranked._count[field] / maxValue) * 100)
    };
  });
  return packed;
};

/**
 *
 * @param year Numerical String year, i.e.'2024' instead of 2024
 * @param results
 */

export const arrangeIntoGraphMonthlyCount = (
  monthsToLookBack: number,
  results: IGroupByMonthCount[]
) => {
  const dateLimits = getDateLimitsForLineGraphBasedOnMonthsToLookBack(monthsToLookBack);
  const pooledCount: IPreLineGraphData = buildPooledCountObject(dateLimits, monthsToLookBack);

  results.forEach((result: IGroupByMonthCount) => {
    const monthYr = getMonthYrString(
      result.date_part.toString(),
      monthNumberToAlphabet[result.month as string]
    );

    // get quarantined count for the month
    if (result.status === THREAT_STATUS.QUARANTINED) {
      [(pooledCount[monthYr].quarantined = result.count)];
    }
    // get All Count for each Month
    if (pooledCount[monthYr].all == 0) {
      pooledCount[monthYr].all = result.count;
    } else {
      const prevValue = pooledCount[monthYr].all;
      pooledCount[monthYr].all = prevValue + result.count;
    }
  });

  return pooledCount;
};

const buildPooledCountObject = (dateLimits: IDateLimits, monthsToLookBack: number) => {
  const { date2 } = dateLimits;

  let trackedDate: Date = date2;

  const pooledCount: IPreLineGraphData = {};
  for (monthsToLookBack; monthsToLookBack > 0; monthsToLookBack -= 1) {
    let monthKey: string = '';
    monthKey = formatDate(trackedDate, 'MMM-yy');
    pooledCount[monthKey] = {
      dateForSorting: new Date(trackedDate),
      month: monthKey,
      all: 0,
      quarantined: 0
    };
    trackedDate = subMonths(trackedDate, 1);
  }
  return pooledCount;
};

const getMonthYrString = (year: string, monthAlphabet: string) =>
  monthAlphabet + '-' + year.slice(2);

const monthNumberToAlphabet: { [key: string]: string } = {
  '1': 'Jan',
  '2': 'Feb',
  '3': 'Mar',
  '4': 'Apr',
  '5': 'May',
  '6': 'Jun',
  '7': 'Jul',
  '8': 'Aug',
  '9': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec'
};

export const packAllDistinctThreatsOuterTable = (
  uniqueThreats: IPrismaGetAllDistinctThreatsResult[]
) => {
  const packed = uniqueThreats.map((outerTableThreat: IPrismaGetAllDistinctThreatsResult) => {
    return {
      id: MOCK_ID,
      sha256: outerTableThreat.sha256,
      status: getAssignedStatus(outerTableThreat.status),
      quarantineOrSafe: getQuarantinedORSafeDisplayValue(outerTableThreat.status)
    };
  });
  return packed;
};

const getAssignedStatus = (status: string) =>
  status === THREAT_STATUS.UNASSIGNED ? ASSIGN_STATUS.UNASSIGNED : ASSIGN_STATUS.ASSIGNED;

const getQuarantinedORSafeDisplayValue = (status: string) =>
  status === THREAT_STATUS.UNASSIGNED ? undefined : toFrontEndStatus[status as string];

export const packDistinctQuarantinedOrSafelistedThreatsOuterTable = async (
  uniqueThreats: IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult[]
) => {
  //get  tenant Ids and  Names Hash from Device And Tenant Service
  const tenantIdToNameHash = await getTenantIdToNameHash();

  const packed = uniqueThreats.map(
    (outerTableThreat: IPrismaGetDistinctQuarantinedOrSafelistedThreatsResult) => {
      const appliedToTenantIdArray = JSON.parse(outerTableThreat.appliedTo);
      const appliedTo = appliedToTenantIdArray.map(
        (tenantId: string) => tenantIdToNameHash[tenantId]
      );
      return {
        sha256: outerTableThreat.sha256,
        appliedTo,
        addedOn: convertDateObjToISO8601noTZ(outerTableThreat.addedOn as Date),
        addedBy: outerTableThreat.addedBy,
        reason: outerTableThreat.reason
      };
    }
  );
  return packed;
};

export const arrangeThreatInstancesCountByStatus = (
  countResults: IPrismaGetCountByStatusResult[]
) => {
  type threatStatusCount = {
    [THREAT_STATUS.QUARANTINED]?: number;
    [THREAT_STATUS.SAFELISTED]?: number;
    [THREAT_STATUS.UNASSIGNED]?: number;
  };
  const arranged: threatStatusCount = {};
  countResults.forEach((countResult: IPrismaGetCountByStatusResult) => {
    const statusLabel = countResult.status as
      | THREAT_STATUS.QUARANTINED
      | THREAT_STATUS.SAFELISTED
      | THREAT_STATUS.UNASSIGNED;
    arranged[statusLabel] = countResult._count.status;
  });

  const quarantined = arranged.quarantined || 0;
  const safelisted = arranged.safelisted || 0;
  const unassigned = arranged.unassigned || 0;
  const total = quarantined + safelisted + unassigned;

  return {
    unassigned,
    safelisted,
    quarantined,
    total
  };
};

export const toStoredThreatDetails = async (
  threatFullDetails: IThreatsFullPayload,
  tenantName: string
) => {
  const { global_quarantined, safelisted, sha256, tenantId } = threatFullDetails;
  const { status, reason, addedBy } = await autoAssignThreatInstanceStatus(
    global_quarantined,
    safelisted,
    sha256
  );

  const appliedTo =
    status === THREAT_STATUS.UNASSIGNED ? JSON.stringify([]) : JSON.stringify([tenantId]);

  return {
    dashboardTenantId: threatFullDetails.tenantId,
    tenantName,
    downloadPath: threatFullDetails.downloadPath,
    status,
    appliedTo,
    reason,
    addedBy,
    addedOn: new Date(),
    agentVersion: threatFullDetails.agent_version,
    autoRun: threatFullDetails.auto_run,
    avIndustry: threatFullDetails.av_industry,
    certIssuer: threatFullDetails.cert_issuer,
    certPublisher: threatFullDetails.cert_publisher,
    certTimestamp: convertISO8601noTZtoDateObj(threatFullDetails.cert_timestamp),
    classification: threatFullDetails.classification.toLowerCase(),
    cylanceDeviceId: threatFullDetails.cylance_device_id,
    cylanceScore: new Prisma.Decimal(threatFullDetails.cylance_score),
    detectedBy: threatFullDetails.detected_by,
    deviceName: threatFullDetails.device_name,
    deviceState: threatFullDetails.device_state,
    fileName: threatFullDetails.file_name,
    filePath: threatFullDetails.file_path,
    fileSize: threatFullDetails.file_size,
    fileStatus: threatFullDetails.file_status,
    globalQuarantined: threatFullDetails.global_quarantined,
    safelisted: threatFullDetails.safelisted,
    ipAddresses: JSON.stringify(threatFullDetails.ip_addresses),
    lastFound: convertISO8601noTZtoDateObj(threatFullDetails.last_found),
    macAddresses: JSON.stringify(threatFullDetails.mac_addresses),
    md5: threatFullDetails.md5,
    running: threatFullDetails.running,
    sha256: threatFullDetails.sha256,
    signed: threatFullDetails.signed,
    subClassification: threatFullDetails.sub_classification.toLowerCase(),
    uniqueToCylance: threatFullDetails.unique_to_cylance,
    zones: threatFullDetails.zones
  };
};

export const isISO8601String = (datetime: string) => {
  const iso8601Regex =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(([+-]\d{2}:\d{2}))?$/;
  return iso8601Regex.test(datetime);
};

export const convertISO8601noTZtoDateObj = (iso8601StringNoTimezone: string) => {
  // cylance date format: '2023-10-05T05:50:15', has no timezone
  if (!isISO8601String(iso8601StringNoTimezone))
    throw new Error('Datetime provided is not in ISO8601 string format.');
  // same format needs to be returned to the frontend in string so we concatenate '.000Z'
  // to not change the timezone.
  const dateTimeStringForcedTZ = iso8601StringNoTimezone + '.000Z';
  const datetime = new Date(dateTimeStringForcedTZ);
  return datetime;
};

export const convertDateObjToISO8601noTZ = (dateObject: Date): string => {
  if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
    throw new Error('Invalid Date object');
  }

  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, '0');
  const day = String(dateObject.getDate()).padStart(2, '0');
  const hours = String(dateObject.getHours()).padStart(2, '0');
  const minutes = String(dateObject.getMinutes()).padStart(2, '0');
  const seconds = String(dateObject.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Assigns status based on the instance of the received cylance threat,
 * if global_quarantined and safelisted both are false, checks with
 * the threats db for previously saved threat instance of the same SHA256,
 * and assigns that same status.
 * @param global_quarantined from cylance threat object data
 * @param safelisted from cylance threat object data
 * @param sha256 from cylance threat object data
 * @returns
 */
export const autoAssignThreatInstanceStatus = async (
  global_quarantined: boolean,
  safelisted: boolean,
  sha256: string
) => {
  if (global_quarantined) {
    return { status: THREAT_STATUS.QUARANTINED, reason: 'N.A.', addedBy: DASHBOARD_APP };
  } else {
    if (safelisted) {
      return { status: THREAT_STATUS.SAFELISTED, reason: 'N.A.', addedBy: DASHBOARD_APP };
    } else {
      // check if there is a previous instance of this threat in threat db
      const previouslyAddedThreat =
        await threatMgmtRepository.getPreviouslyAddedInstanceOfThisThreat(sha256);
      if (previouslyAddedThreat && previouslyAddedThreat.status) {
        const { status, reason } = previouslyAddedThreat;
        return { status, reason, addedBy: DASHBOARD_AUTO_ASSIGN };
      }
      return { status: THREAT_STATUS.UNASSIGNED, reason: 'N.A.', addedBy: EMPTY_STRING };
    }
  }
};

export const getPresetDateRange = async (options: IDatePreset) => {
  let dateEnd = new Date();
  let dateStart = new Date();

  switch (options.datePreset) {
    case DATE_PRESET.PAST_3_MONTHS:
      dateStart = new Date(new Date().setMonth(new Date().getMonth() - 3));
      break;
    case DATE_PRESET.PAST_6_MONTHS:
      dateStart = new Date(new Date().setMonth(new Date().getMonth() - 6));
      break;
    case DATE_PRESET.PAST_YEAR:
      dateStart = new Date(new Date().setMonth(new Date().getMonth() - 12));
      break;
    case DATE_PRESET.CUSTOM:
      if (options.startDate && options.endDate) {
        dateStart = options.startDate;
        dateEnd = options.endDate;
      } else {
        logger.error('startDate and endDate are required for custom date range');
      }
      break;
    default:
      logger.info('custom date range selected');
      break;
  }

  return { startDate: dateStart, endDate: dateEnd };
};

export const checkIfDateRangeMoreThan90Days = async (startDate: Date, endDate: Date) => {
  let result = false;
  // (end date - start date) / 1 day = difference in days
  const diffTime = Math.round((endDate.valueOf() - startDate.valueOf()) / (1000 * 60 * 60 * 24));
  logger.info(`Difference in days: ${diffTime}`);
  if (diffTime > 90) {
    result = true;
  }
  return result;
};

export const calculateThreatStatus = (globalQuarantined: boolean, safeListed: boolean) => {
  switch (true) {
    case globalQuarantined && !safeListed:
      return THREAT_STATUS.QUARANTINED;
    case !globalQuarantined && safeListed:
      return THREAT_STATUS.SAFELISTED;
    case !globalQuarantined && !safeListed:
      return THREAT_STATUS.UNASSIGNED;
    default:
      logger.error('getThreatStatus: error in quarantined and safelisted status from Cylance!');
      return THREAT_STATUS.UNASSIGNED;
  }
};
