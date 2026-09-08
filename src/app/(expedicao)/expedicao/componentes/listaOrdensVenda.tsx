"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import SalesOrderCard from "./SalesOrderCard";
import { useLoteModalFlow } from "../hooks/useModalLoteFlow";
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import { Skeleton } from "@/components/ui/skeleton";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
import PaginationControls from "./PaginationControls";
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  Printer,
  ClipboardList,
  Trash2,
  PlusCircle,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { produce } from "immer";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import useWebSocket from "react-use-websocket";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from "./LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useFetchOrdensVendaSAPData } from "@/Services/OrdensVenda/fetchOrdensVendaSAP";
import { useFetchQuantidadeArtigoLote } from "@/Services/LotesPorArtigo/fetchQuantidadeArtigoLote";
import { useCriarGuiaRemessaSAP } from "@/Services/GuiasRemessa/criarGuiaRemessa";
import { Document } from "@/Services/OrdensVenda/fetchOrdensVendaSAP";

//types
import { LeitorQR } from "../constantsAndTypes/expedicaoTypes";
import { BatchNumbersInterface } from "../constantsAndTypes/expedicaoTypes";
import { DocumentLinesInterface } from "../constantsAndTypes/expedicaoTypes";
import { BodyInterface } from "../constantsAndTypes/expedicaoTypes";
import { SelectLotesInterface } from "../constantsAndTypes/expedicaoTypes";
import { DocumentLinesBatchN } from "../constantsAndTypes/expedicaoTypes";
import { PrinterState } from "../constantsAndTypes/expedicaoTypes";

// Constants
import { EGIQUIMICA_LOGO_ZPL } from "../constantsAndTypes/expedicaoConstants";
import { WEBSOCKET_URL } from "../constantsAndTypes/expedicaoConstants";
import { PAGE_SIZE } from "../constantsAndTypes/expedicaoConstants";

interface QuickQuantityModalProps {
  loteModalState: any;
  loteActions: any;
  onConfirm: (quantity: number, matchedItem: any) => void;
}

const QuickQuantityModal: React.FC<QuickQuantityModalProps> = ({
  loteModalState,
  loteActions,
  onConfirm,
}) => {
  const [localQuantity, setLocalQuantity] = useState(1);

  // Update local quantity when modal opens
  useEffect(() => {
    if (loteModalState.quickModal.isOpen) {
      setLocalQuantity(loteModalState.quickModal.quantity);
    }
  }, [loteModalState.quickModal.isOpen, loteModalState.quickModal.quantity]);

  // Don't render if not open or no matched item
  if (
    !loteModalState.quickModal.isOpen ||
    !loteModalState.quickModal.matchedItem
  ) {
    return null;
  }

  const { matchedItem, isSubmitting } = loteModalState.quickModal;

  const handleConfirm = () => {
    if (localQuantity > 0) {
      onConfirm(localQuantity, matchedItem);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && localQuantity > 0) {
      handleConfirm();
    } else if (e.key === "Escape") {
      loteActions.closeQuickModal();
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={() => loteActions.closeQuickModal()}>
      <AlertDialogContent className="w-96">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            🏷️ Lote Digitalizado
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              {/* Informação do item */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Item:</span>
                    <span className="font-bold">{matchedItem.itemCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Descrição:
                    </span>
                    <span className="text-right text-xs">
                      {matchedItem.itemName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Lote:</span>
                    <span className="font-bold text-blue-600">
                      {matchedItem.batchNumber}
                    </span>
                  </div>
                  {matchedItem.expiryDate && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Validade:
                      </span>
                      <span>{matchedItem.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Input de quantidade */}
              <div className="space-y-3">
                <Label
                  htmlFor="quick-quantity"
                  className="text-base font-medium"
                >
                  Quantidade:
                </Label>
                <Input
                  id="quick-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={localQuantity}
                  onChange={(e) => setLocalQuantity(Number(e.target.value))}
                  onKeyDown={handleKeyDown}
                  className="text-2xl font-bold text-center h-12"
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>

              {/* Feedback visual */}
              <div className="text-center text-sm text-gray-500">
                Pressione{" "}
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd>{" "}
                para confirmar
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel
            onClick={() => loteActions.closeQuickModal()}
            disabled={isSubmitting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={localQuantity <= 0 || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                A processar...
              </div>
            ) : (
              "Confirmar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Utility functions
const isJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

const extractDetails = (
  documentLine: any,
  corpoDocumentoOrdemVenda: Document[],
  numeroOrdemVenda: number
) => {
  if (documentLine?.BatchNumbers && documentLine?.BatchNumbers.length > 0) {
    return {
      itemCode: documentLine.BatchNumbers[0].ItemCode,
      quantity: documentLine.BatchNumbers[0].Quantity,
      batchNumber: documentLine.BatchNumbers[0].BatchNumber,
    };
  } else {
    const document = corpoDocumentoOrdemVenda.find(
      (item) => item.DocEntry === numeroOrdemVenda
    );
    const documentLineOrdemVenda = document?.DocumentLines.find(
      (item) => item.LineNum === documentLine?.BaseLine
    );

    return {
      itemCode: documentLineOrdemVenda?.ItemCode,
      quantity: documentLine?.Quantity,
      batchNumber: "---",
    };
  }
};

// Custom hooks
const usePagination = () => {
  const [numeroPagina, setNumeroPagina] = useState(0);

  const handlePaginaSeguinte = useCallback(() => {
    setNumeroPagina((prev) => prev + PAGE_SIZE);
  }, []);

  const handlePaginaAnterior = useCallback(() => {
    setNumeroPagina((prev) => Math.max(0, prev - PAGE_SIZE));
  }, []);

  const handlePrimeiraPagina = useCallback(() => {
    setNumeroPagina(0);
  }, []);

  return {
    numeroPagina,
    handlePaginaSeguinte,
    handlePaginaAnterior,
    handlePrimeiraPagina,
  };
};

const useDocumentLines = () => {
  const [documentLines, setDocumentLines] = useState<DocumentLinesInterface[]>(
    []
  );
  const [documentLinesBatchN, setDocumentLinesBatchN] = useState<
    DocumentLinesBatchN[]
  >([]);

  const clearDocumentLines = useCallback(() => {
    setDocumentLines([]);
    setDocumentLinesBatchN([]);
  }, []);

  const updateDocumentLineQuantity = useCallback(
    (baseLine: number, baseEntry: number, quantity: number) => {
      // Add validation
      if (quantity < 0) return;

      setDocumentLines((prev) =>
        produce(prev, (draft) => {
          const existingIndex = draft.findIndex(
            (line) => line.BaseLine === baseLine
          );

          if (existingIndex === -1) {
            draft.push({
              BaseEntry: baseEntry,
              BaseLine: baseLine,
              BaseType: 17,
              Quantity: quantity,
            });
          } else {
            draft[existingIndex].Quantity = quantity;
          }
        })
      );
    },
    []
  );

  const addDocumentLineBatch = useCallback(
    (
      baseEntry: number,
      baseLine: number,
      batchNumbers: BatchNumbersInterface[]
    ) => {
      const totalQuantity = batchNumbers.reduce(
        (acc, batch) => acc + batch.Quantity,
        0
      );

      setDocumentLinesBatchN((prev) =>
        produce(prev, (draft) => {
          // Remove existing line with same BaseLine to avoid duplicates
          const existingIndex = draft.findIndex(
            (line) => line.BaseLine === baseLine
          );
          if (existingIndex !== -1) {
            draft.splice(existingIndex, 1);
          }

          draft.push({
            BaseEntry: baseEntry,
            BaseLine: baseLine,
            BaseType: 17,
            Quantity: totalQuantity,
            BatchNumbers: batchNumbers,
          });
        })
      );
    },
    []
  );

  return {
    documentLines,
    documentLinesBatchN,
    clearDocumentLines,
    updateDocumentLineQuantity,
    addDocumentLineBatch,
  };
};

const usePrinter = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerError, setPrinterError] = useState<string | null>(null);

  const imprimirEtiqueta = useCallback(async (informacaoEtiqueta: string) => {
    if (!informacaoEtiqueta) {
      setPrinterError("No label information provided");
      return;
    }

    setIsPrinting(true);
    setPrinterError(null);

    try {
      const browserPrint = new ZebraBrowserPrintWrapper();
      const foundPrinter = await browserPrint.getAvailablePrinters();

      if (foundPrinter.length === 0) {
        throw new Error("No printers found");
      }

      await browserPrint.setPrinter(foundPrinter[0]);
      const printerStatus = await browserPrint.checkPrinterStatus();

      if (printerStatus.isReadyToPrint) {
        await browserPrint.print(informacaoEtiqueta);
      } else {
        throw new Error(
          `Printer not ready: ${String(
            printerStatus.errors || "Unknown error"
          )}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown printing error";
      setPrinterError(errorMessage);
      console.error("Error printing label:", error);
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return { imprimirEtiqueta, isPrinting, printerError };
};

// Main component
const ListaOrdensVenda: React.FC = () => {
  const { numeroPagina, handlePaginaSeguinte, handlePaginaAnterior } =
    usePagination();
  const { imprimirEtiqueta, isPrinting, printerError } = usePrinter();

  const {
    state: loteModalState,
    actions: loteActions,
    computed: loteComputed,
  } = useLoteModalFlow();
  const {
    documentLines,
    documentLinesBatchN,
    clearDocumentLines,
    updateDocumentLineQuantity,
    addDocumentLineBatch,
  } = useDocumentLines();

  // State
  const [cardCode, setCardCode] = useState("");
  const [docDate, setDocDate] = useState("");
  const [body, setBody] = useState<BodyInterface>();
  const [validouValores, setValidouValores] = useState(false);
  const [pickagemOrdemVenda, setPickagemOrdemProducao] = useState(0);
  const [abrirModalPickagem, setAbrirModalPickagem] = useState(false);

  // API hooks
  const guiaRemessaSAPmutation = useCriarGuiaRemessaSAP();
  const datahora = useMemo(() => new Date(), []);
  const ordensVendaSAP = useFetchOrdensVendaSAPData(
    format(new Date(datahora.getFullYear(), 0, 1), "yyyy-MM-dd"),
    numeroPagina
  );
  const quantidadePorLote = useFetchQuantidadeArtigoLote(
    loteModalState.currentItem.artigo || ""
  );

  // WebSocket
  // Minimal fix to get your current order scanning working:
  const determineQRType = (qrData: any): "order" | "lote" | "unknown" => {
    const typeField = qrData.payload?.parsed?.F;

    if (typeField === "ordemvenda") {
      return "order";
    }

    // ADD "MateriaPrima" to this list
    if (
      typeField === "lote" ||
      typeField === "batch" ||
      typeField === "item" ||
      typeField === "produto" ||
      typeField === "MateriaPrima" // ADD THIS
    ) {
      return "lote";
    }

    return "unknown";
  };

  const parseOrderQR = (qrData: any): number | null => {
    try {
      // Your structure: payload.parsed.C2 contains the order number
      const orderNumber = Number(qrData.payload.parsed.C2);

      if (!qrData.payload?.parsed?.C2 || isNaN(orderNumber)) {
        return null;
      }

      return orderNumber;
    } catch (error) {
      console.error("Error parsing order QR:", error);
      return null;
    }
  };

  const findMatchingOrderLine = useCallback(
    (qrData: any, orderLines: any[]) => {
      if (!qrData || !orderLines || orderLines.length === 0) {
        return null;
      }

      // Try to match by ItemCode first (most reliable)
      let matchedLine = orderLines.find(
        (line) => line.ItemCode === qrData.itemCode
      );

      // If no match by ItemCode, try by ItemName/Description
      if (!matchedLine && qrData.itemName) {
        matchedLine = orderLines.find(
          (line) =>
            line.ItemDescription === qrData.itemName ||
            line.ItemDescription?.toLowerCase().includes(
              qrData.itemName.toLowerCase()
            )
        );
      }

      // REMOVED: Additional validation for remaining quantity
      // if (matchedLine && matchedLine.RemainingOpenQuantity <= 0) {
      //   console.warn("⚠️ Item found but no remaining quantity:", matchedLine);
      //   return null;
      // }

      return matchedLine;
    },
    []
  );

  const parseLoteQR = (qrData: any) => {
    try {
      const parsed = qrData.payload?.parsed;

      if (!parsed) {
        return null;
      }

      const parseValidity = (validityField: string) => {
        if (validityField === "NAvalidade" || validityField === "NA") {
          return ""; // No validity date
        }
        // Add logic to parse actual date if it's in a different format
        return validityField;
      };

      // UPDATE: Map to your new structure
      const itemCode = parsed.C1; // "214/5"
      const itemName = parsed.C2; // "H2 DET-M Lava Louça Manual Limão - 5 Lts"
      const optionalField = parsed.C3; // "NA"
      const batchNumber = parsed.C4; // "214/525006069"
      const validity = parsed.C5; // "NAvalidade"

      // Validate required fields
      if (!itemCode || !batchNumber) {
        console.error("Missing required lote fields in QR:", parsed);
        return null;
      }

      return {
        itemCode: itemCode,
        itemName: itemName,
        batchNumber: batchNumber,
        expiryDate: validity === "NAvalidade" ? "" : validity, // Handle your validity format
        manufacturingDate: "", // Not provided in your structure
        quantity: 0, // Not provided in your structure
        optionalField: optionalField,
      };
    } catch (error) {
      console.error("Error parsing lote QR:", error);
      return null;
    }
  };

  const handleOrderQRScan = useCallback(
    (qrData: any) => {
      const orderNumber = parseOrderQR(qrData);

      if (!orderNumber) {
        console.error("Failed to parse order number from QR");
        return;
      }

      console.log("📦 Order QR scanned:", orderNumber);

      // Your existing order QR logic (this was already working)
      setPickagemOrdemProducao(orderNumber);

      const ordemEncontrada = ordensVendaSAP.data?.value.find(
        (ordemVenda) => ordemVenda.DocEntry === orderNumber
      );

      if (ordemEncontrada) {
        setAbrirModalPickagem(true);
        setCardCode(ordemEncontrada.CardCode);
        setDocDate(format(datahora.toISOString(), "yyyyMMdd"));
        console.log("✅ Order found and modal opened");
      } else {
        console.error("❌ Order not found:", orderNumber);
      }
    },
    [ordensVendaSAP.data, datahora]
  );

  const handleLoteQRScan = useCallback(
    (qrData: any) => {
      console.log("🏷️ Lote QR scan attempt:", qrData);

      const loteData = parseLoteQR(qrData);

      if (!loteData) {
        // If we're in manual QR mode, show error
        if (loteModalState.qrScanState.isScanning) {
          loteActions.handleQRScanError(
            "Código QR de lote inválido: campos obrigatórios em falta"
          );
        }
        return;
      }

      console.log("✅ Lote QR parsed successfully:", loteData);

      // Check if we have an active order
      const currentOrder = ordensVendaSAP.data?.value.find(
        (order) => order.DocEntry === pickagemOrdemVenda
      );

      if (!currentOrder?.DocumentLines) {
        if (loteModalState.qrScanState.isScanning) {
          loteActions.handleQRScanError(
            "Nenhuma ordem ativa para validar. Por favor, selecione uma ordem primeiro."
          );
        }
        return;
      }

      // NEW: Try auto-detection if not in manual QR mode
      if (!loteModalState.qrScanState.isScanning) {
        const matchedLine = findMatchingOrderLine(
          loteData,
          currentOrder.DocumentLines
        );

        if (matchedLine) {
          console.log("🎯 Auto-match encontrada:", matchedLine);

          // Open quick modal
          loteActions.openQuickModal({
            itemCode: matchedLine.ItemCode,
            itemName: matchedLine.ItemDescription,
            lineNum: matchedLine.LineNum,
            batchNumber: loteData.batchNumber,
            expiryDate: loteData.expiryDate,
            manufacturingDate: loteData.manufacturingDate,
          });
          return;
        } else {
          console.warn(
            "❌ Item não encontrado na ordem atual:",
            loteData.itemCode
          );
          // Could show a toast notification here
          return;
        }
      }

      // Original manual QR logic (when in QR scanning mode)
      loteActions.handleQRScanSuccess(loteData);
      loteActions.validateQRAgainstOrder(currentOrder.DocumentLines);
    },
    [
      loteActions,
      ordensVendaSAP.data,
      pickagemOrdemVenda,
      findMatchingOrderLine,
      loteModalState.qrScanState.isScanning,
    ]
  );

  const handleManualOrderSelection = useCallback(
    (ordemVenda) => {
      console.log("📦 Manual order selection:", ordemVenda.DocEntry);

      // Set the order for processing (same as QR scan)
      setPickagemOrdemProducao(ordemVenda.DocEntry);

      // Set the card code and date
      setCardCode(ordemVenda.CardCode);
      setDocDate(format(datahora.toISOString(), "yyyyMMdd"));

      // Open the modal
      setAbrirModalPickagem(true);

      console.log("✅ Order selected manually and modal opened");
    },
    [datahora]
  );

  const handleQuickModalConfirm = useCallback(
    (quantity: number, matchedItem: any) => {
      console.log("🚀 Quick confirm:", { quantity, matchedItem });

      // Set submitting state
      loteActions.setQuickSubmitting(true);

      try {
        // Create batch data in the expected format
        const lotesForDocumentLine = [
          {
            BatchNumber: matchedItem.batchNumber,
            Quantity: quantity,
            ItemCode: matchedItem.itemCode,
          },
        ];

        // Find current sales order
        const currentSalesOrder = ordensVendaSAP.data?.value.find(
          (ordemVenda) => ordemVenda.DocEntry === pickagemOrdemVenda
        );

        if (currentSalesOrder) {
          // Add to document lines
          addDocumentLineBatch(
            currentSalesOrder.DocEntry,
            matchedItem.lineNum,
            lotesForDocumentLine
          );

          console.log(
            "✅ Lote adicionado rapidamente:",
            lotesForDocumentLine[0]
          );

          // Success feedback
          setTimeout(() => {
            loteActions.closeQuickModal();
          }, 500);
        } else {
          console.error("❌ Sales order not found");
          loteActions.closeQuickModal();
        }
      } catch (error) {
        console.error("❌ Error adding quick lote:", error);
        loteActions.closeQuickModal();
      }
    },
    [loteActions, ordensVendaSAP.data, pickagemOrdemVenda, addDocumentLineBatch]
  );

  const { lastMessage } = useWebSocket(WEBSOCKET_URL, {
    onOpen: () => console.log("WebSocket connected"),
    onError: (error) => console.error("WebSocket error:", error),
    onMessage: (event: MessageEvent) => {
      if (!isJSON(event.data)) return;

      try {
        const eventdataJSON = JSON.parse(event.data);

        // Only process QR data messages, ignore status messages
        if (eventdataJSON.type !== "qr_data") {
          return;
        }

        // Check if the scan was successful
        if (eventdataJSON.status !== "ok") {
          console.error("QR scan failed:", eventdataJSON.status);
          return;
        }

        // Debug log
        console.log("📡 QR Data received:", eventdataJSON);

        // Determine what type of QR code this is
        const qrType = determineQRType(eventdataJSON);
        console.log(
          "🔍 QR Type detected:",
          qrType,
          "F field:",
          eventdataJSON.payload?.parsed?.F
        );

        // UPDATED ROUTING LOGIC
        if (qrType === "lote") {
          // Always try to handle lote QR codes
          // The handleLoteQRScan function will decide whether to:
          // 1. Use auto-detection (if order is active and not in manual QR mode)
          // 2. Use manual QR flow (if in QR scanning mode)
          // 3. Ignore (if no active order)
          handleLoteQRScan(eventdataJSON);
        } else if (qrType === "order") {
          // Handle order QR only if not in lote scanning mode
          if (!loteModalState.qrScanState.isScanning) {
            handleOrderQRScan(eventdataJSON);
          } else {
            loteActions.handleQRScanError(
              "Esperado código QR de lote, mas recebido código QR de ordem. Por favor, digitalize um código QR de lote."
            );
          }
        } else {
          // Unknown QR type
          if (loteModalState.qrScanState.isScanning) {
            loteActions.handleQRScanError(
              `Tipo de código QR não reconhecido: ${eventdataJSON.payload?.parsed?.F}. Esperado um código QR de lote.`
            );
          } else {
            console.error(
              "❓ Unrecognized QR code type:",
              eventdataJSON.payload?.parsed?.F
            );
          }
        }
      } catch (error) {
        console.error("💥 Error parsing WebSocket message:", error);

        // If we're in lote scanning mode, show error to user
        if (loteModalState.qrScanState.isScanning) {
          loteActions.handleQRScanError("Falha ao analisar dados do código QR");
        }
      }
    },
    share: true,
  });

  // Effects
  useEffect(() => {
    if (guiaRemessaSAPmutation.isSuccess || guiaRemessaSAPmutation.isError) {
      clearDocumentLines();
      setValidouValores(false); // Add this line
    }
  }, [
    guiaRemessaSAPmutation.isSuccess,
    guiaRemessaSAPmutation.isError,
    clearDocumentLines,
  ]);

  // Add this effect to auto-clear printer errors:
  useEffect(() => {
    if (
      loteModalState.inputMethod === "manual" &&
      loteModalState.currentItem.artigo &&
      loteModalState.loadingStates.fetchingLotes
    ) {
      // Only need to refetch one API now
      quantidadePorLote.refetch().then(() => {
        if (quantidadePorLote.data?.value) {
          loteActions.handleLotesFetchSuccess(quantidadePorLote.data.value);
        }
      });
    }
  }, [
    loteModalState.inputMethod,
    loteModalState.currentItem.artigo,
    loteModalState.loadingStates.fetchingLotes,
    quantidadePorLote,
    loteActions,
  ]);

  useEffect(() => {
    if (printerError) {
      const timer = setTimeout(() => {
        // Note: You'd need to expose a clearError function from usePrinter hook
        // For now, the error will persist until next print attempt
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [printerError]);

  // Memoized values
  const currentSalesOrder = useMemo(
    () =>
      ordensVendaSAP.data?.value.find(
        (ordemVenda) => ordemVenda.DocEntry === pickagemOrdemVenda
      ),
    [ordensVendaSAP.data?.value, pickagemOrdemVenda]
  );

  const isBatchManaged = useMemo(() => {
    // Use optional chaining to safely access the first item
    const firstItem = quantidadePorLote.data?.value?.[0];

    // Check if the first item exists and has IsBatchManaged property
    return firstItem?.IsBatchManaged === "Y";
  }, [quantidadePorLote.data?.value]);

  const hasStock = useMemo(() => {
    // Check quantidadePorLote API for available stock
    const quantidadeData = quantidadePorLote.data?.value;
    if (Array.isArray(quantidadeData) && quantidadeData.length > 0) {
      // Check if any items have quantity > 0
      return quantidadeData.some(
        (item) => typeof item.Quantity === "number" && item.Quantity > 0
      );
    }
    return false;
  }, [quantidadePorLote.data?.value]);

  // Event handlers
  const handleValidateSelection = useCallback(() => {
    const currentSalesOrder = ordensVendaSAP.data?.value.find(
      (ordemVenda) => ordemVenda.DocEntry === pickagemOrdemVenda
    );

    if (!currentSalesOrder || !loteModalState.currentItem.lineNum) return;

    // Use the lotes from the new state structure
    if (isBatchManaged && loteModalState.selection.selectedLotes.length > 0) {
      // Convert to your existing format
      const lotesForDocumentLine = loteModalState.selection.selectedLotes.map(
        (lote) => ({
          BatchNumber: lote.batchNumber,
          Quantity: lote.quantity,
          ItemCode: lote.itemCode,
        })
      );

      addDocumentLineBatch(
        currentSalesOrder.DocEntry,
        loteModalState.currentItem.lineNum,
        lotesForDocumentLine
      );
    }

    loteActions.validateSelection();
  }, [
    currentSalesOrder,
    loteModalState.currentItem.lineNum,
    loteModalState.selection.selectedLotes,
    isBatchManaged,
    addDocumentLineBatch,
    loteActions,
    ordensVendaSAP.data?.value,
    pickagemOrdemVenda,
  ]);

  const handleValidateValues = useCallback(() => {
    const arrayAuxiliar = [...documentLinesBatchN, ...documentLines];
    if (arrayAuxiliar.length === 0) {
      console.warn("No document lines to validate");
      return;
    }

    setBody({
      CardCode: cardCode,
      DocDate: docDate,
      DocumentLines: arrayAuxiliar,
    });
    setValidouValores(true);
  }, [documentLinesBatchN, documentLines, cardCode, docDate]);

  const handleLoteButtonClick = useCallback(
    (itemCode: string, lineNum: number) => {
      loteActions.openManualMode(itemCode, lineNum);
    },
    [loteActions]
  );

  const generateZPLLabel = useCallback(() => {
    if (!currentSalesOrder || !body) return "";

    const customerName = currentSalesOrder.CardName.substring(0, 20);
    const items = Array.from({ length: 9 }, (_, index) => {
      const details = body.DocumentLines[index]
        ? extractDetails(
            body.DocumentLines[index],
            ordensVendaSAP.data?.value || [],
            pickagemOrdemVenda
          )
        : { itemCode: "---", batchNumber: "---", quantity: "---" };

      return `^FO50,${570 + index * 70}^GB700,60,3^FS^FO50,${
        570 + index * 70
      }^GB190,60,3^FS^FO50,${570 + index * 70}^GB500,60,3^FS^FO100,${
        585 + index * 70
      }^FD${details.itemCode}^FS^FO350,${585 + index * 70}^FD${
        details.batchNumber
      }^FS^FO600,${585 + index * 70}^FD${details.quantity}^FS`;
    }).join("");

    return `^XA${EGIQUIMICA_LOGO_ZPL}^FS^CF0,60^FO220,50^FDEgiquimica^FS^CF0,30^FO220,115^FDParque Industrial Guarda, Lt.10/15^FS^FO220,155^FDGuarda^FS^FO220,195^FDPortugal (PT)^FS^FO50,245^GB700,3,3^FS^CFD,40^FO50,265^FDCliente:^FS^CFA,30^FO50,315^FD${customerName}...^FS^CFD,40^FO50,365^FDValidador:^FS^FO50,450^GB400,3,3^FS^CFA,40^FO150,1195^FD${format(
      datahora,
      "PPP",
      { locale: pt }
    )}^FS^FO515,255^BQ,,6^FDF:Ex&C1:${pickagemOrdemVenda}&C2:${
      currentSalesOrder.CardCode
    }&C3:${format(datahora, "P", {
      locale: pt,
    })}&C4:C5:&C6:&^FS^FO50,500^GB700,60,3^FS^FO50,500^GB190,60,3^FS^FO50,500^GB500,60,3^FS^CF0,35^FO100,515^FDArtigo^FS^FO350,515^FDLote^FS^FO600,515^FDQtd.^FS${items}^XZ`;
  }, [
    currentSalesOrder,
    body,
    ordensVendaSAP.data?.value,
    pickagemOrdemVenda,
    datahora,
  ]);

  const handleCloseModal = useCallback(() => {
    loteActions.resetModal(); // Instead of clearLotes()
    setAbrirModalPickagem(false);
    setValidouValores(false);
  }, [loteActions]);

  // Loading and error states
  if (ordensVendaSAP.isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">
            Erro ao carregar ordens de venda
          </h2>
          <p className="text-gray-600 mt-2">
            Verifique a conexão e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  if (guiaRemessaSAPmutation.isPending) {
    return <LoadingSpinner message="Processando guia de remessa..." />;
  }

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {printerError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Erro de impressão:</strong> {printerError}
          </div>
        )}
        {ordensVendaSAP.isRefetching || ordensVendaSAP.isFetching ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[500px] w-[300px]" />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-8xl">
            <ul
              role="list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {ordensVendaSAP.data?.value.map((ordemVenda, index) => (
                <li
                  key={`${ordemVenda.DocEntry}-${index}`}
                  className="relative"
                >
                  <SalesOrderCard ordemVenda={ordemVenda} index={index} />
                  {/* Manual selection button */}
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManualOrderSelection(ordemVenda)}
                      className="bg-white/90 hover:bg-white shadow-sm"
                      title={`Abrir ordem ${ordemVenda.DocEntry} manualmente`}
                    >
                      <ClipboardList className="h-4 w-4 mr-1" />
                      Abrir
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Sales Order Modal */}
            <AlertDialog
              open={abrirModalPickagem}
              onOpenChange={setAbrirModalPickagem}
            >
              <AlertDialogContent className="w-4/5 max-h-[90vh] overflow-y-auto">
                <AlertDialogTitle></AlertDialogTitle>
                <AlertDialogHeader>
                  <AlertDialogDescription>
                    <section className="bg-white py-2 antialiased dark:bg-gray-900 md:py-12">
                      <div className="mx-auto px-4 2xl:px-0">
                        <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                          Confirmar itens da ordem de venda
                          <span className="font-medium text-gray-900 dark:text-white">
                            {` #${pickagemOrdemVenda}`}
                          </span>{" "}
                          para o cliente
                          <span className="font-medium text-gray-900 dark:text-white">
                            {` ${currentSalesOrder?.CardName}(${currentSalesOrder?.CardCode})`}
                          </span>
                        </p>

                        <div className="space-y-3 max-h-[339px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                          {currentSalesOrder?.DocumentLines.map(
                            (linhaVenda, index) => {
                              const isValidated =
                                documentLines.find(
                                  (docLine) =>
                                    docLine.BaseLine === linhaVenda.LineNum
                                ) ||
                                documentLinesBatchN.find(
                                  (docLine) =>
                                    docLine.BaseLine === linhaVenda.LineNum
                                );

                              return (
                                <div key={`${linhaVenda.LineNum}-${index}`}>
                                  <dl className="sm:flex items-center justify-between gap-4">
                                    <dt className="flex flex-row font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                                      {`${linhaVenda.ItemDescription}(${linhaVenda.ItemCode})`}
                                    </dt>
                                    <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                                      <div className="flex flex-row gap-1 items-center">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          Lote:
                                        </span>

                                        {/* Manual Selection Button */}
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          disabled={loteComputed.isLoading}
                                          onClick={() =>
                                            handleLoteButtonClick(
                                              linhaVenda.ItemCode,
                                              linhaVenda.LineNum
                                            )
                                          }
                                          aria-label={`Seleção manual de lotes para ${linhaVenda.ItemCode}`}
                                          title="Seleção manual de lotes"
                                        >
                                          {loteComputed.isLoading &&
                                          loteModalState.currentItem.lineNum ===
                                            linhaVenda.LineNum ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                          ) : (
                                            <ClipboardList />
                                          )}
                                        </Button>

                                        {/* QR Scan Button */}
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          onClick={() =>
                                            loteActions.openQRMode(
                                              linhaVenda.LineNum
                                            )
                                          }
                                          aria-label={`Scanner QR de lotes para ${linhaVenda.ItemCode}`}
                                          title="Scanner QR de lotes"
                                        >
                                          <QrCode />
                                        </Button>
                                      </div>
                                    </dd>

                                    {isValidated && (
                                      <div className="flex flex-row text-green-600">
                                        <div>✓ Validado</div>
                                        <div>{` (${isValidated.Quantity})`}</div>
                                      </div>
                                    )}

                                    <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                                      <div className="flex flex-row gap-1 items-center">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          Quantidade:
                                        </span>
                                        {linhaVenda.RemainingOpenQuantity}/
                                        {linhaVenda.Quantity}
                                      </div>
                                    </dd>
                                  </dl>
                                  <Separator className="mt-1" />
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </section>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleCloseModal}>
                    Cancelar
                  </AlertDialogCancel>
                  <Button onClick={handleValidateValues}>Validar</Button>
                  <Button
                    disabled={!validouValores || isPrinting} // ADD: || isPrinting
                    onClick={() => imprimirEtiqueta(generateZPLLabel())}
                  >
                    <Printer className="mr-1" />
                    {isPrinting ? "Imprimindo..." : "Etiqueta"}
                  </Button>
                  <AlertDialogAction
                    disabled={
                      !validouValores || guiaRemessaSAPmutation.isPending
                    }
                    onClick={() => {
                      if (body) {
                        guiaRemessaSAPmutation.mutate(body);
                      }
                    }}
                  >
                    {guiaRemessaSAPmutation.isPending
                      ? "Confirmando..."
                      : "Confirmar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Batch Selection Modal */}
            {/* Replace your existing Batch Selection Modal with this: */}
            <AlertDialog
              open={loteModalState.isOpen}
              onOpenChange={(open) => !open && loteActions.closeModal()}
            >
              <AlertDialogContent className="w-4/5 max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {loteModalState.inputMethod === "manual"
                      ? `Seleção Manual de Lotes (${
                          loteModalState.currentItem.artigo || "A carregar..."
                        })`
                      : `Scanner QR de Lotes`}
                    {loteComputed.isLoading && " - A carregar..."}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {/* QR Scanning Interface */}
                    {loteComputed.showQRInterface && (
                      <div className="space-y-4">
                        {loteModalState.qrScanState.isScanning ? (
                          <div className="text-center p-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                            <div className="text-blue-600 text-lg font-medium mb-2">
                              📱 Digitalize o código QR para informações do
                              lote...
                            </div>
                            <div className="text-blue-500 text-sm mb-4">
                              Aponte o scanner para um código QR de lote
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => loteActions.closeModal()}
                              className="mt-4"
                            >
                              Cancelar Digitalização
                            </Button>
                          </div>
                        ) : loteModalState.qrScanState.scannedData ? (
                          <div
                            className={`p-4 border rounded-lg ${
                              loteModalState.qrScanState.validationResult ===
                              "valid"
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <h4
                              className={`font-medium ${
                                loteModalState.qrScanState.validationResult ===
                                "valid"
                                  ? "text-green-800"
                                  : "text-red-800"
                              }`}
                            >
                              QR Digitalizado{" "}
                              {loteModalState.qrScanState.validationResult ===
                              "valid"
                                ? "com Sucesso!"
                                : "com Problemas"}
                            </h4>
                            <div className="mt-2 space-y-1">
                              <p>
                                <strong>Item:</strong>{" "}
                                {
                                  loteModalState.qrScanState.scannedData
                                    .itemCode
                                }
                              </p>
                              <p>
                                <strong>Batch:</strong>{" "}
                                {
                                  loteModalState.qrScanState.scannedData
                                    .batchNumber
                                }
                              </p>
                              {loteModalState.qrScanState.scannedData
                                .expiryDate && (
                                <p>
                                  <strong>Expiry:</strong>{" "}
                                  {
                                    loteModalState.qrScanState.scannedData
                                      .expiryDate
                                  }
                                </p>
                              )}
                            </div>

                            {loteModalState.qrScanState.validationResult ===
                            "valid" ? (
                              <div className="text-green-600 mt-2 flex items-center">
                                <span className="mr-2">✓</span>
                                Item encontrado na ordem atual - pronto para
                                inserir quantidade
                              </div>
                            ) : loteModalState.qrScanState.validationResult ===
                              "not_found" ? (
                              <div className="text-red-600 mt-2 flex items-center">
                                <span className="mr-2">❌</span>
                                {loteModalState.qrScanState.errorMessage}
                              </div>
                            ) : null}

                            {/* Retry button for failed scans */}
                            {loteModalState.qrScanState.validationResult !==
                              "valid" && (
                              <Button
                                onClick={loteActions.startQRScan}
                                className="mt-3 w-full"
                                variant="outline"
                              >
                                Tentar Outro Código QR
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Pronto para Digitalizar Código QR
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Clique no botão abaixo para começar a digitalizar
                              um código QR de lote
                            </p>
                            <Button
                              onClick={loteActions.startQRScan}
                              className="w-full"
                            >
                              <QrCode className="mr-2 h-4 w-4" />
                              Iniciar Digitalização QR
                            </Button>
                          </div>
                        )}

                        {/* Show error messages */}
                        {loteModalState.qrScanState.errorMessage &&
                          loteModalState.qrScanState.validationResult !==
                            "not_found" && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                              <strong>Erro:</strong>
                              {loteModalState.qrScanState.errorMessage}
                            </div>
                          )}
                      </div>
                    )}
                  </AlertDialogDescription>
                  {/* Your existing Manual Selection Interface comes after this... */}
                  <AlertDialogDescription>
                    {/* Manual Selection Interface */}
                    {loteComputed.showManualSelection && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Lotes Disponíveis
                          </h4>
                          <div className="flex flex-row items-center gap-2">
                            <Select
                              onValueChange={(value) => {
                                // Find the selected lote data
                                const selectedLote =
                                  loteModalState.currentItem.availableLotes?.find(
                                    (lote) => lote.BatchNum === value
                                  );
                                if (selectedLote) {
                                  loteActions.addLote(
                                    selectedLote.BatchNum,
                                    selectedLote.ItemCode,
                                    0,
                                    "manual"
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Selecione um lote da lista" />
                              </SelectTrigger>
                              <SelectContent>
                                {loteModalState.currentItem.availableLotes?.map(
                                  (itemLote) => (
                                    <SelectItem
                                      key={itemLote.BatchNum}
                                      value={itemLote.BatchNum}
                                    >
                                      {`${itemLote.BatchNum} (Disponivel: ${itemLote.Quantity})`}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                // Refresh the lotes
                                if (
                                  loteModalState.currentItem.artigo &&
                                  loteModalState.currentItem.lineNum
                                ) {
                                  loteActions.openManualMode(
                                    loteModalState.currentItem.artigo,
                                    loteModalState.currentItem.lineNum
                                  );
                                }
                              }}
                              title="Atualizar lotes"
                            >
                              <PlusCircle />
                            </Button>
                          </div>

                          {/* Show batch managed info */}
                          <div className="mt-2 text-sm text-gray-600">
                            {isBatchManaged ? (
                              <span className="text-blue-600">
                                ✓ Este item é gerido por lotes
                              </span>
                            ) : (
                              <span className="text-orange-600">
                                ⚠️ Este item não é gerido por lotes
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quantity Input Section (shown for both methods) */}
                    {loteComputed.showQuantityInput && (
                      <div className="space-y-3 mt-6">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-900">
                            Lotes Selecionados:
                          </h4>
                          <span className="text-sm text-gray-500">
                            {loteModalState.selection.selectedLotes.length}{" "}
                            lote(s) selecionado(s)
                          </span>
                        </div>

                        <div className="max-h-[300px] overflow-y-scroll border rounded-lg p-4 space-y-3">
                          {loteModalState.selection.selectedLotes.map(
                            (loteItem) => (
                              <div
                                key={loteItem.batchNumber}
                                className="flex items-center gap-2 p-3 bg-gray-50 rounded border"
                              >
                                {/* Source indicator */}
                                <span
                                  className={`text-xs px-2 py-1 rounded font-medium ${
                                    loteItem.source === "qr"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {loteItem.source === "qr" ? "QR" : "Manual"}
                                </span>

                                {/* Lote info */}
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {loteItem.batchNumber}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {loteItem.itemCode}
                                  </div>
                                </div>

                                {/* Quantity input */}
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={`qty-${loteItem.batchNumber}`}
                                    className="text-sm font-medium"
                                  >
                                    Qtd:
                                  </Label>
                                  <Input
                                    id={`qty-${loteItem.batchNumber}`}
                                    className="w-[100px]"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={loteItem.quantity}
                                    onChange={(e) =>
                                      loteActions.updateLoteQuantity(
                                        loteItem.batchNumber,
                                        Number(e.target.value)
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>

                                {/* Remove button */}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    loteActions.removeLote(loteItem.batchNumber)
                                  }
                                  title="Remover este lote"
                                  aria-label={`Remover lote ${loteItem.batchNumber}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Handle loading states */}
                    {loteComputed.isLoading && (
                      <div className="text-center p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-500">
                          A carregar informações do lote...
                        </p>
                      </div>
                    )}

                    {/* Handle case where no stock/batch managed */}
                    {!loteComputed.showManualSelection &&
                      !loteComputed.isLoading && (
                        <div className="text-center p-6 text-gray-500">
                          <p>Nenhum lote disponível para este item</p>
                        </div>
                      )}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Enhanced Footer */}
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <div className="flex gap-2">
                    <AlertDialogCancel
                      onClick={loteActions.closeModal}
                      className="flex-1"
                    >
                      Cancelar
                    </AlertDialogCancel>

                    <Button
                      disabled={!loteComputed.canValidate}
                      onClick={handleValidateSelection}
                      className="min-w-[100px]"
                    >
                      {loteModalState.selection.isValidated
                        ? "Validado ✓"
                        : "Validar"}
                    </Button>

                    <AlertDialogAction
                      disabled={!loteModalState.selection.isValidated}
                      onClick={loteActions.closeModal}
                    >
                      Continuar
                    </AlertDialogAction>
                  </div>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {/* ADD: Quick Quantity Modal */}
            <QuickQuantityModal
              loteModalState={loteModalState}
              loteActions={loteActions}
              onConfirm={handleQuickModalConfirm}
            />
            {/* Pagination */}
            <PaginationControls
              numeroPagina={numeroPagina}
              onPaginaAnterior={handlePaginaAnterior}
              onPaginaSeguinte={handlePaginaSeguinte}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ListaOrdensVenda;
