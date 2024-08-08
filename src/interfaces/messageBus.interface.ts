import { MESSAGE_TYPE } from '../constants/messageBus.constants';
import { IUpdateDeviceThreatCount } from './api.interface';
import { IAddToGlobalList } from './cylance.interface';
import { IThreatsFullPayload, IWeeklyUpdatedThreatStatus } from './threats.interfaces';

export interface IMessageCylanceThreats {
  type: string;
  payload:
    | {
        threats: IThreatsFullPayload[];
      }
    | IWeeklyUpdatedThreatStatus;
  lastFetched: string;
}

export interface IPublishToGateWayMessage {
  type: MESSAGE_TYPE;
  data: IAddToGlobalList;
  lastSent: string;
}

export interface IPublishToDeviceServiceMessage {
  type: MESSAGE_TYPE;
  payload: IUpdateDeviceThreatCount;
  lastFetched: string;
}
