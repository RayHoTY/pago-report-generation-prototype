import { Router } from 'express';
import threatsController from '../../controllers/threats.controller';
import { COMPONENT, PATH } from '../../constants/routes.constants';
import validate from '../../middlewares/validate';
import { threatsValidation } from '../../validations';

const threatsRoute = Router();

threatsRoute.route(`${PATH.UNASSIGNED}${COMPONENT.TABLE}`).post(
  // validate(threatsValidation.getUnassignedThreats),
  threatsController.getUnassignedThreats
);

threatsRoute
  .route(`${PATH.UNASSIGNED}${COMPONENT.SUMMARY}`)
  .get(threatsController.getUnassignedThreatsSummary);

threatsRoute.route(`${PATH.QUARANTINED}${COMPONENT.TABLE}`).post(
  // validate(threatsValidation.getThreatsOuterTableData), // TODO: have to re-enable after FE is fixed
  threatsController.getDistinctQuarantinedSHA256
);

threatsRoute.route(`${PATH.QUARANTINED}${COMPONENT.TABLE}${COMPONENT.INNER}`).post(
  // validate(threatsValidation.getThreatsInnerTableData),
  threatsController.getAllInstancesOfThisQuaratinedThreat
);

threatsRoute
  .route(`${PATH.QUARANTINED}${COMPONENT.SUMMARY}`)
  .get(threatsController.getQuarantinedThreatsSummary);

threatsRoute.route(`${PATH.SAFELISTED}${COMPONENT.TABLE}`).post(
  // validate(threatsValidation.getThreatsOuterTableData), // TODO: have to re-enable after FE is fixed
  threatsController.getDistinctSafelistedSHA256
);

threatsRoute.route(`${PATH.SAFELISTED}${COMPONENT.TABLE}${COMPONENT.INNER}`).post(
  // validate(threatsValidation.getThreatsInnerTableData), // TODO: have to re-enable after FE is fixed
  threatsController.getAllInstancesOfThisSafelistedThreat
);

threatsRoute
  .route(`${PATH.SAFELISTED}${COMPONENT.SUMMARY}`)
  .get(threatsController.getSafelistedThreatsSummary);

threatsRoute.route(`${PATH.ALL}${COMPONENT.TABLE}`).post(
  // validate(threatsValidation.getThreatsOuterTableData), // TODO: have to re-enable after FE is fixed
  threatsController.getAllDistinctSHA256
);

threatsRoute.route(`${PATH.ALL}${COMPONENT.TABLE}${COMPONENT.INNER}`).post(
  // validate(threatsValidation.getThreatsInnerTableData), // TODO: have to re-enable after FE is fixed
  threatsController.getAllInstancesOfThisThreat
);

threatsRoute.route(`${PATH.ALL}${COMPONENT.SUMMARY}`).get(threatsController.getAllInstancesSummary);

threatsRoute
  .route(`${PATH.OVERVIEW}${COMPONENT.SUMMARY}`)
  .get(threatsController.getOverviewSummary);

threatsRoute
  .route(`${PATH.OVERVIEW}${COMPONENT.GRAPH_LINE}`)
  .post(
    validate(threatsValidation.getThreatsOverviewLineGraphData),
    threatsController.getOverviewLineGraph
  );

threatsRoute
  .route(`${PATH.OVERVIEW}${COMPONENT.RANKING}`)
  .post(validate(threatsValidation.getTop10Ranking), threatsController.getOverviewTop10Ranking);

threatsRoute
  .route(`${PATH.OVERVIEW}${COMPONENT.INCIDENTS}`)
  .post(
    validate(threatsValidation.getOverviewPaginationWithDateRange),
    threatsController.getOverviewIncidentsByTenant
  );

threatsRoute
  .route(`${PATH.OVERVIEW}${COMPONENT.MALWARE}`)
  .post(
    validate(threatsValidation.getOverviewPaginationWithDateRange),
    threatsController.getOverviewMalware
  );

threatsRoute
  .route(`${PATH.DOWNLOAD}/:sha256`)
  .get(validate(threatsValidation.downloadFile), threatsController.downloadThreatFile);

threatsRoute
  .route(`${PATH.COUNTS}${PATH.UNASSIGNED_AND_QUARANTINED}/:deviceId`)
  .get(threatsController.getUnassignedAndQuarantinedCountOfThisDevice);

threatsRoute.route(`${PATH.OVERVIEW}${COMPONENT.MALWARE}`).post(
  // validate(threatsValidation.getOverviewPaginationWithDateRange),
  threatsController.getOverviewMalware
);

threatsRoute
  .route(`${PATH.MARK_QUARANTINE}`)
  .patch(
    // validate(threatsValidation.updateThreatStatus),
    threatsController.markThreatSHAForQuarantine
  );

threatsRoute.route(`${PATH.MARK_SAFE}`).patch(
  //validate(threatsValidation.updateThreatStatus),
  threatsController.markThreatSHAForSafelisting
);
export default threatsRoute;
