import { MESSAGE_TYPE } from '../constants/messageBus.constants';
import { IUpdateDeviceThreatCount } from '../interfaces/api.interface';
import { IAddToGlobalList } from '../interfaces/cylance.interface';
const updateGlobalList = (messageType: MESSAGE_TYPE, globalListUpdate: IAddToGlobalList) => {
  const now = new Date();
  return {
    type: messageType,
    data: globalListUpdate,
    lastSent: now.toUTCString()
  };
};

const weeklyUpdateDeviceThreatCount = (
  messageType: MESSAGE_TYPE,
  deviceToUpdate: IUpdateDeviceThreatCount
) => {
  const now = new Date();
  return {
    type: messageType,
    payload: deviceToUpdate,
    lastFetched: now.toUTCString()
  };
};

export default {
  updateGlobalList,
  weeklyUpdateDeviceThreatCount
};
