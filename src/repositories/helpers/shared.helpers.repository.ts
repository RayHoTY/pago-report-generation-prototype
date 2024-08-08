import { Prisma } from '@prisma/client';
import { INSENSITIVE, ORDER_BY, RAW_QUERY } from '../../constants/prisma.constants';
import { ISorting } from '../../interfaces/api.interface';
import { IPrismaOrderBy } from '../../interfaces/prisma.interface';
import { subMonths } from 'date-fns';
import logger from '../../logs/logger';

/**
 * only makes single sort condition
 */
export const getPrismaSqlSortFieldAndDirection = (sorting: ISorting[]) => {
  if (sorting.length === 0) {
    return {
      field: Prisma.sql([`"${RAW_QUERY.TENANT_NAME}"`]),
      direction: Prisma.sql([ORDER_BY.ASC])
    };
  }
  const { id, desc } = sorting[0];

  return {
    field: Prisma.sql([`"${id}"`]),
    direction: Prisma.sql([`${desc === true ? ORDER_BY.DESC : ORDER_BY.ASC}`])
  };
};

// TODO: UNSAFE method because of string concatenation.
/**
 * makes  multiple and single sorting conditions
 *
 */
export const buildSortConditionForRawQuery = (sortingConditions: ISorting[]) => {
  let builtString: string = 'ORDER BY ';

  for (let i = 0; i < sortingConditions.length; i += 1) {
    const fieldName = sortingConditions[i].id;
    const direction = sortingConditions[i].desc === true ? ORDER_BY.DESC : ORDER_BY.ASC;
    // let thisConditionString = '"' + fieldName + '"' + ' ' + direction;
    let thisConditionString = `"${fieldName}" ${direction}`;
    if (i > 0) {
      thisConditionString = ',' + ' ' + thisConditionString;
    }
    builtString = builtString + thisConditionString;
  }

  return builtString;
};

// TODO: sharper conversion to get exact times now.
export const getDateLimitsForLineGraphBasedOnMonthsToLookBack = (numberOfMonths: number) => {
  const today = new Date();
  const startDate = subMonths(today, numberOfMonths);
  return {
    date1: startDate,
    date2: today
  };
};

/**
 * Based on current date get query date limits to search for current Month threats
 */
export const getDateLimitsForThisMonth = () => {
  const now = new Date();
  const thisYear = now.getFullYear().toString();
  const thisMonth =
    now.getMonth() < 10 ? (now.getMonth() + 1).toString() : '0' + (now.getMonth() + 1).toString();
  const nextMonth =
    now.getMonth() < 10 ? (now.getMonth() + 2).toString() : '0' + (now.getMonth() + 2).toString();

  return {
    dateObjDay1ThisMonth: new Date(thisYear + '-' + thisMonth + '-' + '01'),
    dateObjDay1NextMonth: new Date(thisYear + '-' + nextMonth + '-' + '01')
  };
};

export const getWhereConditionsForAllThreats = (
  globalFilter: string | undefined,
  sha256: string
) => {
  if (globalFilter) {
    const ORConditionArray = getThreatOR(globalFilter);
    return {
      AND: [{ sha256 }, { OR: [...ORConditionArray] }]
    };
  }
  return {
    sha256
  };
};

export const getWhereConditionsForQuarantinedOrSafelistedThreats = (
  globalFilter: string | undefined,
  threatStatus: string,
  sha256: string
) => {
  if (globalFilter) {
    const ORConditionArray = getThreatOR(globalFilter);
    return {
      AND: [{ status: threatStatus }, { sha256 }, { OR: [...ORConditionArray] }]
    };
  }
  return {
    status: threatStatus,
    sha256
  };
};

export const getThreatOR = (searchItem: string) => {
  // TODO: controlled by interface types for threat details shape.
  const threatDetailStrings = [
    'addedBy',
    'agentVersion',
    'certPublisher',
    'classification',
    'detectedBy',
    'deviceName',
    'deviceState',
    'fileName',
    'filePath',
    'fileStatus',
    'reason',
    'sha256',
    'subClassification',
    'tenantName',
    'ipAddresses',
    'macAddresses'
  ];

  const threatDetailBooleans = [
    'autoRun',
    'globalQuarantined',
    'running',
    'safelisted',
    'signed',
    'uniqueToCylance'
  ];

  logger.info(`getThreatOR isNumericalString = ${isNumericalString(searchItem)}`);
  logger.info(`getThreatOR isBooleanString = ${isBooleanString(searchItem)}`);

  // TODO: confirm with product owner of global search feature.
  if (isBooleanString(searchItem)) {
    const boolean = searchItem === 'true' ? true : false;
    return buildORArrayForNumbersAndBooleans(threatDetailBooleans, boolean);
  }

  // include ORterms for fields which are string arrays
  return buildORArrayForStrings(threatDetailStrings, 'contains', searchItem);
};

// TODO: UNIFY logic for deciding if search term is a
// numerical string, or a partial ip address or MAC address
// or plain string
const isNumericalString = (searchItem: string) => {
  return (
    isIntegerOrDecimalRegex(searchItem) &&
    !isNaN(parseFloat(searchItem)) &&
    isFinite(Number(searchItem))
  );
};

const isIntegerOrDecimalRegex = (searchItem: string) => {
  return /^-?[0-9]\d*(\.\d+)?$/.test(searchItem);
};

const isBooleanString = (searchItem: string) => {
  return searchItem === 'true' || searchItem === 'false';
};

const buildORArrayForStrings = (fields: string[], condition: string, searchItem: string) => {
  const orFilters = fields.map((field: string) => {
    return {
      [field]: {
        [condition]: searchItem,
        mode: INSENSITIVE
      }
    };
  });
  return orFilters;
};

const buildORArrayForNumbersAndBooleans = (fields: string[], searchItem: number | boolean) => {
  const orFilters = fields.map((field: string) => {
    return {
      [field]: searchItem
    };
  });
  return orFilters;
};

export const buildSortingTermsArray = (sorting: ISorting[]) => {
  const prismaSortByArray: IPrismaOrderBy[] = sorting.map((sortTerm: ISorting) => {
    const { id, desc } = sortTerm;
    const sortBy = desc ? ORDER_BY.DESCENDING : ORDER_BY.ASCENDING;
    return { [id]: sortBy };
  });
  return prismaSortByArray;
};
