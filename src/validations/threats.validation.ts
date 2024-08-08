import Joi from 'joi';
import { DATE_PRESET, RANKING } from '../constants/common.constants';
import { IThreatOverviewPaginationWithDatePreset } from '../interfaces/threats.interfaces';

const md5Validation = Joi.string()
  .allow('')
  .custom((value, helpers) => {
    if (!isMD5(value)) {
      return helpers.error('any.invalid');
    }
    return true;
  });
const sha256Validation = Joi.string().custom((value, helpers) => {
  if (!isSHA256(value)) {
    return helpers.error('any.invalid');
  }
  return true;
});

const paramsSHA256Validation = Joi.string().custom((value, helpers) => {
  if (!isSHA256(value)) {
    return helpers.error('any.invalid');
  }
  return value;
});

const cylanceThreats = Joi.array().items(
  Joi.object({
    agent_version: Joi.string().allow('').required(),
    auto_run: Joi.boolean().required(),
    av_industry: Joi.number().allow(null).required(),
    cert_issuer: Joi.string().allow('', null).required(),
    cert_publisher: Joi.string().allow('', null).required(),
    cert_timestamp: Joi.string().required(),
    classification: Joi.string().allow('').required(),
    cylance_device_id: Joi.string().required(),
    cylance_score: Joi.number().required(),
    detected_by: Joi.string().allow('').required(),
    device_name: Joi.string().allow('').required(),
    device_state: Joi.string().allow('').required(),
    file_name: Joi.string().allow('').required(),
    file_path: Joi.string().allow('').required(),
    file_size: Joi.number().required(),
    file_status: Joi.string().allow('').required(),
    ip_addresses: Joi.array().items(Joi.string()).min(1).required(),
    global_quarantined: Joi.boolean().required(),
    last_found: Joi.string().required(),
    mac_addresses: Joi.array().items(Joi.string()).min(1).required(),
    md5: md5Validation.required(),
    running: Joi.boolean().required(),
    safelisted: Joi.boolean().required(),
    sha256: sha256Validation.required(),
    signed: Joi.boolean().required(),
    sub_classification: Joi.string().allow('').required(),
    unique_to_cylance: Joi.boolean().required(),
    tenantId: Joi.string().required(),
    downloadPath: Joi.string().allow('').required(),
    zones: Joi.array().items(Joi.string().allow('').optional())
  })
);

const cylanceThreatsPayload = Joi.object({ threats: cylanceThreats }).required();

const pageIndexValidation = Joi.number().required();
const pageSizeValidation = Joi.number().required();

// disallow #, @, /, in globalfilter
const globalFilterValidation = Joi.string()
  .allow('')
  .max(50)
  .custom((value, helpers) => {
    if (/([#@/^])\w+/.test(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  });

// Number of sorting items should not exceed number of fields/clomuns for the unassigned threats table
const sortingValidation = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required(),
      desc: Joi.boolean()
    })
  )
  .max(34);

// Regular expression to check if a string is a SHA256 hash
const isSHA256 = (str: string) => {
  return /^[0-9a-f]{64}$/i.test(str);
};

// Regex to check if a string is a valid MD5 Has string
const isMD5 = (str: string) => {
  return /^[a-f0-9]{32}$/gi.test(str);
};

const getUnassignedThreats = {
  body: Joi.object({
    pageIndex: pageIndexValidation.required(),
    pageSize: pageSizeValidation.required(),
    globalFilter: globalFilterValidation.optional(),
    sorting: sortingValidation.required()
  })
};

const getThreatsOuterTableData = {
  body: Joi.object({
    pageIndex: pageIndexValidation.required(),
    pageSize: pageSizeValidation.required(),
    globalFilter: globalFilterValidation.optional()
  })
};

const getThreatsInnerTableData = {
  body: Joi.object({
    sha256: paramsSHA256Validation.required(),
    pageIndex: pageIndexValidation.required(),
    pageSize: pageSizeValidation.required(),
    globalFilter: globalFilterValidation.optional(),
    sorting: sortingValidation.required()
  })
};

const startDateValidation = Joi.alternatives().conditional('datePreset', {
  is: DATE_PRESET.CUSTOM,
  then: Joi.date().iso().required()
});

const endDateValidation = Joi.alternatives().conditional('datePreset', {
  is: DATE_PRESET.CUSTOM,
  then: Joi.date().greater(Joi.ref('startDate')).iso().required()
});

const getThreatsOverviewLineGraphData = {
  body: Joi.object({
    datePreset: Joi.string()
      .valid(
        DATE_PRESET.PAST_3_MONTHS,
        DATE_PRESET.PAST_6_MONTHS,
        DATE_PRESET.PAST_YEAR,
        DATE_PRESET.CUSTOM
      )
      .required(),
    startDate: startDateValidation,
    endDate: endDateValidation
  })
};

const getTop10Ranking = {
  body: Joi.object({
    category: Joi.string().valid(RANKING.THREATS, RANKING.DEVICES, RANKING.ZONES).required(),
    datePreset: Joi.string()
      .valid(
        DATE_PRESET.PAST_3_MONTHS,
        DATE_PRESET.PAST_6_MONTHS,
        DATE_PRESET.PAST_YEAR,
        DATE_PRESET.CUSTOM
      )
      .required(),
    startDate: startDateValidation,
    endDate: endDateValidation
  })
};

const getOverviewPaginationWithDateRange = {
  body: Joi.object<IThreatOverviewPaginationWithDatePreset>().keys({
    datePreset: Joi.string()
      .valid(...Object.values(DATE_PRESET))
      .required(),
    startDate: startDateValidation,
    endDate: endDateValidation,
    pageIndex: pageIndexValidation.required(),
    pageSize: pageSizeValidation.required(),
    sorting: sortingValidation.required()
  })
};

// Number of sorting items should not exceed number of fields/clomuns for the unassigned threats table
// disallow #, @, /, in globalfilter
const postBodyPaginateNoGlobalFilterSingleSort = {
  body: Joi.object({
    pageIndex: pageIndexValidation.required(),
    pageSize: pageSizeValidation.required(),
    sorting: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          desc: Joi.boolean()
        })
      )
      .max(1)
      .required()
  })
};

const updateThreatStatus = {
  body: Joi.object({
    applicableTo: Joi.array().items(Joi.string()).required(),
    reason: Joi.string().allow('').required(),
    sha256: paramsSHA256Validation.required()
  })
};

const downloadFile = {
  params: Joi.object().keys({
    sha256: paramsSHA256Validation.required()
  })
};

const weeklyUpdatedThreatStatus = Joi.object({
  dashboardTenantId: Joi.string().required(),
  global_quarantined: Joi.boolean().required(),
  safelisted: Joi.boolean().required(),
  sha256: sha256Validation.required()
}).required();

export default {
  cylanceThreats,
  cylanceThreatsPayload,
  getUnassignedThreats,
  getThreatsOuterTableData,
  getThreatsInnerTableData,
  getThreatsOverviewLineGraphData,
  getTop10Ranking,
  postBodyPaginateNoGlobalFilterSingleSort,
  updateThreatStatus,
  getOverviewPaginationWithDateRange,
  downloadFile,
  weeklyUpdatedThreatStatus
};
