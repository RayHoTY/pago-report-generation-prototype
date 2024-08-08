export interface ILineGraphData {
  dateForSorting: Date;
  month: string;
  all: number;
  quarantined: number;
}

export interface IPreLineGraphData {
  [key: string]: ILineGraphData;
}
