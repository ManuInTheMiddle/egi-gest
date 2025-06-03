import { useCallback } from 'react';
import { ValidatedItem, OrdemCompraData } from '../constantsAndTypes/pickingTypes';
import { generateLabelZPL } from '../utils/zplUtils';
import { formatDate } from '../utils/dateUtils';

interface UseLabelGenerationProps {
  ordemCompraData?: OrdemCompraData;
  batchNumber: string;
}

interface UseLabelGenerationReturn {
  generateLabels: (
    validatedItems: ValidatedItem[],
    validationDates: Array<{ ItemCode: string; dataValidade: string }>
  ) => string[];
}

export const useLabelGeneration = ({ 
  ordemCompraData, 
  batchNumber 
}: UseLabelGenerationProps): UseLabelGenerationReturn => {
  
  const generateLabels = useCallback((
    validatedItems: ValidatedItem[],
    validationDates: Array<{ ItemCode: string; dataValidade: string }>
  ): string[] => {
    if (!ordemCompraData) return [];

    const validItems = validatedItems.filter(item => item.ItemCode !== "");
    
    return validItems.map(item => {
      const documentLine = ordemCompraData.DocumentLines.find(
        line => line.ItemCode === item.ItemCode
      );
      
      const validationDate = validationDates.find(
        date => date.ItemCode === item.ItemCode
      );

      if (!documentLine || !validationDate) return "";

      return generateLabelZPL({
        itemCode: item.ItemCode,
        description: documentLine.ItemDescription,
        docEntry: documentLine.DocEntry,
        batchNumber,
        validityDate: validationDate.dataValidade,
        cardCode: ordemCompraData.CardCode,
        currentDate: new Date().toISOString()
      });
    }).filter(label => label !== "");
  }, [ordemCompraData, batchNumber]);

  return { generateLabels };
};