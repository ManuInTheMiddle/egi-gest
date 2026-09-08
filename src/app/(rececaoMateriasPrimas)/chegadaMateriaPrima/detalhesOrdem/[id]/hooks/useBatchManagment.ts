import { useState, useCallback } from "react";
import { BatchNumber, GeridoPorLotes } from "../constantsAndTypes/pickingTypes";

interface UseBatchManagementReturn {
  batchNumbers: BatchNumber[];
  geridoPorLotes: GeridoPorLotes[];
  addBatchNumber: (
    itemCode: string,
    batchNumber: string,
    quantity: number,
    expiryDate: string
  ) => void;
  updateBatchExpiryDate: (
    itemCode: string,
    batchNumber: string,
    expiryDate: string
  ) => void; // Add this
  updateBatchQuantity: (itemCode: string, quantity: number) => void;
  removeBatchNumber: (itemCode: string, batchNumber: string) => void;
  setBatchNumbers: React.Dispatch<React.SetStateAction<BatchNumber[]>>;
  setGeridoPorLotes: React.Dispatch<React.SetStateAction<GeridoPorLotes[]>>;
}

export const useBatchManagement = (): UseBatchManagementReturn => {
  const [batchNumbers, setBatchNumbers] = useState<BatchNumber[]>([]);
  const [geridoPorLotes, setGeridoPorLotes] = useState<GeridoPorLotes[]>([]);

  const addBatchNumber = useCallback(
    (
      itemCode: string,
      batchNumber: string,
      quantity: number,
      expiryDate: string
    ) => {
      setBatchNumbers((prev) => [
        ...prev,
        {
          ItemCode: itemCode,
          BatchNumber: batchNumber,
          Quantity: quantity,
          ExpiryDate: expiryDate,
        },
      ]);
    },
    []
  );

  const updateBatchQuantity = useCallback(
    (itemCode: string, quantity: number): void => {
      setBatchNumbers((prev) =>
        prev.map((batch) =>
          batch.ItemCode === itemCode ? { ...batch, Quantity: quantity } : batch
        )
      );
    },
    []
  );

  const updateBatchExpiryDate = useCallback(
    (itemCode: string, batchNumber: string, expiryDate: string): void => {
      setBatchNumbers((prev) =>
        prev.map((batch) =>
          batch.ItemCode === itemCode && batch.BatchNumber === batchNumber
            ? { ...batch, ExpiryDate: expiryDate }
            : batch
        )
      );
    },
    []
  );

  const removeBatchNumber = useCallback(
    (itemCode: string, batchNumber: string): void => {
      setBatchNumbers((prev) =>
        prev.filter(
          (batch) =>
            !(batch.ItemCode === itemCode && batch.BatchNumber === batchNumber)
        )
      );
    },
    []
  );

  return {
    batchNumbers,
    geridoPorLotes,
    addBatchNumber,
    updateBatchQuantity,
    updateBatchExpiryDate,
    removeBatchNumber,
    setBatchNumbers,
    setGeridoPorLotes,
  };
};
