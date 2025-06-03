import { useState, useCallback } from 'react';
import { BatchNumber, GeridoPorLotes } from '../constantsAndTypes/pickingTypes';

interface UseBatchManagementReturn {
  batchNumbers: BatchNumber[];
  geridoPorLotes: GeridoPorLotes[];
  addBatchNumber: (itemCode: string, batchNumber: string, quantity?: number) => void;
  updateBatchQuantity: (itemCode: string, quantity: number) => void;
  removeBatchNumber: (itemCode: string, batchNumber: string) => void;
  setBatchNumbers: React.Dispatch<React.SetStateAction<BatchNumber[]>>;
  setGeridoPorLotes: React.Dispatch<React.SetStateAction<GeridoPorLotes[]>>;
}

export const useBatchManagement = (): UseBatchManagementReturn => {
  const [batchNumbers, setBatchNumbers] = useState<BatchNumber[]>([]);
  const [geridoPorLotes, setGeridoPorLotes] = useState<GeridoPorLotes[]>([]);

  const addBatchNumber = useCallback((
    itemCode: string, 
    batchNumber: string, 
    quantity: number = 0
  ): void => {
    setBatchNumbers(prev => {
      const exists = prev.find(batch => 
        batch.ItemCode === itemCode && batch.BatchNumber === batchNumber
      );
      
      if (exists) return prev;
      
      return [...prev, { ItemCode: itemCode, BatchNumber: batchNumber, Quantity: quantity }];
    });

    setGeridoPorLotes(prev => {
      const exists = prev.find(item => item.ItemCode === itemCode);
      if (exists) return prev;
      
      return [...prev, { ItemCode: itemCode, simNao: true }];
    });
  }, []);

  const updateBatchQuantity = useCallback((itemCode: string, quantity: number): void => {
    setBatchNumbers(prev => 
      prev.map(batch => 
        batch.ItemCode === itemCode 
          ? { ...batch, Quantity: quantity }
          : batch
      )
    );
  }, []);

  const removeBatchNumber = useCallback((itemCode: string, batchNumber: string): void => {
    setBatchNumbers(prev => 
      prev.filter(batch => 
        !(batch.ItemCode === itemCode && batch.BatchNumber === batchNumber)
      )
    );
  }, []);

  return {
    batchNumbers,
    geridoPorLotes,
    addBatchNumber,
    updateBatchQuantity,
    removeBatchNumber,
    setBatchNumbers,
    setGeridoPorLotes
  };
};
