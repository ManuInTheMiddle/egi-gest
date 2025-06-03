import { useState, useCallback } from 'react';
import { DocumentLine, DocumentLineBatch, ValidatedItem, GeridoPorLotes, BatchNumber } from '../constantsAndTypes/pickingTypes';
import { SAP_CONFIG } from '../constantsAndTypes/pickingConstants';

interface UseDocumentLinesProps {
  orderId: string | number;
}

interface UseDocumentLinesReturn {
  documentLines: DocumentLine[];
  documentLinesBatch: DocumentLineBatch[];
  documentLinesGlobal: (DocumentLine | DocumentLineBatch)[];
  generateDocumentLines: (
    validatedItems: ValidatedItem[],
    geridoPorLotes: GeridoPorLotes[],
    batchNumbers: BatchNumber[]
  ) => void;
  clearDocumentLines: () => void;
}

export const useDocumentLines = ({ 
  orderId 
}: UseDocumentLinesProps): UseDocumentLinesReturn => {
  const [documentLines, setDocumentLines] = useState<DocumentLine[]>([]);
  const [documentLinesBatch, setDocumentLinesBatch] = useState<DocumentLineBatch[]>([]);
  const [documentLinesGlobal, setDocumentLinesGlobal] = useState<(DocumentLine | DocumentLineBatch)[]>([]);

  const generateDocumentLines = useCallback((
    validatedItems: ValidatedItem[],
    geridoPorLotes: GeridoPorLotes[],
    batchNumbers: BatchNumber[]
  ): void => {
    const validItems = validatedItems.filter(item => item.ItemCode !== "");
    
    // Generate regular document lines (non-batch items)
    const regularLines: DocumentLine[] = validItems
      .filter(item => !geridoPorLotes.find(lote => lote.ItemCode === item.ItemCode))
      .map(item => ({
        BaseEntry: Number(orderId),
        BaseLine: item.baseLine,
        BaseType: SAP_CONFIG.BASE_TYPE,
        Quantity: item.quantidade,
      }));

    // Generate batch document lines
    const batchLines: DocumentLineBatch[] = validItems
      .filter(item => geridoPorLotes.find(lote => lote.ItemCode === item.ItemCode))
      .map(item => {
        const itemBatches = batchNumbers.filter(batch => batch.ItemCode === item.ItemCode);
        return {
          BaseEntry: Number(orderId),
          BaseLine: item.baseLine,
          BaseType: SAP_CONFIG.BASE_TYPE,
          Quantity: item.quantidade,
          BatchNumbers: itemBatches,
        };
      });

    setDocumentLines(regularLines);
    setDocumentLinesBatch(batchLines);
    setDocumentLinesGlobal([...regularLines, ...batchLines]);
  }, [orderId]);

  const clearDocumentLines = useCallback((): void => {
    setDocumentLines([]);
    setDocumentLinesBatch([]);
    setDocumentLinesGlobal([]);
  }, []);

  return {
    documentLines,
    documentLinesBatch,
    documentLinesGlobal,
    generateDocumentLines,
    clearDocumentLines
  };
};