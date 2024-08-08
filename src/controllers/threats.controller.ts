import { Request, Response } from 'express';
import threatService from '../services/threat.service';
import responseBuilder from '../utils/responseBuilder';
import httpStatus from 'http-status';
import { THREAT_STATUS } from '../constants/threats.constants';

const getUnassignedThreats = async (req: Request, res: Response) => {
  try {
    const results = await threatService.getUnassignedThreats(req.body);

    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getUnassignedThreatsSummary = async (_req: Request, res: Response) => {
  try {
    const results = await threatService.getUnassignedThreatsSummary();
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getDistinctQuarantinedSHA256 = async (req: Request, res: Response) => {
  try {
    const results = await threatService.getDistinctQuarantinedSHA256(req.body);
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getAllInstancesOfThisQuaratinedThreat = async (req: Request, res: Response) => {
  try {
    const { sha256, pageIndex, pageSize, globalFilter, sorting } = req.body;
    const paginateFilterAndSearchOptions = { pageIndex, pageSize, globalFilter, sorting };

    const results = await threatService.getAllInstancesOfThisQuaratinedThreat(
      sha256,
      paginateFilterAndSearchOptions
    );
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getQuarantinedThreatsSummary = async (_req: Request, res: Response) => {
  try {
    const results = await threatService.getQuarantinedThreatsSummary();
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getDistinctSafelistedSHA256 = async (req: Request, res: Response) => {
  try {
    const results = await threatService.getDistinctSafelistedSHA256(req.body);
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};
const getAllInstancesOfThisSafelistedThreat = async (req: Request, res: Response) => {
  try {
    const { sha256, pageIndex, pageSize, globalFilter, sorting } = req.body;
    const paginateFilterAndSearchOptions = { pageIndex, pageSize, globalFilter, sorting };
    const results = await threatService.getAllInstancesOfThisSafelistedThreat(
      sha256,
      paginateFilterAndSearchOptions
    );
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getSafelistedThreatsSummary = async (_req: Request, res: Response) => {
  try {
    const results = await threatService.getSafelistedThreatsSummary();
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getAllDistinctSHA256 = async (req: Request, res: Response) => {
  try {
    const results = await threatService.getAllDistinctSHA256(req.body);
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getAllInstancesOfThisThreat = async (req: Request, res: Response) => {
  try {
    const { sha256, pageIndex, pageSize, globalFilter, sorting } = req.body;
    const paginateFilterAndSearchOptions = { pageIndex, pageSize, globalFilter, sorting };
    const results = await threatService.getAllInstancesOfThisThreat(
      sha256,
      paginateFilterAndSearchOptions
    );
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getAllInstancesSummary = async (_req: Request, res: Response) => {
  try {
    const results = await threatService.getAllInstancesSummary();
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getOverviewSummary = async (_req: Request, res: Response) => {
  try {
    const results = await threatService.getOverviewSummary();
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getOverviewLineGraph = async (req: Request, res: Response) => {
  try {
    // const results = await threatService.getOverviewLineGraph(req.body);
    const results = await threatService.getOverviewLineGraphWithDatePreset(req.body);
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getOverviewTop10Ranking = async (req: Request, res: Response) => {
  try {
    const results = await threatService.getOverviewTop10RankingWithDatePreset(req.body);
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getOverviewIncidentsByTenant = async (req: Request, res: Response) => {
  try {
    const results = await threatService.getOverviewIncidentsByTenantWithDatePreset(req.body);
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getOverviewMalware = async (req: Request, res: Response) => {
  try {
    const results = await threatService.getOverviewMalwareWithDatePreset(req.body);
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const downloadThreatFile = async (req: Request, res: Response) => {
  try {
    const { sha256 } = req.params;
    const results = await threatService.downloadThreatFile(sha256);
    results.pipe(res);
    return res;
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const getUnassignedAndQuarantinedCountOfThisDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const results = await threatService.getUnassignedAndQuarantinedCountOfThisDevice(deviceId);
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const markThreatSHAForQuarantine = async (req: Request, res: Response) => {
  try {
    const results = await threatService.updateThreatStatusAndUpdateCylance(
      req.body,
      THREAT_STATUS.QUARANTINED
    );
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

const markThreatSHAForSafelisting = async (req: Request, res: Response) => {
  try {
    const results = await threatService.updateThreatStatusAndUpdateCylance(
      req.body,
      THREAT_STATUS.SAFELISTED
    );
    responseBuilder.buildResponse(res, httpStatus.OK, results);
  } catch (error) {
    if (error instanceof Error) {
      return responseBuilder.buildErrorResponse(res, error);
    }
  }
};

export default {
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
  getOverviewLineGraph,
  getOverviewTop10Ranking,
  getOverviewIncidentsByTenant,
  getOverviewMalware,
  downloadThreatFile,
  getUnassignedAndQuarantinedCountOfThisDevice,
  markThreatSHAForQuarantine,
  markThreatSHAForSafelisting
};
