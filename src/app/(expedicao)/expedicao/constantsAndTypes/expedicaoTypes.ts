export interface LeitorQR {
  status: string;
  value: {
    C1: string;
    C2: string;
    C3: string;
    C4: string;
    C5: string;
    C6: string;
    F: string;
  };
}

export interface BatchNumbersInterface {
  BatchNumber: string;
  Quantity: number;
  ItemCode: string;
}

export interface DocumentLinesInterface {
  BaseEntry: number;
  BaseLine: number;
  BaseType: number;
  Quantity: number;
  BatchNumbers?: BatchNumbersInterface[];
}

export interface BodyInterface {
  CardCode: string;
  DocDate: string;
  DocumentLines: any[];
}

export interface SelectLotesInterface {
  BatchNum: string;
  IsBatchManaged: string;
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  WhsCode: string;
}

export interface DocumentLinesBatchN {
  BaseType: number;
  BaseEntry: number;
  BaseLine: number;
  Quantity: number;
  BatchNumbers?: BatchNumbersInterface[];
}

export interface PrinterState {
  isPrinting: boolean;
  printerError: string | null;
}
