"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import SalesOrderCard from "./SalesOrderCard";
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
import { useFetchBatchManagedSAPData } from "@/Services/Inventario/fetchVerificarBatchNumber";

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

const useLotesState = () => {
  const [lotes, setLotes] = useState<BatchNumbersInterface[]>([]);
  const [lote, setLote] = useState("");
  const [selectLotes, setSelectLotes] = useState<SelectLotesInterface[]>([]);

  const addLote = useCallback((batchNumber: string, itemCode: string) => {
    // Add validation
    if (!batchNumber || !itemCode) return;

    setLotes((prev) =>
      produce(prev, (draft) => {
        if (
          draft.findIndex((item) => item.BatchNumber === batchNumber) === -1
        ) {
          draft.push({
            BatchNumber: batchNumber,
            Quantity: 0,
            ItemCode: itemCode,
          });
        }
      })
    );
  }, []);

  const updateLoteQuantity = useCallback(
    (batchNumber: string, quantity: number) => {
      // Add validation to prevent negative quantities
      if (quantity < 0) return;

      setLotes((prev) =>
        produce(prev, (draft) => {
          const index = draft.findIndex(
            (item) => item.BatchNumber === batchNumber
          );
          if (index !== -1) {
            draft[index].Quantity = quantity;
          }
        })
      );
    },
    []
  );

  // Keep other functions the same
  const removeLote = useCallback((batchNumber: string) => {
    setLotes((prev) => prev.filter((item) => item.BatchNumber !== batchNumber));
  }, []);

  const clearLotes = useCallback(() => {
    setLotes([]);
    setLote("");
    setSelectLotes([]);
  }, []);

  return {
    lotes,
    lote,
    setLote,
    selectLotes,
    setSelectLotes,
    addLote,
    updateLoteQuantity,
    removeLote,
    clearLotes,
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
    lotes,
    lote,
    setLote,
    addLote,
    updateLoteQuantity,
    removeLote,
    clearLotes,
  } = useLotesState();
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
  const [abrirModalLote, setAbrirModalLote] = useState(false);
  const [validouSelecaoLote, setValidouSelecaoLote] = useState(false);
  const [artigo, setArtigo] = useState("");
  const [lineNumLoteButton, setLineNum] = useState<number>();
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
  const quantidadePorLote = useFetchQuantidadeArtigoLote(artigo);
  const artigoGeridoPorLotesSAP = useFetchBatchManagedSAPData(artigo);

  // WebSocket
  const { lastMessage } = useWebSocket(WEBSOCKET_URL, {
    onOpen: () => console.log("WebSocket connected"),
    onError: (error) => console.error("WebSocket error:", error),
    onMessage: (event: MessageEvent) => {
      if (!isJSON(event.data)) return;

      try {
        const eventdataJSON: LeitorQR = JSON.parse(event.data);
        const numeroParseado = Number(eventdataJSON.value.C2);

        // Add validation
        if (isNaN(numeroParseado)) {
          console.error(
            "Invalid order number received:",
            eventdataJSON.value.C2
          );
          return;
        }

        setPickagemOrdemProducao(numeroParseado);

        const ordemEncontrada = ordensVendaSAP.data?.value.find(
          (ordemVenda) => ordemVenda.DocEntry === numeroParseado
        );

        if (ordemEncontrada) {
          setAbrirModalPickagem(true);
          setCardCode(ordemEncontrada.CardCode);
          setDocDate(format(datahora.toISOString(), "yyyyMMdd"));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
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

  const isBatchManaged = useMemo(
    () => artigoGeridoPorLotesSAP.data?.ManageBatchNumbers === "tYES",
    [artigoGeridoPorLotesSAP.data?.ManageBatchNumbers]
  );

  const hasStock = useMemo(
    () => (quantidadePorLote.data?.value?.length ?? 0) > 0,
    [quantidadePorLote.data?.value?.length]
  );

  // Event handlers
  const handleValidateSelection = useCallback(() => {
    if (!currentSalesOrder || lineNumLoteButton === undefined) return;

    if (isBatchManaged && lotes.length > 0) {
      addDocumentLineBatch(
        currentSalesOrder.DocEntry,
        lineNumLoteButton,
        lotes
      );
    }
    setValidouSelecaoLote(true);
  }, [
    currentSalesOrder,
    lineNumLoteButton,
    isBatchManaged,
    addDocumentLineBatch,
    lotes,
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
    clearLotes();
    setAbrirModalPickagem(false);
    setValidouValores(false);
    setValidouSelecaoLote(false);
  }, [clearLotes]);

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
                <SalesOrderCard
                  key={`${ordemVenda.DocEntry}-${index}`}
                  ordemVenda={ordemVenda}
                  index={index}
                />
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
                                        <Button
                                          size="icon"
                                          disabled={false}
                                          onClick={() => {
                                            setLineNum(linhaVenda.LineNum);
                                            setArtigo(linhaVenda.ItemCode);
                                            quantidadePorLote.refetch();
                                            artigoGeridoPorLotesSAP.refetch();
                                            setAbrirModalLote(true);
                                          }}
                                          aria-label={`Selecionar lote para ${linhaVenda.ItemCode}`}
                                        >
                                          <ClipboardList />
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
            <AlertDialog open={abrirModalLote} onOpenChange={setAbrirModalLote}>
              <AlertDialogContent className="w-4/5 max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {`Seleção dos lotes (${artigo})`}
                    {quantidadePorLote.isLoading ||
                    quantidadePorLote.isFetching ||
                    quantidadePorLote.isRefetching
                      ? " A carregar..."
                      : !hasStock
                      ? " Sem stock"
                      : null}
                  </AlertDialogTitle>

                  {quantidadePorLote.isLoading ||
                  quantidadePorLote.isFetching ||
                  quantidadePorLote.isRefetching ? (
                    <div>A carregar...</div>
                  ) : hasStock ? (
                    <AlertDialogDescription>
                      {quantidadePorLote.data?.value && isBatchManaged && (
                        <div className="flex flex-row items-center">
                          <Select onValueChange={setLote}>
                            <SelectTrigger className="w-[180px] mb-1">
                              <SelectValue placeholder="Lote" />
                            </SelectTrigger>
                            <SelectContent>
                              {quantidadePorLote.data.value.map(
                                (itemLote) =>
                                  itemLote.BatchNum && (
                                    <SelectItem
                                      key={`${itemLote.ItemCode}-${itemLote.BatchNum}-${itemLote.Quantity}`}
                                      value={itemLote.BatchNum}
                                    >
                                      {`${itemLote.BatchNum} Qtd:(${itemLote.Quantity})`}
                                    </SelectItem>
                                  )
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => addLote(lote, artigo)}
                          >
                            <PlusCircle />
                          </Button>
                          {isBatchManaged && (
                            <div>Este item é gerido por lotes</div>
                          )}
                        </div>
                      )}

                      <div className="space-y-3 max-h-[339px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                        {lotes.map((loteItem) => (
                          <div
                            key={`${loteItem.BatchNumber}-${loteItem.Quantity}`}
                            className="flex items-center gap-2 p-2 bg-white rounded border"
                          >
                            <span className="font-medium">Lote:</span>
                            <span className="text-gray-600">
                              {loteItem.BatchNumber}
                            </span>
                            <span className="font-medium ml-4">
                              Quantidade:
                            </span>
                            <Input
                              className="w-[100px]"
                              type="number"
                              min="0"
                              defaultValue={loteItem.Quantity}
                              onChange={(e) =>
                                updateLoteQuantity(
                                  loteItem.BatchNumber,
                                  Number(e.target.value)
                                )
                              }
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeLote(loteItem.BatchNumber)}
                              aria-label={`Remover lote ${loteItem.BatchNumber}`}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        ))}

                        {!isBatchManaged && (
                          <>
                            <Separator />
                            <div>Apenas para artigos sem Lote</div>
                            <div className="flex flex-row items-center">
                              {hasStock &&
                                quantidadePorLote.data &&
                                `Quantidade (${quantidadePorLote.data.value[0]?.Quantity}): `}
                              <Input
                                className="w-[80px]"
                                type="number"
                                onChange={(e) => {
                                  if (lineNumLoteButton && currentSalesOrder) {
                                    updateDocumentLineQuantity(
                                      lineNumLoteButton,
                                      currentSalesOrder.DocEntry,
                                      Number(e.target.value)
                                    );
                                  }
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </AlertDialogDescription>
                  ) : null}
                </AlertDialogHeader>

                <div className="flex flex-row justify-between">
                  <Button
                    disabled={lotes.length === 0 && documentLines.length === 0}
                    onClick={handleValidateSelection}
                  >
                    Validar
                  </Button>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={clearLotes}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={!validouSelecaoLote}
                      onClick={() => {
                        clearLotes();
                        setValidouSelecaoLote(false);
                        setAbrirModalLote(false);
                      }}
                    >
                      Continuar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </div>
              </AlertDialogContent>
            </AlertDialog>

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
