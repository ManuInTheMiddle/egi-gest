import { useState, useCallback } from "react";
import {
  DocumentLine,
  DocumentLineBatch,
  ValidatedItem,
  GeridoPorLotes,
  BatchNumber,
} from "../constantsAndTypes/pickingTypes";
import { SAP_CONFIG } from "../constantsAndTypes/pickingConstants";

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
  orderId,
}: UseDocumentLinesProps): UseDocumentLinesReturn => {
  const [documentLines, setDocumentLines] = useState<DocumentLine[]>([]);
  const [documentLinesBatch, setDocumentLinesBatch] = useState<
    DocumentLineBatch[]
  >([]);
  const [documentLinesGlobal, setDocumentLinesGlobal] = useState<
    (DocumentLine | DocumentLineBatch)[]
  >([]);

  const generateDocumentLines = useCallback(
    (
      validatedItems: ValidatedItem[],
      geridoPorLotes: GeridoPorLotes[],
      batchNumbers: BatchNumber[]
    ): void => {
      // DEBUG: Log all input parameters
      console.log("🔍 DEBUG - generateDocumentLines called with:");
      console.log("validatedItems:", validatedItems);
      console.log("geridoPorLotes:", geridoPorLotes);
      console.log("batchNumbers:", batchNumbers);

      const validItems = validatedItems.filter((item) => item.ItemCode !== "");
      console.log("🔍 DEBUG - validItems after filtering:", validItems);

      // Generate regular document lines (non-batch items)
      const regularLines: DocumentLine[] = validItems
        .filter((item) => {
          const isBatchManaged = geridoPorLotes.find(
            (lote) => lote.ItemCode === item.ItemCode
          );
          console.log(
            `🔍 DEBUG - Item ${item.ItemCode} is batch managed:`,
            !!isBatchManaged
          );
          return !isBatchManaged;
        })
        .map((item) => ({
          BaseEntry: Number(orderId),
          BaseLine: item.baseLine,
          BaseType: SAP_CONFIG.BASE_TYPE,
          Quantity: item.quantidade,
          WarehouseCode: "A1",
        }));

      // Generate batch document lines
      const batchLines: DocumentLineBatch[] = validItems
        .filter((item) => {
          const isBatchManaged = geridoPorLotes.find(
            (lote) => lote.ItemCode === item.ItemCode
          );
          console.log(
            `🔍 DEBUG - Item ${item.ItemCode} will be processed as batch:`,
            !!isBatchManaged
          );
          return !!isBatchManaged;
        })
        .map((item) => {
          const itemBatches = batchNumbers.filter(
            (batch) => batch.ItemCode === item.ItemCode
          );
          console.log(
            `🔍 DEBUG - Batches found for ${item.ItemCode}:`,
            itemBatches
          );

          return {
            BaseEntry: Number(orderId),
            BaseLine: item.baseLine,
            BaseType: SAP_CONFIG.BASE_TYPE,
            Quantity: item.quantidade,
            WarehouseCode: "A1",
            BatchNumbers: itemBatches,
          };
        });

      console.log("🔍 DEBUG - Final results:");
      console.log("regularLines:", regularLines);
      console.log("batchLines:", batchLines);
      console.log("combined:", [...regularLines, ...batchLines]);

      setDocumentLines(regularLines);
      setDocumentLinesBatch(batchLines);
      setDocumentLinesGlobal([...regularLines, ...batchLines]);
    },
    [orderId]
  );

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
    clearDocumentLines,
  };
};
