/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';

let _autoTopicCreation: boolean = false;
let _maxInFlightRequests: number = 0;

export function setAutoTopicCreation(value: boolean) {
  _autoTopicCreation = value;
  return _autoTopicCreation;
}
export function setMaxInFlightRequests(value: number) {
  _maxInFlightRequests = value;
  return _maxInFlightRequests;
}
