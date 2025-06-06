"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import { Skeleton } from "@/components/ui/skeleton";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
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

// Constants
const EGIQUIMICA_LOGO_ZPL = "^FO50,60^GFA,2016,2016,16,,:T07IF8,S0LFC,R0NFC,Q07OFC,P03QF,P0RFC,O03SF,O0TFC,N03UF,N0VFC,M01LFCI0LFE,M07KF8K07KF8,M0KFCM0KFC,L01JFEN01JFE,L03JFP03JF,L07IFCQ0JF8,K01JFR03IFE,K03IFER01JF,K07IF8S07IF8,K07IFT03IFC,K0IFCU0IFE,J01IF8U07FFE,J03IFJ0E38O03IF,J07FFE0079F7EO01IF8,J0IFC00JFEP0IFC,I01IF800JFEP07FFE,I01IFI0IF7EP03FFE,I03FFEI0F9E3CP01IF,I07FFCI03U0IF,I07FF8I078E3C7P07FF8,I0IFJ0FDF7EF8O03FFC,I0IFJ0LFCO03FFC,001FFEJ0LFCO01FFE,001FFCJ0FDF7EF8P0FFE,003FFCJ078E3C7Q0IF,003FF8L0E1830CO07FF,007FF8J079F7CF9FO03FF8,007FFK0NFO03FF8,00FFEK0NFO01FFC,00FFEK0JFEIFO01FFC,00FFCK0FDF3CF9FP0FFC,01FFCK078418S0FFE,01FFCK078E3CS0FFE,01FF8K0FDF7ES07FE,03FF8K0JFES07FF,:03FFL0FDF7ES03FF,03FFL078E18S03FF,07FFL038E1C30EP03FF807FEL07DFBEFDFP01FF807FEL0NF8O01FF8:07FEL0FDLF8O01FF807FEL07CF3E79FP01FFC0FFEL03060C306Q0FFC0FFCL07CF3E79F3CO0FFC0FFCL0FDFBEFDFFEO0FFC0FFCL0OFEO0FFC:P07DFBEFDF3E,P03861C30E1C,P038F1C78E1C7,P07DFBEFDF3EF8,0FFCL0QFCM0FFC:0FFCL0FDFBEFDFFEFCM0FFC0FFCL07CF3E79F3C78M0FFC0FFCL01X0FFC0FFEL03071ET0FFC07FEL07CFBFS01FFC07FEL0FDIFS01FF8:07FEL0FDFBFS01FF807FEL07CF1ES01FF807FFL03W03FF803FFL078F1E78E3CF8L03FF,03FFL0FDFBEFDF7EF8L03FF,03FF8K0QFCL07FF,:01FF8K07DFBEFDFFEF8L07FE,01FFCK038F1C78F3C7M0FFE,01FFCK03861C38E1C71EK0FFE,00FFCK07DFBE7DF3EFBFK0FFC,00FFEK0SFJ01FFC,:007FFK0FDJFDFFEFBFJ03FF8,007FFK07CF3E79F3E79EJ03FF8,003FF8J01060C3061870C1I07FF,003FFCJ038F3E78F3CF9F7C00IF,001FFCJ07DFBFFDLF7E00FFE,001FFEJ0TFE01FFE,I0IFJ0SF7E03FFC,I0IFJ07DFBEFDF3EF9F7C03FFC,I07FF8I07CF1C78E1C70C1807FF8,I03FFCY0IF8,I03FFEX01IF,I01IFX03FFE,J0IF8W07FFE,J0IFCW0IFC,J07FFEV01IF8,J03IFV03IF,J01IF8U07FFE,J01IFCU0IFC,K0JFT03IFC,K07IF8S07IF8,K03IFER01JF,K01JFR03IFE,L0JFCQ0JF8,L03JFP03JF,L01JFEN01JFE,M0KF8M07JFC,M07KF8K07KF8,M01LFE001LFE,N0VFC,N03UF,O0TFC,O03SF,P0RFE,P03QF,Q07OF8,Q01NFC,R01LFE,T07IF8,,^FS";

const PAGE_SIZE = 20;

// Type definitions
interface LeitorQR {
  status: string;
  value: {
    C1: string;
    C2: string;
    C3: string;
    C4: string;
    C5: string;
    C6: string;
    F: string;
  };
}

interface BatchNumbersInterface {
  BatchNumber: string;
  Quantity: number;
  ItemCode: string;
}

interface DocumentLinesBatchN {
  BaseType: number;
  BaseEntry: number;
  BaseLine: number;
  Quantity: number;
  BatchNumbers?: BatchNumbersInterface[];
}

interface DocumentLinesInterface {
  BaseEntry: number;
  BaseLine: number;
  BaseType: number;
  Quantity: number;
  BatchNumbers?: BatchNumbersInterface[];
}

interface BodyInterface {
  CardCode: string;
  DocDate: string;
  DocumentLines: any[];
}

interface SelectLotesInterface {
  BatchNum: string;
  IsBatchManaged: string;
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  WhsCode: string;
}

interface GeridoPorLotesSAPI {
  "odata.metadata": string;
  "odata.etag": string;
  ManageBatchNumbers: string;
}

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
    setNumeroPagina(prev => prev + PAGE_SIZE);
  }, []);

  const handlePaginaAnterior = useCallback(() => {
    setNumeroPagina(prev => Math.max(0, prev - PAGE_SIZE));
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
    setLotes(prev => 
      produce(prev, draft => {
        if (draft.findIndex(item => item.BatchNumber === batchNumber) === -1) {
          draft.push({
            BatchNumber: batchNumber,
            Quantity: 0,
            ItemCode: itemCode,
          });
        }
      })
    );
  }, []);

  const updateLoteQuantity = useCallback((batchNumber: string, quantity: number) => {
    setLotes(prev =>
      produce(prev, draft => {
        const index = draft.findIndex(item => item.BatchNumber === batchNumber);
        if (index !== -1) {
          draft[index].Quantity = quantity;
        }
      })
    );
  }, []);

  const removeLote = useCallback((batchNumber: string) => {
    setLotes(prev => prev.filter(item => item.BatchNumber !== batchNumber));
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
  const [documentLines, setDocumentLines] = useState<DocumentLinesInterface[]>([]);
  const [documentLinesBatchN, setDocumentLinesBatchN] = useState<DocumentLinesBatchN[]>([]);

  const clearDocumentLines = useCallback(() => {
    setDocumentLines([]);
    setDocumentLinesBatchN([]);
  }, []);

  const updateDocumentLineQuantity = useCallback((
    baseLine: number,
    baseEntry: number,
    quantity: number
  ) => {
    setDocumentLines(prev =>
      produce(prev, draft => {
        const existingIndex = draft.findIndex(line => line.BaseLine === baseLine);
        
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
  }, []);

  const addDocumentLineBatch = useCallback((
    baseEntry: number,
    baseLine: number,
    batchNumbers: BatchNumbersInterface[]
  ) => {
    const totalQuantity = batchNumbers.reduce((acc, batch) => acc + batch.Quantity, 0);
    
    setDocumentLinesBatchN(prev =>
      produce(prev, draft => {
        draft.push({
          BaseEntry: baseEntry,
          BaseLine: baseLine,
          BaseType: 17,
          Quantity: totalQuantity,
          BatchNumbers: batchNumbers,
        });
      })
    );
  }, []);

  return {
    documentLines,
    documentLinesBatchN,
    clearDocumentLines,
    updateDocumentLineQuantity,
    addDocumentLineBatch,
  };
};

const usePrinter = () => {
  const imprimirEtiqueta = useCallback(async (informacaoEtiqueta: string) => {
    try {
      const browserPrint = new ZebraBrowserPrintWrapper();
      const foundPrinter = await browserPrint.getAvailablePrinters();
      
      if (foundPrinter.length === 0) {
        console.error("No printers found");
        return;
      }

      await browserPrint.setPrinter(foundPrinter[0]);
      const printerStatus = await browserPrint.checkPrinterStatus();

      if (printerStatus.isReadyToPrint) {
        await browserPrint.print(informacaoEtiqueta);
      } else {
        console.error("Printer not ready:", printerStatus.errors);
      }
    } catch (error) {
      console.error("Error printing label:", error);
    }
  }, []);

  return { imprimirEtiqueta };
};

// Main component
const ListaOrdensVenda: React.FC = () => {
  const { numeroPagina, handlePaginaSeguinte, handlePaginaAnterior } = usePagination();
  const { imprimirEtiqueta } = usePrinter();
  const { 
    lotes, 
    lote, 
    setLote, 
    addLote, 
    updateLoteQuantity, 
    removeLote, 
    clearLotes 
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
  const { lastMessage } = useWebSocket(process.env.NEXT_PUBLIC_WS_EXP || "ws://localhost:8081/pickagem", {
    onOpen: () => console.log("websocket aberto"),
    onMessage: (event: MessageEvent) => {
      if (!isJSON(event.data)) return;

      const eventdataJSON: LeitorQR = JSON.parse(event.data);
      const numeroParseado = Number(eventdataJSON.value.C2);
      
      setPickagemOrdemProducao(numeroParseado);

      const ordemEncontrada = ordensVendaSAP.data?.value.find(
        (ordemVenda) => ordemVenda.DocEntry === numeroParseado
      );

      if (ordemEncontrada) {
        setAbrirModalPickagem(true);
        setCardCode(ordemEncontrada.CardCode);
        setDocDate(format(datahora.toISOString(), "yyyyMMdd"));
      }
    },
    share: true,
  });

  // Effects
  useEffect(() => {
    if (guiaRemessaSAPmutation.isSuccess || guiaRemessaSAPmutation.isError) {
      clearDocumentLines();
    }
  }, [guiaRemessaSAPmutation.isSuccess, guiaRemessaSAPmutation.isError, clearDocumentLines]);

  // Memoized values
  const currentSalesOrder = useMemo(() => 
    ordensVendaSAP.data?.value.find(
      (ordemVenda) => ordemVenda.DocEntry === pickagemOrdemVenda
    ), 
    [ordensVendaSAP.data?.value, pickagemOrdemVenda]
  );

  const isBatchManaged = useMemo(() => 
    artigoGeridoPorLotesSAP.data?.ManageBatchNumbers === "tYES",
    [artigoGeridoPorLotesSAP.data?.ManageBatchNumbers]
  );

  const hasStock = useMemo(() => 
    (quantidadePorLote.data?.value?.length ?? 0) > 0,
    [quantidadePorLote.data?.value?.length]
  );

  // Event handlers
  const handleValidateSelection = useCallback(() => {
    if (!currentSalesOrder || !lineNumLoteButton) return;

    if (isBatchManaged) {
      addDocumentLineBatch(
        currentSalesOrder.DocEntry,
        lineNumLoteButton,
        lotes
      );
    }
    setValidouSelecaoLote(true);
  }, [currentSalesOrder, lineNumLoteButton, isBatchManaged, addDocumentLineBatch, lotes]);

  const handleValidateValues = useCallback(() => {
    const arrayAuxiliar = [...documentLinesBatchN, ...documentLines];
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
        ? extractDetails(body.DocumentLines[index], ordensVendaSAP.data?.value || [], pickagemOrdemVenda)
        : { itemCode: "---", batchNumber: "---", quantity: "---" };
      
      return `^FO50,${570 + index * 70}^GB700,60,3^FS^FO50,${570 + index * 70}^GB190,60,3^FS^FO50,${570 + index * 70}^GB500,60,3^FS^FO100,${585 + index * 70}^FD${details.itemCode}^FS^FO350,${585 + index * 70}^FD${details.batchNumber}^FS^FO600,${585 + index * 70}^FD${details.quantity}^FS`;
    }).join("");

    return `^XA${EGIQUIMICA_LOGO_ZPL}^FS^CF0,60^FO220,50^FDEgiquimica^FS^CF0,30^FO220,115^FDParque Industrial Guarda, Lt.10/15^FS^FO220,155^FDGuarda^FS^FO220,195^FDPortugal (PT)^FS^FO50,245^GB700,3,3^FS^CFD,40^FO50,265^FDCliente:^FS^CFA,30^FO50,315^FD${customerName}...^FS^CFD,40^FO50,365^FDValidador:^FS^FO50,450^GB400,3,3^FS^CFA,40^FO150,1195^FD${format(datahora, "PPP", { locale: pt })}^FS^FO515,255^BQ,,6^FDF:Ex&C1:${pickagemOrdemVenda}&C2:${currentSalesOrder.CardCode}&C3:${format(datahora, "P", { locale: pt })}&C4:C5:&C6:&^FS^FO50,500^GB700,60,3^FS^FO50,500^GB190,60,3^FS^FO50,500^GB500,60,3^FS^CF0,35^FO100,515^FDArtigo^FS^FO350,515^FDLote^FS^FO600,515^FDQtd.^FS${items}^XZ`;
  }, [currentSalesOrder, body, ordensVendaSAP.data?.value, pickagemOrdemVenda, datahora]);

  // Loading and error states
  if (ordensVendaSAP.isError) {
    return <div>Erro ao obter ordens venda do servidor</div>;
  }

  if (guiaRemessaSAPmutation.isPending) {
    return <div>Carregando...</div>;
  }

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
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
                  className="col-span-1 flex flex-col divide-y max-w-[350px] divide-gray-200 rounded-lg bg-white text-center shadow-2xl"
                >
                  <div className="flex flex-1 flex-col p-8 mx-auto">
                    <div className="mx-auto h-32 w-32 flex-shrink-0 rounded-full">
                      <QrcodeComponent
                        information={`F:ordemvenda&C1:docentry&C2:${ordemVenda.DocEntry}&C3:&C4:&C5:&C6:&`}
                      />
                    </div>
                    <h3 className="mt-6 text-sm font-medium text-gray-500">
                      #{ordemVenda.DocEntry}
                    </h3>
                    <dl className="mt-1 flex flex-grow flex-col justify-between">
                      <dt className="sr-only">Cliente</dt>
                      <dd className="text-base font-semibold text-black">
                        {ordemVenda.CardName}
                      </dd>
                      <dt className="sr-only">Data</dt>
                      <dd className="text-sm text-gray-500 mt-2">
                        {format(ordemVenda.CreationDate, "PP", { locale: pt })}
                      </dd>
                      <dt className="sr-only">Estado</dt>
                      <dd className="mt-3">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {ordemVenda.DocumentStatus === "bost_Open" ? (
                            <span className="text-green-300">Aberta</span>
                          ) : (
                            <span className="text-red-300">Fechada</span>
                          )}
                        </span>
                      </dd>
                    </dl>
                  </div>
                  <div>
                    <div className="-mt-px flex divide-x divide-gray-200">
                      <div className="flex w-0 flex-1">
                        <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                          Atualizado a: {format(ordemVenda.UpdateDate, "PP", { locale: pt })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Sales Order Modal */}
            <AlertDialog open={abrirModalPickagem} onOpenChange={setAbrirModalPickagem}>
              <AlertDialogContent className="w-4/5">
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
                          {currentSalesOrder?.DocumentLines.map((linhaVenda, index) => {
                            const isValidated = documentLines.find(
                              (docLine) => docLine.BaseLine === linhaVenda.LineNum
                            ) || documentLinesBatchN.find(
                              (docLine) => docLine.BaseLine === linhaVenda.LineNum
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
                                      >
                                        <ClipboardList />
                                      </Button>
                                    </div>
                                  </dd>
                                  
                                  {isValidated && (
                                    <div className="flex flex-row">
                                      <div>Validado</div>
                                      <div>
                                        {` (${isValidated.Quantity})`}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                                    <div className="flex flex-row gap-1 items-center">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        Quantidade:
                                      </span>
                                      {linhaVenda.RemainingOpenQuantity}/{linhaVenda.Quantity}
                                    </div>
                                  </dd>
                                </dl>
                                <Separator className="mt-1" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={clearLotes}>
                    Cancelar
                  </AlertDialogCancel>
                  <Button onClick={handleValidateValues}>
                    Validar
                  </Button>
                  <Button
                    disabled={!validouValores}
                    onClick={() => imprimirEtiqueta(generateZPLLabel())}
                  >
                    <Printer className="mr-1" /> Etiqueta
                  </Button>
                  <AlertDialogAction
                    disabled={!validouValores}
                    onClick={() => {
                      guiaRemessaSAPmutation.mutate(body);
                      setValidouValores(false);
                    }}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Batch Selection Modal */}
            <AlertDialog open={abrirModalLote} onOpenChange={setAbrirModalLote}>
              <AlertDialogContent className="w-2/4">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {`Seleção dos lotes (${artigo})`}
                    {quantidadePorLote.isLoading || quantidadePorLote.isFetching || quantidadePorLote.isRefetching ? (
                      " A carregar..."
                    ) : !hasStock ? (
                      " Sem stock"
                    ) : null}
                  </AlertDialogTitle>
                  
                  {quantidadePorLote.isLoading || quantidadePorLote.isFetching || quantidadePorLote.isRefetching ? (
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
                              {quantidadePorLote.data.value.map((itemLote) =>
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
                          <dl key={`${loteItem.BatchNumber}-${loteItem.Quantity}`} className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                            <div className="flex flex-row items-center">
                              Lote:
                              <dt className="font-normal mr-4 mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                                {loteItem.BatchNumber}
                              </dt>
                              Quantidade:
                              <Input
                                className="w-[100px] ml-2"
                                type="number"
                                onChange={(e) => updateLoteQuantity(loteItem.BatchNumber, Number(e.target.value))}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeLote(loteItem.BatchNumber)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </dl>
                        ))}

                        {!isBatchManaged && (
                          <>
                            <Separator />
                            <div>Apenas para artigos sem Lote</div>
                            <div className="flex flex-row items-center">
                              {hasStock && quantidadePorLote.data && 
                                `Quantidade (${quantidadePorLote.data.value[0]?.Quantity}): `
                              }
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
            <div
              className="mt-6 flex items-center justify-center sm:mt-8"
              aria-label="Page navigation"
            >
              <div className="mt-2 gap-x-2 flex flex-col">
                <div className="flex flex-row items-center mt-2 gap-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handlePaginaAnterior}
                    disabled={numeroPagina === 0}
                  >
                    <span className="sr-only">Página Anterior</span>
                    <ArrowLeftCircle
                      color="#84CC27"
                      size={30}
                      strokeWidth={1.5}
                    />
                  </Button>
                  <h2>Página</h2>
                  <Label className="text-lg">{numeroPagina / PAGE_SIZE}</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={handlePaginaSeguinte}
                  >
                    <span className="sr-only">Próxima Página</span>
                    <ArrowRightCircle
                      color="#84CC27"
                      size={30}
                      strokeWidth={1.5}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ListaOrdensVenda;