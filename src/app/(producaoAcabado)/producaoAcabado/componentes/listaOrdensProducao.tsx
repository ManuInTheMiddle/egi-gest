"use client";
import React from "react";
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
import { ArrowLeftCircle, ArrowRightCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useFetchOrdensEnchimentoSAPData } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";
import { useFetchProdOrderByDocEntry } from "@/Services/OrdensProducao/fetchOrdensProducaoItemGroupCode";
import { useConsumoSAP } from "@/Services/Consumos/criarConsumo";
import { useEntradaMercadoriaProducao } from "@/Services/EntradaMercadoriaProducao/adicionarMercadoria";
import { Skeleton } from "@/components/ui/skeleton";

function isJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

const ListaOrdensProducao = () => {
  const ordensEnchimentoSAP = useFetchOrdensEnchimentoSAPData("boposReleased");
  const enviarConsumosSAP = useConsumoSAP();
  const criarInventoryEntry = useEntradaMercadoriaProducao();
  const [itemBatchNumbers, setItemBatchNumbers] = useState<{
    [key: string]: string;
  }>({});
  const [validouValores, setValidouValores] = useState(false);
  const [pickagemOrdemProducao, setPickagemOrdemProducao] = useState(0);
  const [pickagemBatchNumber, setPickagemBatchNumber] = useState("");
  const [abrirModalPickagem, setAbrirModalPickagem] = useState(false);
  const [recentlyUpdatedItem, setRecentlyUpdatedItem] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const datahora = new Date();

  // Fetch item group codes for the selected production order
  const itemGroupData = useFetchProdOrderByDocEntry(pickagemOrdemProducao);

  /////////////////////////////////////////////////////////////////////////////
  const [numeroPagina, setNumeroPagina] = useState(0);
  const handlePaginaSeguinte = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      draft = draft + 20;
      return draft;
    });

    setNumeroPagina(atualizarPagina);
  };
  const handlePaginaAnterior = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      if (draft > 0) {
        return (draft = draft - 20);
      }
    });
    setNumeroPagina(atualizarPagina);
  };
  const handlePrimeiraPagina = () => {
    const atualizarPagina = produce(numeroPagina, (draft) => {
      return (draft = 0);
    });
    setNumeroPagina(atualizarPagina);
  };
  const handleManualOrderSelection = (ordemProd) => {
    console.log(
      "📦 Manual production order selection:",
      ordemProd.AbsoluteEntry
    );

    // Set the production order (same as QR scan)
    setPickagemOrdemProducao(ordemProd.AbsoluteEntry);

    // Generate batch number if needed (same logic as QR scan)
    const generatedBatch = `${ordemProd.ItemNo}${
      ordemProd.DocumentNumber || ordemProd.AbsoluteEntry
    }`;
    setPickagemBatchNumber(generatedBatch);

    // Clear previous feedback and validation state
    setFeedbackMessage(null);
    setValidouValores(false);

    // Open the modal
    setAbrirModalPickagem(true);

    console.log("✅ Production order selected manually and modal opened");
  };
  /////////////////////////////////////////////////////////////////////////////
  const { lastMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_PROD || "ws://localhost:8081/pickagem",
    {
      onOpen(event) {
        console.log("websocket aberto");
      },
      onMessage(event) {
        if (isJSON(event.data)) {
          console.log("mensagem recebida", event.data);
          const dataPARSEADA = JSON.parse(event.data);

          if (dataPARSEADA.type === "qr_data" && dataPARSEADA.payload?.parsed) {
            const qrData = dataPARSEADA.payload.parsed;
            console.log("qr data", qrData);

            // Check if this is a material QR code (F:MateriaPrima)
            if (qrData.F === "MateriaPrima") {
              console.log("Material QR code detected:", qrData);

              // Extract item name (C2) and batch number (C4)
              const itemName = qrData.C2;
              const batchNumber = qrData.C4;

              console.log(
                "Looking for item:",
                itemName,
                "with batch:",
                batchNumber
              );

              // Only process if modal is open and we have both values
              if (abrirModalPickagem && itemName && batchNumber) {
                // Get filtered production lines for the selected order
                const filteredLines = getFilteredProductionLines();

                // Find the matching item by ItemName
                const matchingItem = filteredLines.find(
                  (linha: any) => linha.ItemName === itemName
                );

                if (matchingItem) {
                  console.log(
                    "Found matching item:",
                    matchingItem.ItemNo,
                    "setting batch:",
                    batchNumber
                  );

                  // Set the batch number for this specific item
                  setItemBatchNumbers((prev) => ({
                    ...prev,
                    [matchingItem.ItemNo]: batchNumber,
                  }));

                  setRecentlyUpdatedItem(matchingItem.ItemNo);
                  setTimeout(() => setRecentlyUpdatedItem(""), 2000);

                  console.log(
                    "Batch number set successfully for item:",
                    itemName
                  );
                } else {
                  console.log("No matching item found for:", itemName);
                  console.log(
                    "Available items:",
                    filteredLines.map((linha: any) => linha.ItemName)
                  );
                }
              } else {
                console.log(
                  "Modal not open or missing data - modal open:",
                  abrirModalPickagem,
                  "itemName:",
                  itemName,
                  "batchNumber:",
                  batchNumber
                );
              }
            }
            // Handle production order QR codes (existing logic)
            else {
              // Capture batch number from C3, or generate one if empty
              const batchFromQR = qrData.C3 || "";

              if (!batchFromQR) {
                // Find the production order to generate batch number
                const ordemProducao = ordensEnchimentoSAP.data?.value.find(
                  (ordemProd) => ordemProd.AbsoluteEntry === Number(qrData.C2)
                );

                if (ordemProducao) {
                  // Generate batch number: ItemNo + DocumentNumber
                  const generatedBatch = `${ordemProducao.ItemNo}${
                    ordemProducao.DocumentNumber || ordemProducao.AbsoluteEntry
                  }`;
                  setPickagemBatchNumber(generatedBatch);
                } else {
                  setPickagemBatchNumber("");
                }
              } else {
                setPickagemBatchNumber(batchFromQR);
              }

              const atualizarPickagemOrdemEscolhida = produce(
                pickagemOrdemProducao,
                (draft) => {
                  const numeroParseado = Number(qrData.C2);
                  draft = numeroParseado;
                  console.log(numeroParseado);
                  return draft;
                }
              );
              setPickagemOrdemProducao(atualizarPickagemOrdemEscolhida);

              if (
                ordensEnchimentoSAP.data?.value.find(
                  (ordemProd) => ordemProd.AbsoluteEntry === Number(qrData.C2)
                ) !== undefined
              ) {
                setAbrirModalPickagem(true);
                setFeedbackMessage(null); // Add this line
                setValidouValores(false);
              }
            }
          }
        }
      },
      share: true,
    }
  );
  /////////////////////////////////////////////////////////////////////////////

  const [quantidadeProducao, setQuantidadeProducao] = useState(0);

  /////////////////////////////////////////////////////////////////////////////

  const FeedbackMessage = ({
    feedback,
  }: {
    feedback: { type: string; message: string } | null;
  }) => {
    if (!feedback) return null;

    const bgColor =
      feedback.type === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : feedback.type === "error"
        ? "bg-red-50 border-red-200 text-red-800"
        : "bg-blue-50 border-blue-200 text-blue-800";

    return (
      <div className={`p-3 rounded-lg border ${bgColor} mb-4`}>
        <p className="text-sm font-medium">{feedback.message}</p>
      </div>
    );
  };

  // Function to determine if a production line should be shown
  const shouldShowLine = (linha: any) => {
    const faseConsumo = linha.U_FaseConsumo;

    // If U_FaseConsumo equals 1, always show
    if (faseConsumo === "1") {
      return true;
    }

    // If U_FaseConsumo equals 2, never show
    if (faseConsumo === "2") {
      return false;
    }

    // If U_FaseConsumo equals 0, check item group code
    if (faseConsumo === "0") {
      // Find the corresponding item group code from the endpoint
      const itemGroupInfo = itemGroupData.data?.value.find(
        (item: any) => item.ItemCodeComp === linha.ItemNo
      );

      if (itemGroupInfo) {
        const itemGroupCode = itemGroupInfo.ItmsGrpCod;
        // Show only if item group code is 112 or 116
        return itemGroupCode === 112 || itemGroupCode === 116;
      }

      // If no item group info found, don't show
      return false;
    }

    // Default: don't show
    return false;
  };

  // Function to get filtered production lines
  const getFilteredProductionLines = () => {
    const currentOrder = ordensEnchimentoSAP.data?.value.find(
      (ordemProducao) => ordemProducao.AbsoluteEntry === pickagemOrdemProducao
    );

    if (!currentOrder) return [];

    return currentOrder.ProductionOrderLines.filter(
      (linhaProducao) =>
        linhaProducao.ProductionOrderIssueType === "im_Manual" &&
        shouldShowLine(linhaProducao)
    );
  };

  /////////////////////////////////////////////////////////////////////////////
  const imprimirEtiqueta = async (informacaoEtiqueta: any) => {
    const browserPrint = new ZebraBrowserPrintWrapper();
    const foundPrinter = await browserPrint.getAvailablePrinters();
    console.log(foundPrinter[0]);
    await browserPrint.setPrinter(foundPrinter[0]);

    const printerStatus = await browserPrint.checkPrinterStatus();
    console.log(browserPrint.getPrinter());
    console.log(printerStatus);
    const zpl = `${informacaoEtiqueta}`;

    await browserPrint.print(zpl);
  };
  /////////////////////////////////////////////////////////////////////////////

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen px-4 2xl:px-0">
        {ordensEnchimentoSAP.isFetching || ordensEnchimentoSAP.isRefetching ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
            <Skeleton className="h-[500px] w-[300px]" />
          </div>
        ) : (
          <div className="mx-auto">
            {
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              >
                {ordensEnchimentoSAP.data?.value.map((ordemProd, index) => (
                  <li
                    key={index}
                    className="col-span-1 flex flex-col divide-y max-w-[350px] divide-gray-200 rounded-lg bg-white text-center shadow-2xl relative"
                  >
                    <div className="flex flex-1 flex-col p-8 mx-auto">
                      {/* Manual selection button */}
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManualOrderSelection(ordemProd)}
                          className="bg-white/90 hover:bg-white shadow-sm border-green-300 text-green-700 hover:text-green-800"
                          title={`Abrir ordem ${ordemProd.AbsoluteEntry} manualmente`}
                        >
                          <ArrowRightCircle className="h-4 w-4 mr-1" />
                          Abrir
                        </Button>
                      </div>

                      <div className="mx-auto h-32 w-32 flex-shrink-0 rounded-full">
                        <QrcodeComponent
                          information={`F:produtoacabado&C1:absentry&C2:${ordemProd.AbsoluteEntry}&C3:&C4:&C5:&C6:&`}
                        />
                      </div>
                      <h3 className="mt-6 text-sm font-medium text-gray-500">
                        #{ordemProd.AbsoluteEntry}
                      </h3>
                      <dl className="mt-1 flex flex-grow flex-col justify-between">
                        <dt className="sr-only">Descriçao</dt>
                        <dd className="text-base font-semibold text-black">{`${ordemProd.ProductDescription}(${ordemProd.ItemNo})`}</dd>
                        <dt className="sr-only">Data</dt>
                        <dd className="text-sm text-gray-500 mt-2">
                          {format(ordemProd.CreationDate, "PP", { locale: pt })}
                        </dd>
                        <dt className="sr-only">Estado</dt>
                        <dd className="mt-3">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {ordemProd.ProductionOrderStatus ===
                              "boposReleased" && (
                              <span className="text-green-800">
                                Autorizada a Sair
                              </span>
                            )}
                            {ordemProd.ProductionOrderStatus ===
                              "boposClosed" && (
                              <span className="text-green-300">Concluída</span>
                            )}
                            {ordemProd.ProductionOrderStatus ===
                              "boposCancelled" && (
                              <span className="text-red-800">Cancelada</span>
                            )}
                            {ordemProd.ProductionOrderStatus ===
                              "boposPlanned" && (
                              <span className="text-yellow-800">Planeada</span>
                            )}
                          </span>
                        </dd>
                      </dl>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                            Qtd Planeada:
                            {` ${ordemProd.PlannedQuantity}`}
                          </div>
                        </div>
                        <div className="-ml-px flex w-0 flex-1">
                          <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                            Concluída:
                            {` ${ordemProd.CompletedQuantity}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            }
            <AlertDialog
              open={abrirModalPickagem}
              onOpenChange={setAbrirModalPickagem}
            >
              <AlertDialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                <AlertDialogHeader className="flex-shrink-0">
                  <AlertDialogTitle className="text-lg font-semibold">
                    Confirmação de Produção
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        Ordem de produção
                        <span className="font-medium text-gray-900 dark:text-white mx-1">
                          #{pickagemOrdemProducao}
                        </span>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Produto:
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {
                            ordensEnchimentoSAP.data?.value.find(
                              (ordemProdVal) =>
                                ordemProdVal.AbsoluteEntry ===
                                pickagemOrdemProducao
                            )?.ProductDescription
                          }
                          (
                          {
                            ordensEnchimentoSAP.data?.value.find(
                              (ordemProdVal) =>
                                ordemProdVal.AbsoluteEntry ===
                                pickagemOrdemProducao
                            )?.ItemNo
                          }
                          )
                        </span>
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {/* Add this entire section for feedback */}
                <div className="px-6">
                  {/* Feedback Message Component */}
                  {feedbackMessage && (
                    <div
                      className={`p-3 rounded-lg border mb-4 ${
                        feedbackMessage.type === "success"
                          ? "bg-green-50 border-green-200 text-green-800"
                          : feedbackMessage.type === "error"
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-blue-50 border-blue-200 text-blue-800"
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {feedbackMessage.message}
                      </p>
                    </div>
                  )}

                  {/* Processing step indicator */}
                  {isProcessing && processingStep && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-blue-800">
                          {processingStep}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                  {/* Single Production Quantity Input */}
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <Label className="text-base font-semibold text-gray-900 dark:text-white mb-2 block">
                      Quantidade de Produção
                    </Label>
                    <div className="flex flex-row gap-2 items-center">
                      <Input
                        className="w-[180px]"
                        placeholder="Quantidade"
                        type="number"
                        value={quantidadeProducao || ""}
                        onChange={(e) => {
                          setQuantidadeProducao(Number(e.target.value));
                        }}
                      />
                      <span className="text-sm text-gray-500">unidades</span>
                    </div>
                  </div>

                  {/* Calculated Material Quantities */}
                  <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">
                      Quantidades de Matéria-Prima Calculadas:
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {/* Show loading state while fetching item group data */}
                      {itemGroupData.isLoading ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">
                            A carregar dados de filtros...
                          </p>
                        </div>
                      ) : (
                        getFilteredProductionLines().map(
                          (linhaProducao, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-700 rounded p-3 border"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {linhaProducao.ItemName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ({linhaProducao.ItemNo})
                                  </p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Fase:{" "}
                                    {linhaProducao.U_FaseConsumo === "0"
                                      ? "N/A"
                                      : linhaProducao.U_FaseConsumo === "1"
                                      ? "Embalamento"
                                      : "Rotulagem"}
                                  </p>

                                  {/* New Batch Number Input */}
                                  <div className="mt-2">
                                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                                      Número de Lote:
                                    </Label>
                                    <Input
                                      className={`mt-1 h-8 text-xs ${
                                        recentlyUpdatedItem ===
                                        linhaProducao.ItemNo
                                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                          : ""
                                      }`}
                                      placeholder={
                                        pickagemBatchNumber || "Inserir lote"
                                      }
                                      value={
                                        itemBatchNumbers[
                                          linhaProducao.ItemNo
                                        ] || ""
                                      }
                                      onChange={(e) => {
                                        setItemBatchNumbers((prev) => ({
                                          ...prev,
                                          [linhaProducao.ItemNo]:
                                            e.target.value,
                                        }));
                                      }}
                                    />
                                    {!itemBatchNumbers[linhaProducao.ItemNo] &&
                                      pickagemBatchNumber && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Predefinido: {pickagemBatchNumber}
                                        </p>
                                      )}
                                  </div>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                  {(() => {
                                    const quantidadeCalculada =
                                      quantidadeProducao *
                                      linhaProducao.BaseQuantity;
                                    const isOverPlanned =
                                      quantidadeCalculada >
                                      linhaProducao.PlannedQuantity;
                                    return (
                                      <div className="space-y-1">
                                        <div
                                          className={`text-sm font-bold ${
                                            isOverPlanned
                                              ? "text-red-500"
                                              : "text-green-600"
                                          }`}
                                        >
                                          {quantidadeCalculada.toFixed(6)} L/Kg
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {linhaProducao.BaseQuantity} ×{" "}
                                          {quantidadeProducao}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          Planeado:{" "}
                                          {linhaProducao.PlannedQuantity}
                                        </div>
                                        {isOverPlanned && (
                                          <div className="text-xs text-red-500 font-medium">
                                            ⚠️ Excede planeado
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>

                <AlertDialogFooter className="flex-shrink-0 pt-4">
                  <AlertDialogCancel
                    disabled={isProcessing}
                    onClick={() => {
                      setQuantidadeProducao(0);
                      setItemBatchNumbers({}); // Clear all batch numbers
                      setFeedbackMessage(null);
                    }}
                  >
                    Cancelar
                  </AlertDialogCancel>
                  <Button
                    disabled={!validouValores || isProcessing}
                    onClick={async () => {
                      // Clear previous feedback and start processing
                      setFeedbackMessage(null);
                      setIsProcessing(true);
                      setProcessingStep(
                        "Preparando consumo de matéria-prima..."
                      );

                      try {
                        // Step 1: Create consumption payload
                        setProcessingStep(
                          "Processando consumo de matéria-prima..."
                        );

                        const consumptionDocumentLines =
                          getFilteredProductionLines().map(
                            (linhaProducao: any) => {
                              const quantidadeCalculada =
                                quantidadeProducao * linhaProducao.BaseQuantity;
                              const batchNumber =
                                itemBatchNumbers[linhaProducao.ItemNo] ||
                                pickagemBatchNumber;

                              const documentLine: any = {
                                BaseType: 202,
                                BaseEntry: pickagemOrdemProducao,
                                BaseLine: linhaProducao.LineNumber,
                              };

                              if (batchNumber && batchNumber.trim() !== "") {
                                const batchQuantity = Number(
                                  quantidadeCalculada.toFixed(6)
                                );
                                const batchNumbers = [
                                  {
                                    BatchNumber: batchNumber,
                                    Quantity: batchQuantity,
                                    ItemCode: linhaProducao.ItemNo,
                                  },
                                ];
                                const totalBatchQuantity = batchNumbers.reduce(
                                  (sum, batch) => sum + batch.Quantity,
                                  0
                                );
                                documentLine.Quantity = totalBatchQuantity;
                                documentLine.BatchNumbers = batchNumbers;
                              } else {
                                documentLine.Quantity = Number(
                                  quantidadeCalculada.toFixed(6)
                                );
                              }

                              return documentLine;
                            }
                          );

                        const consumptionPayload = {
                          DocDate: format(datahora, "yyyyMMdd", { locale: pt }),
                          DocumentLines: consumptionDocumentLines,
                        };

                        // Execute consumption first
                        await enviarConsumosSAP.mutateAsync(
                          JSON.stringify(consumptionPayload)
                        );

                        setFeedbackMessage({
                          type: "success",
                          message:
                            "✅ Consumo de matéria-prima registado com sucesso",
                        });

                        // Step 2: Create inventory entry
                        setProcessingStep(
                          "Adicionando produto acabado ao stock..."
                        );

                        const currentOrder =
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          );

                        if (!currentOrder) {
                          throw new Error("Ordem de produção não encontrada");
                        }

                        const inventoryDocumentLines = [
                          {
                            BaseType: 202,
                            BaseEntry: pickagemOrdemProducao,
                            Quantity: Number(quantidadeProducao.toFixed(6)),
                            BatchNumbers: [
                              {
                                BatchNumber: pickagemBatchNumber,
                                Quantity: Number(quantidadeProducao.toFixed(6)),
                              },
                            ],
                          },
                        ];

                        const inventoryEntryPayload = {
                          DocDate: format(datahora, "yyyyMMdd", { locale: pt }),
                          DocumentLines: inventoryDocumentLines,
                        };

                        // Execute inventory entry
                        await criarInventoryEntry.mutateAsync(
                          JSON.stringify(inventoryEntryPayload)
                        );

                        // Success - both operations completed
                        setFeedbackMessage({
                          type: "success",
                          message:
                            "🎉 Produção validada com sucesso! Consumos registados e produto acabado adicionado ao stock.",
                        });

                        setValidouValores(true);

                        // Optional: Show toast notification
                        if (typeof toast !== "undefined") {
                          toast.success("Produção validada com sucesso!");
                        }
                      } catch (error: any) {
                        console.error("Error in production validation:", error);

                        // Updated error message extraction to handle the nested structure
                        const errorMessage =
                          error?.response?.data?.error?.message?.value ||
                          error?.response?.data?.message ||
                          error?.message ||
                          "Erro desconhecido durante a validação";

                        setFeedbackMessage({
                          type: "error",
                          message: `❌ Erro na validação: ${errorMessage}`,
                        });

                        // Remove toast reference if not using
                        // if (typeof toast !== 'undefined') {
                        //   toast.error(`Erro na validação: ${errorMessage}`);
                        // }
                      } finally {
                        setIsProcessing(false);
                        setProcessingStep("");
                      }
                    }}
                    disabled={quantidadeProducao <= 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        Processando...
                      </div>
                    ) : (
                      "Validar"
                    )}
                  </Button>
                  <Button
                    disabled={!validouValores}
                    onClick={() =>
                      imprimirEtiqueta(
                        `^XA${logotipoEgiquimicaZPL}^FS^CF0,60^FO220,50^FDEgiquimica^FS^CF0,30^FO220,115^FDParque Industrial Guarda,Lt.10/15^FS^FO220,155^FDGuarda^FS^FO220,195^FDPortugal(PT)^FS^FO50,245^GB700,3,3^FS^CFD,50^FO50,265^FDOrdem Produc:^FS^CFA,45^FO50,315^FD${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.AbsoluteEntry
                        }^FS^CFD,50^FO50,400^FDLote:^FS^CFA,45^FO50,450^FD${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.ItemNo
                        }^FS^CFD,50^FO50,550^FDDescricao:^FS^CFA,45^FO50,600^FD${ordensEnchimentoSAP.data?.value
                          .find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )
                          ?.ProductDescription.substring(
                            0,
                            21
                          )}...^FS^CFA,50^FO50,700^FD${new Date().toISOString()}^FS^FO515,255^BQ,,6^FD123F:PA&C1:${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.ItemNo
                        }&C2:${ordensEnchimentoSAP.data?.value
                          .find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )
                          ?.ProductDescription.substring(
                            0,
                            21
                          )}...&C3:lote&C4:${new Date().toISOString()}&C5:${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.AbsoluteEntry
                        }&C6:&^FS^FO50,775^GB700,100,3^FS^FO50,875^GB700,300,3^FS^CF0,200^FO60,920^FD${
                          ordensEnchimentoSAP.data?.value.find(
                            (ordemProducao) =>
                              ordemProducao.AbsoluteEntry ===
                              pickagemOrdemProducao
                          )?.ItemNo
                        }^FS^CF0,50^FO250,800^FDPrd Acabado^FS^XZ`
                      )
                    }
                  >
                    <Printer className="mr-1" /> Etiquetas
                  </Button>
                  <AlertDialogAction
                    disabled={!validouValores || isProcessing}
                    onClick={async () => {
                      setValidouValores(false);
                      setFeedbackMessage(null);
                      // Reset the production quantity
                      setQuantidadeProducao(0);
                      setAbrirModalPickagem(false);
                    }}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div
              className="mt-6 flex items-center justify-center sm:mt-8"
              aria-label="Page navigation"
            >
              <div className="mt-2 gap-x-2 flex flex-col">
                <div className="flex flex-row items-center mt-2 gap-x-2">
                  <Button
                    variant="ghost"
                    size={"icon"}
                    className="h-8 w-8 p-0"
                    disabled={numeroPagina <= 0}
                    onClick={() => {
                      handlePaginaAnterior();
                    }}
                  >
                    <span className="sr-only">Página Anterior</span>
                    <ArrowLeftCircle
                      color="#84CC27"
                      size={30}
                      strokeWidth={1.5}
                    />
                  </Button>
                  <h2>Página</h2>
                  <Label className="text-lg">{numeroPagina}</Label>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    className="h-8 w-8 p-0"
                    disabled={
                      ordensEnchimentoSAP.data?.value === undefined ||
                      ordensEnchimentoSAP.data?.value.length === 0
                    }
                    onClick={() => {
                      handlePaginaSeguinte();
                    }}
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

const logotipoEgiquimicaZPL =
  "^FO50,60^GFA,2016,2016,16,,:T07IF8,S0LFC,R0NFC,Q07OFC,P03QF,P0RFC,O03SF,O0TFC,N03UF,N0VFC,M01LFCI0LFE,M07KF8K07KF8,M0KFCM0KFC,L01JFEN01JFE,L03JFP03JF,L07IFCQ0JF8,K01JFR03IFE,K03IFER01JF,K07IF8S07IF8,K07IFT03IFC,K0IFCU0IFE,J01IF8U07FFE,J03IFJ0E38O03IF,J07FFE0079F7EO01IF8,J0IFC00JFEP0IFC,I01IF800JFEP07FFE,I01IFI0IF7EP03FFE,I03FFEI0F9E3CP01IF,I07FFCI03U0IF,I07FF8I078E3C7P07FF8,I0IFJ0FDF7EF8O03FFC,I0IFJ0LFCO03FFC,001FFEJ0LFCO01FFE,001FFCJ0FDF7EF8P0FFE,003FFCJ078E3C7Q0IF,003FF8L0E1830CO07FF,007FF8J079F7CF9FO03FF8,007FFK0NFO03FF8,00FFEK0NFO01FFC,00FFEK0JFEIFO01FFC,00FFCK0FDF3CF9FP0FFC,01FFCK078418S0FFE,01FFCK078E3CS0FFE,01FF8K0FDF7ES07FE,03FF8K0JFES07FF,:03FFL0FDF7ES03FF,03FFL078E18S03FF,07FFL038E1C30EP03FF807FEL07DFBEFDFP01FF807FEL0NF8O01FF8:07FEL0FDLF8O01FF807FEL07CF3E79FP01FFC0FFEL03060C306Q0FFC0FFCL07CF3E79F3CO0FFC0FFCL0FDFBEFDFFEO0FFC0FFCL0OFEO0FFC:P07DFBEFDF3E,P03861C30E1C,P038F1C78E1C7,P07DFBEFDF3EF8,0FFCL0QFCM0FFC:0FFCL0FDFBEFDFFEFCM0FFC0FFCL07CF3E79F3C78M0FFC0FFCL01X0FFC0FFEL03071ET0FFC07FEL07CFBFS01FFC07FEL0FDIFS01FF8:07FEL0FDFBFS01FF807FEL07CF1ES01FF807FFL03W03FF803FFL078F1E78E3CF8L03FF,03FFL0FDFBEFDF7EF8L03FF,03FF8K0QFCL07FF,:01FF8K07DFBEFDFFEF8L07FE,01FFCK038F1C78F3C7M0FFE,01FFCK03861C38E1C71EK0FFE,00FFCK07DFBE7DF3EFBFK0FFC,00FFEK0SFJ01FFC,:007FFK0FDJFDFFEFBFJ03FF8,007FFK07CF3E79F3E79EJ03FF8,003FF8J01060C3061870C1I07FF,003FFCJ038F3E78F3CF9F7C00IF,001FFCJ07DFBFFDLF7E00FFE,001FFEJ0TFE01FFE,I0IFJ0SF7E03FFC,I0IFJ07DFBEFDF3EF9F7C03FFC,I07FF8I07CF1C78E1C70C1807FF8,I03FFCY0IF8,I03FFEX01IF,I01IFX03FFE,J0IF8W07FFE,J0IFCW0IFC,J07FFEV01IF8,J03IFV03IF,J01IF8U07FFE,J01IFCU0IFC,K0JFT03IFC,K07IF8S07IF8,K03IFER01JF,K01JFR03IFE,L0JFCQ0JF8,L03JFP03JF,L01JFEN01JFE,M0KF8M07JFC,M07KF8K07KF8,M01LFE001LFE,N0VFC,N03UF,O0TFC,O03SF,P0RFE,P03QF,Q07OF8,Q01NFC,R01LFE,T07IF8,,^FS";

export default ListaOrdensProducao;
