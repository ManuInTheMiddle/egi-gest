import { useState, useCallback } from 'react';

interface ValidationDate {
  LineNum: number;
  ItemCode: string;
  dataValidade: string;
}

interface UseValidationDatesReturn {
  dataValidadeItensValidados: ValidationDate[];
  updateValidationDate: (lineNum: number, itemCode: string, date: Date) => void;
  getValidationDate: (itemCode: string) => Date;
  setDataValidadeItensValidados: React.Dispatch<React.SetStateAction<ValidationDate[]>>;
}

export const useValidationDates = (): UseValidationDatesReturn => {
  const [dataValidadeItensValidados, setDataValidadeItensValidados] = useState<ValidationDate[]>([
    {
      LineNum: 9999,
      ItemCode: "",
      dataValidade: new Date().toISOString(),
    },
  ]);

  const updateValidationDate = useCallback((
    lineNum: number, 
    itemCode: string, 
    date: Date
  ): void => {
    setDataValidadeItensValidados(prev => {
      const existingIndex = prev.findIndex(item => 
        item.LineNum === lineNum && item.ItemCode === itemCode
      );

      const newEntry: ValidationDate = {
        LineNum: lineNum,
        ItemCode: itemCode,
        dataValidade: date.toISOString(),
      };

      if (existingIndex >= 0) {
        return prev.map((item, index) => 
          index === existingIndex ? newEntry : item
        );
      } else {
        const filtered = prev.filter(item => item.ItemCode !== "");
        return [...filtered, newEntry];
      }
    });
  }, []);

  const getValidationDate = useCallback((itemCode: string): Date => {
    const found = dataValidadeItensValidados.find(item => 
      item.ItemCode === itemCode
    );
    
    return found ? new Date(found.dataValidade) : new Date();
  }, [dataValidadeItensValidados]);

  return {
    dataValidadeItensValidados,
    updateValidationDate,
    getValidationDate,
    setDataValidadeItensValidados
  };
};