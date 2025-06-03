// src/types/picking.ts
export interface BatchNumber {
  BatchNumber: string;
  Quantity: number;
  ItemCode: string;
}

export interface DocumentLine {
  BaseEntry: number;
  BaseLine: number;
  BaseType: number;
  Quantity: number;
}

export interface DocumentLineBatch extends DocumentLine {
  BatchNumbers: BatchNumber[];
}

export interface ValidatedItem {
  ItemCode: string;
  timestamp: string;
  quantidade: number;
  baseLine: number;
}

export interface PickingState {
  success: boolean;
  alert: boolean;
  error: boolean;
}

export interface ItemToValidate {
  LineNum: number;
  ItemCode: string;
  ItemDescription: string;
}

export interface QRData {
  C1: string;
  C2: string;
  C3: string;
  C4: string;
  C5: string;
  C6: string;
  F: string;
}

export interface GeridoPorLotes {
  ItemCode: string;
  simNao: boolean;
}

export interface OrdemCompraDocumentLine {
  LineNum: number;
  ItemCode: string;
  ItemDescription: string;
  RemainingOpenQuantity: number;
  LineStatus: string;
  Quantity: number;
  DocEntry: number;
}

export interface OrdemCompraData {
  DocumentLines: OrdemCompraDocumentLine[];
  CardCode: string;
  DocEntry: number;
}
