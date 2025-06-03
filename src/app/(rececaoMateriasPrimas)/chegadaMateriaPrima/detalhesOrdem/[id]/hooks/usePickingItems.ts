import { useState, useCallback, useMemo } from 'react';
import { ValidatedItem, ItemToValidate, OrdemCompraData } from '../constantsAndTypes/pickingTypes';
import { useDateFormatting } from './useDateFormating';

interface UsePickingItemsProps {
  OrdemCompraData?: OrdemCompraData;
}

interface UsePickingItemsReturn {
  itensValidados: ValidatedItem[];
  itensAValidar: ItemToValidate[];
  quantidadePorReceber: Array<{ ItemCode: string; quantidade: number }>;
  itensPorPickar: number;
  addValidatedItem: (lineNum: number) => void;
  removeValidatedItem: (baseLine: number) => void;
  updateValidatedItemQuantity: (baseLine: number, quantidade: number) => void;
  setItensValidados: React.Dispatch<React.SetStateAction<ValidatedItem[]>>;
}

export const usePickingItems = ({ 
  OrdemCompraData 
}: UsePickingItemsProps): UsePickingItemsReturn => {
  const { getCurrentTimestamp } = useDateFormatting();
  
  const [itensValidados, setItensValidados] = useState<ValidatedItem[]>([
    { ItemCode: "", timestamp: "", quantidade: 0, baseLine: 9999 }
  ]);

  const itensAValidar = useMemo((): ItemToValidate[] => {
    if (!OrdemCompraData?.DocumentLines) return [];
    
    return OrdemCompraData.DocumentLines.map(docLine => ({
      LineNum: docLine.LineNum,
      ItemCode: docLine.ItemCode,
      ItemDescription: docLine.ItemDescription,
    }));
  }, [OrdemCompraData?.DocumentLines]);

  const quantidadePorReceber = useMemo(() => {
    if (!OrdemCompraData?.DocumentLines) return [];
    
    return OrdemCompraData.DocumentLines.map(itemLine => ({
      ItemCode: itemLine.ItemCode,
      quantidade: itemLine.RemainingOpenQuantity,
    }));
  }, [OrdemCompraData?.DocumentLines]);

  const itensPorPickar = useMemo((): number => {
    if (!OrdemCompraData?.DocumentLines) return 0;
    
    return OrdemCompraData.DocumentLines.reduce(
      (contador, docLine) =>
        docLine.LineStatus === "bost_Open" ? contador + 1 : contador,
      0
    );
  }, [OrdemCompraData?.DocumentLines]);

  const addValidatedItem = useCallback((lineNum: number): void => {
    if (!OrdemCompraData?.DocumentLines) return;

    const documentLine = OrdemCompraData.DocumentLines.find(
      itemOrdem => itemOrdem.LineNum === lineNum
    );

    if (!documentLine) return;

    const newItem: ValidatedItem = {
      ItemCode: documentLine.ItemCode,
      timestamp: getCurrentTimestamp(),
      quantidade: documentLine.RemainingOpenQuantity,
      baseLine: lineNum,
    };

    setItensValidados(prev => [...prev, newItem]);
  }, [OrdemCompraData?.DocumentLines, getCurrentTimestamp]);

  const removeValidatedItem = useCallback((baseLine: number): void => {
    setItensValidados(prev => 
      prev.filter(item => item.baseLine !== baseLine)
    );
  }, []);

  const updateValidatedItemQuantity = useCallback((
    baseLine: number, 
    quantidade: number
  ): void => {
    setItensValidados(prev => 
      prev.map(item => 
        item.baseLine === baseLine 
          ? { ...item, quantidade }
          : item
      )
    );
  }, []);

  return {
    itensValidados,
    itensAValidar,
    quantidadePorReceber,
    itensPorPickar,
    addValidatedItem,
    removeValidatedItem,
    updateValidatedItemQuantity,
    setItensValidados
  };
};