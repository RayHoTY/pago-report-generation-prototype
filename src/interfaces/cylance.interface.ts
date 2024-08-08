import { CATEGORY, LIST_TYPE } from '../constants/cylance.constants';

export interface IAddToGlobalList {
  sha256: string;
  list_type: LIST_TYPE;
  category: CATEGORY;
  reason: string;
  applicableTo: Array<string>;
}
