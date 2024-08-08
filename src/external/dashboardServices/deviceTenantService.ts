import axios from 'axios';
import config from '../../config/config';
import { API_PATH, EXTERNAL_API, EXTERNAL_PATHS, PATH } from '../../constants/routes.constants';
import { IUpdateDeviceThreatCountRequestBody } from '../../interfaces/api.interface';
import { ITenantIdAndName } from '../../interfaces/tenants.interface';

export const updateDeviceUnresolvedAndQuarantinedCount = async (
  updatePayload: IUpdateDeviceThreatCountRequestBody
) => {
  const endpoint = `${config.dashboardDeviceTenant}${API_PATH}${EXTERNAL_API.DEVICES}${EXTERNAL_PATHS.UPDATE_UNRESOLVED_AND_QUARANTINED_COUNTS}`;
  const result = await axios.patch(endpoint, updatePayload, {
    headers: { Authorization: `Bearer ${config.dasboardDeviceTenantSuperAdmin}` }
  });
  return result;
};

export const getAllTenantNamesAndIds = async (): Promise<ITenantIdAndName[]> => {
  const endpoint = `${config.dashboardDeviceTenant}${API_PATH}${EXTERNAL_API.TENANTS}${PATH.ALL}`;
  const result = await axios.get(endpoint, {
    headers: { Authorization: `Bearer ${config.dasboardDeviceTenantSuperAdmin}` }
  });
  if (result.status !== 200) return [];
  return result.data;
};
