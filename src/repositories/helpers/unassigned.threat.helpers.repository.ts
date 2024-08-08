import { THREAT_STATUS } from '../../constants/threats.constants';
import { getThreatOR } from './shared.helpers.repository';

export const getUnassignedThreatsWhereConditions = (globalFilter: string | undefined) => {
  if (globalFilter) {
    const ORConditionArray = getThreatOR(globalFilter);
    return {
      AND: [{ status: THREAT_STATUS.UNASSIGNED }, { OR: [...ORConditionArray] }]
    };
  }
  return {
    status: THREAT_STATUS.UNASSIGNED
  };
};
