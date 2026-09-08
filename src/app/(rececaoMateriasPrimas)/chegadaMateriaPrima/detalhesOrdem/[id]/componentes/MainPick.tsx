"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Printer } from "lucide-react";
import { EnhancedCalendar } from "./EnhancedCalendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom hooks
import { usePicking } from "../hooks/usePicking";
import { useBatchManagement } from "../hooks/useBatchManagment";
import { useQRScanning } from "../hooks/useQRScanning";
import { useDateFormatting } from "../hooks/useDateFormating";
import { usePickingItems } from "../hooks/usePickingItems";
import { useValidationDates } from "../hooks/useValidationDates";
import { useDocumentLines } from "../hooks/useDocumentLines";
import { useLabelGeneration } from "../hooks/useLabelGeneration";
import { usePrinting } from "../hooks/usePrinting";

// Components
import PickingProgress from "./PickingProgress";
import PickingStatus from "./PickingStatus";
import PickingItem from "./PickingItem";
import BatchManagement from "./BatchManagment";
import ValidationHistory from "./ValidationHistory";
import LoadingFallback from "./LoadingFallbacks";
import ErrorFallback from "./ErrorFallback";

// Types
import { QRData, ValidatedItem } from "../constantsAndTypes/pickingTypes";
import { SAP_CONFIG } from "../constantsAndTypes/pickingConstants";

// API hooks (your existing ones)
import { useFetchUmaOrdemCompraSAPData } from "@/Services/OrdensCompra/fetchUmaOrdemCompraSAP";
import { useFetchQuantidadeArtigoLote } from "@/Services/LotesPorArtigo/fetchQuantidadeArtigoLote";
import { useFetchBatchManagedSAPData } from "@/Services/Inventario/fetchVerificarBatchNumber";
import { useLancarRececaoSAP } from "@/Services/RececoesMercadoria/criarRececaoMercadoria";

// Utility components
import Retorceder from "./retorceder";
import CardsOrdens from "../../../componentes/cardsOrdens";

const MainPickagem: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const orderId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  // Date utilities
  const { formatForSAP, formatDate } = useDateFormatting();

  // API calls
  const OrdemCompra = useFetchUmaOrdemCompraSAPData(Number(orderId));
  const lancarRececaoSAPmutation = useLancarRececaoSAP();

  // State for current selections and form data
  const [artigo, setArtigo] = useState<string>("");
  const [numeroLote, setNumeroLote] = useState<string>("");
  const [cardCode, setCardCode] = useState<string>("");
  const [docDate, setDocDate] = useState<string>("");
  const [validouValores, setValidouValores] = useState<boolean>(false);
  const [pickagens, setPickagens] = useState<QRData>({
    C1: "",
    C2: "",
    C3: "",
    C4: "",
    C5: "",
    C6: "",
    F: "",
  });
  const [etiquetas, setEtiquetas] = useState<string[]>([]);

  // Custom hooks for business logic
  const {
    itensValidados,
    itensAValidar,
    quantidadePorReceber,
    itensPorPickar,
    addValidatedItem,
    removeValidatedItem,
    updateValidatedItemQuantity,
    setItensValidados,
  } = usePickingItems({ OrdemCompraData: OrdemCompra.data });

  const {
    batchNumbers,
    geridoPorLotes,
    addBatchNumber,
    updateBatchQuantity,
    updateBatchExpiryDate,
    setBatchNumbers,
    setGeridoPorLotes,
  } = useBatchManagement();

  const { pickState, handlePickagem, resetPickState } = usePicking({
    itensAValidar,
    itensValidados,
  });

  const {
    dataValidadeItensValidados,
    updateValidationDate,
    getValidationDate,
    setDataValidadeItensValidados,
  } = useValidationDates();

  const { documentLinesGlobal, generateDocumentLines, clearDocumentLines } =
    useDocumentLines({ orderId });

  const { generateLabels } = useLabelGeneration({
    ordemCompraData: OrdemCompra.data,
    batchNumber: numeroLote,
  });

  const { printLabels } = usePrinting();

  // Additional API calls for batch management
  const quantidadeLote = useFetchQuantidadeArtigoLote(artigo);
  const geridoPorLotesSAP = useFetchBatchManagedSAPData(artigo);

  // QR Code handling
  const handleQRData = useCallback((qrData: QRData) => {
    setPickagens(qrData);
  }, []);

  useQRScanning({ onQRData: handleQRData });

  // Memoized calculations for performance
  const validatedItemsMap = useMemo(() => {
    return new Map(
      itensValidados
        .filter((item) => item.ItemCode !== "")
        .map((item) => [item.baseLine, item])
    );
  }, [itensValidados]);

  const quantityMap = useMemo(() => {
    return new Map(
      quantidadePorReceber.map((item) => [item.ItemCode, item.quantidade])
    );
  }, [quantidadePorReceber]);

  const validItemsForProcessing = useMemo(() => {
    return itensValidados.filter((item) => item.ItemCode !== "");
  }, [itensValidados]);

  // Effects
  useEffect(() => {
    if (OrdemCompra.data) {
      setCardCode(OrdemCompra.data.CardCode || "");
      setDocDate(formatForSAP(new Date()));
    }
  }, [OrdemCompra.data, formatForSAP]);

  useEffect(() => {
    if (lancarRececaoSAPmutation.isSuccess) {
      toast.success("Receção Realizada com Sucesso!");
      router.push(`/chegadaMateriaPrima`);
    }
    if (lancarRececaoSAPmutation.isError) {
      toast.error("Erro ao realizar receção");
    }
  }, [
    lancarRececaoSAPmutation.isSuccess,
    lancarRececaoSAPmutation.isError,
    router,
  ]);

  useEffect(() => {
    if (pickagens.F === "MateriaPrima" && pickagens.C1) {
      const result = handlePickagem(pickagens.C1);

      if (result === "success") {
        addValidatedItem(Number(pickagens.C1));
      }
    }
  }, [pickagens, handlePickagem, addValidatedItem]);

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    if (
      quantidadeLote.data?.value &&
      Array.isArray(quantidadeLote.data.value)
    ) {
      // Convert loteData to geridoPorLotes format
      const batchManagedItems = quantidadeLote.data.value
        .filter((lote) => lote.IsBatchManaged === "Y") // Only batch-managed items
        .map((lote) => ({
          ItemCode: lote.ItemCode,
          simNao: true,
        }));

      console.log(
        "🔍 DEBUG - Converting loteData to geridoPorLotes:",
        batchManagedItems
      );
      setGeridoPorLotes(batchManagedItems);
    }
  }, [quantidadeLote.data, setGeridoPorLotes]);

  // Event handlers
  const handleArtigoChange = useCallback((selectedArtigo: string) => {
    setArtigo(selectedArtigo);
  }, []);

  const handleLoteRefetch = useCallback(() => {
    if (!artigo) {
      toast.error("Selecione um artigo primeiro");
      return;
    }
    quantidadeLote.refetch();
    geridoPorLotesSAP.refetch();
  }, [artigo, quantidadeLote, geridoPorLotesSAP]);

  const handleBatchNumberSet = useCallback(
    (batchNumber: string) => {
      if (!artigo || !batchNumber.trim()) {
        toast.error("Selecione um artigo e digite um número de lote");
        return;
      }

      const exists = batchNumbers.find(
        (batch) =>
          batch.ItemCode === artigo && batch.BatchNumber === batchNumber
      );

      if (exists) {
        toast.error("Este lote já foi adicionado para este artigo");
        return;
      }

      // CHANGED: Use default date instead of getting existing validation date
      const defaultExpiryDate = new Date();
      // Add 30 days as default expiry (adjust based on your business rules)
      defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
      const expiryDateISO = defaultExpiryDate.toISOString();

      // Create batch with default expiry date
      addBatchNumber(artigo, batchNumber, 0, expiryDateISO);

      // ADDED: Also initialize validation date for this item if it doesn't exist
      const existingValidationDate = dataValidadeItensValidados.find(
        (item) => item.ItemCode === artigo
      );

      if (!existingValidationDate) {
        // Find the corresponding validated item to get baseLine
        const validatedItem = itensValidados.find(
          (item) => item.ItemCode === artigo
        );

        if (validatedItem) {
          updateValidationDate(
            validatedItem.baseLine,
            artigo,
            defaultExpiryDate
          );
        }
      }

      toast.success("Número de lote definido com sucesso");
    },
    [
      artigo,
      batchNumbers,
      addBatchNumber,
      dataValidadeItensValidados,
      itensValidados,
      updateValidationDate,
    ]
  );

  const handleQuantityChange = useCallback(
    (baseLine: number, quantity: string) => {
      const numericQuantity = parseInt(quantity) || 0;
      updateValidatedItemQuantity(baseLine, numericQuantity);

      // Update batch quantity if item is batch managed
      const item = itensValidados.find((item) => item.baseLine === baseLine);
      if (item) {
        const isBatchManaged = geridoPorLotes.find(
          (lote) => lote.ItemCode === item.ItemCode && lote.simNao
        );

        if (isBatchManaged) {
          // Get all batches for this item
          const itemBatches = batchNumbers.filter(
            (batch) => batch.ItemCode === item.ItemCode
          );

          if (itemBatches.length > 0) {
            // Distribute quantity across batches (you might want to modify this logic)
            const quantityPerBatch = Math.floor(
              numericQuantity / itemBatches.length
            );
            const remainder = numericQuantity % itemBatches.length;

            itemBatches.forEach((batch, index) => {
              const batchQuantity =
                quantityPerBatch + (index < remainder ? 1 : 0);
              updateBatchQuantity(item.ItemCode, batchQuantity);
            });

            toast.success(
              `Quantidade distribuída por ${itemBatches.length} lote(s)`
            );
          } else {
            toast.warning(
              "Defina primeiro os números de lote para este artigo"
            );
          }
        }
      }
    },
    [
      updateValidatedItemQuantity,
      itensValidados,
      geridoPorLotes,
      batchNumbers,
      updateBatchQuantity,
    ]
  );

  // Update the handleDateChange callback to properly sync with batches
  const handleDateChange = useCallback(
    (itemCode: string, date: Date | undefined) => {
      if (date) {
        const item = itensValidados.find(
          (validated) => validated.ItemCode === itemCode
        );
        if (item) {
          // Update the validation date
          updateValidationDate(item.baseLine, itemCode, date);

          // ENHANCED: Update batch expiry dates if this item has batches
          const itemBatches = batchNumbers.filter(
            (batch) => batch.ItemCode === itemCode
          );

          if (itemBatches.length > 0) {
            const expiryDateISO = date.toISOString();

            // Update all batches for this item with the new expiry date
            itemBatches.forEach((batch) => {
              updateBatchExpiryDate(itemCode, batch.BatchNumber, expiryDateISO);
            });

            toast.success(
              `Data de validade atualizada para ${itemBatches.length} lote(s)`
            );
          } else {
            toast.success("Data de validade atualizada");
          }
        }
      }
    },
    [itensValidados, updateValidationDate, batchNumbers, updateBatchExpiryDate]
  );

  const handleRemoveValidatedItem = useCallback(
    (baseLine: number) => {
      removeValidatedItem(baseLine);
      toast.success("Item removido da lista");
    },
    [removeValidatedItem]
  );

  // Add this new validation function before handleValidation
  const validateBatchRequirements = useCallback(() => {
    const errors: string[] = [];

    validItemsForProcessing.forEach((item) => {
      // Check if item is batch-managed
      const isBatchManaged = geridoPorLotes.find(
        (lote) => lote.ItemCode === item.ItemCode && lote.simNao
      );

      if (isBatchManaged) {
        // Check if batches are assigned
        const itemBatches = batchNumbers.filter(
          (batch) => batch.ItemCode === item.ItemCode
        );

        if (itemBatches.length === 0) {
          const orderLine = OrdemCompra.data?.DocumentLines.find(
            (line) => line.ItemCode === item.ItemCode
          );
          errors.push(
            `${
              orderLine?.ItemDescription || item.ItemCode
            } necessita de número de lote`
          );
        }
      }

      // Check if quantities are set
      if (item.quantidade === 0) {
        const orderLine = OrdemCompra.data?.DocumentLines.find(
          (line) => line.ItemCode === item.ItemCode
        );
        errors.push(
          `${
            orderLine?.ItemDescription || item.ItemCode
          } necessita de quantidade maior que zero`
        );
      }

      // Check if validation dates are set
      const validationDate = dataValidadeItensValidados.find(
        (date) => date.ItemCode === item.ItemCode
      );

      if (!validationDate || !validationDate.dataValidade) {
        const orderLine = OrdemCompra.data?.DocumentLines.find(
          (line) => line.ItemCode === item.ItemCode
        );
        errors.push(
          `${
            orderLine?.ItemDescription || item.ItemCode
          } necessita de data de validade`
        );
      }
    });

    return errors;
  }, [
    validItemsForProcessing,
    geridoPorLotes,
    batchNumbers,
    dataValidadeItensValidados,
    OrdemCompra.data,
  ]);

  const handleValidation = useCallback(() => {
    if (validItemsForProcessing.length === 0) {
      toast.error("Nenhum item para validar");
      return;
    }

    // ADDED: Check batch requirements first
    const validationErrors = validateBatchRequirements();

    if (validationErrors.length > 0) {
      toast.error(`Erros de validação:\n${validationErrors.join("\n")}`);
      return;
    }

    try {
      generateDocumentLines(itensValidados, geridoPorLotes, batchNumbers);

      // Generate labels
      const validationDatesForLabels = dataValidadeItensValidados
        .filter((item) => item.ItemCode !== "")
        .map((item) => ({
          ItemCode: item.ItemCode,
          dataValidade: item.dataValidade,
        }));

      const labels = generateLabels(itensValidados, validationDatesForLabels);
      setEtiquetas(labels);

      setValidouValores(true);
      toast.success("Itens validados com sucesso");
    } catch (error) {
      console.error("Erro na validação:", error);
      toast.error("Erro ao validar itens");
    }
  }, [
    validItemsForProcessing,
    validateBatchRequirements, // Added dependency
    generateDocumentLines,
    itensValidados,
    geridoPorLotes,
    batchNumbers,
    dataValidadeItensValidados,
    generateLabels,
  ]);

  const handlePrintLabels = useCallback(async () => {
    if (etiquetas.length === 0) {
      toast.error("Nenhuma etiqueta para imprimir");
      return;
    }

    try {
      const combinedLabels = etiquetas.join("");
      await printLabels(combinedLabels);
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      toast.error("Erro ao imprimir etiquetas");
    }
  }, [etiquetas, printLabels]);

  const handleConfirmReceiving = useCallback(() => {
    if (!validouValores) {
      toast.error("Valide os itens antes de confirmar");
      return;
    }

    const payload = {
      DocDate: docDate,
      CardCode: cardCode,
      DocumentLines: documentLinesGlobal,
    };

    lancarRececaoSAPmutation.mutate(JSON.stringify(payload));
    setValidouValores(false);
    setItensValidados([
      { ItemCode: "", timestamp: "", quantidade: 0, baseLine: 9999 },
    ]);
    clearDocumentLines();
  }, [
    validouValores,
    docDate,
    cardCode,
    documentLinesGlobal,
    lancarRececaoSAPmutation,
    setItensValidados,
    clearDocumentLines,
  ]);

  // Render helpers
  const renderContent = () => {
    if (OrdemCompra.isLoading) {
      return <LoadingFallback message="A carregar ordem de compra..." />;
    }

    if (OrdemCompra.isError) {
      return (
        <ErrorFallback
          error={OrdemCompra.error as Error}
          onRetry={() => OrdemCompra.refetch()}
        />
      );
    }

    if (!OrdemCompra.data?.DocumentLines?.length) {
      return (
        <div className="text-center p-8">
          <p>Nenhum item encontrado nesta ordem de compra.</p>
          <Button
            onClick={() => router.push("/chegadaMateriaPrima")}
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700 lg:max-w-xl xl:max-w-2xl">
        {OrdemCompra.data.DocumentLines.map((item) => {
          const isValidated = validatedItemsMap.has(item.LineNum);

          return (
            <div key={item.LineNum} className="flex items-center">
              {/* Your existing PickingItem component */}
              <div className="flex-1">
                <PickingItem
                  item={item}
                  isValidated={isValidated}
                  quantidadeRestante={quantityMap.get(item.ItemCode)}
                />
              </div>

              {/* Manual validation button */}
              <div className="p-2 flex items-center">
                {!isValidated ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleManualValidation(item)}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                    title={`Validar ${item.ItemCode} manualmente (mesmo que QR)`}
                  >
                    Validar
                  </Button>
                ) : (
                  <span className="text-green-600 text-sm font-medium">
                    Validado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getValidationProgress = useCallback(() => {
    const totalItems = validItemsForProcessing.length;

    // Get items that require batch management
    const batchManagedItems = validItemsForProcessing.filter((item) =>
      geridoPorLotes.find(
        (lote) => lote.ItemCode === item.ItemCode && lote.simNao
      )
    );

    // Count how many batch-managed items have batches assigned
    const batchesSet = batchManagedItems.filter((item) =>
      batchNumbers.some((batch) => batch.ItemCode === item.ItemCode)
    ).length;

    // Count how many items have quantities set (> 0)
    const quantitiesSet = validItemsForProcessing.filter(
      (item) => item.quantidade > 0
    ).length;

    // Count how many items have validation dates set
    const datesSet = validItemsForProcessing.filter((item) =>
      dataValidadeItensValidados.some(
        (date) => date.ItemCode === item.ItemCode && date.dataValidade
      )
    ).length;

    // Calculate overall progress percentage
    const batchManagedCount = batchManagedItems.length;
    const totalSteps = batchManagedCount + totalItems * 2; // batches + quantities + dates
    const completedSteps = batchesSet + quantitiesSet + datesSet;
    const progressPercentage =
      totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      totalItems,
      batchManagedItems: batchManagedCount,
      batchesSet,
      quantitiesSet,
      datesSet,
      progressPercentage,
      isComplete:
        batchesSet === batchManagedCount &&
        quantitiesSet === totalItems &&
        datesSet === totalItems,
    };
  }, [
    validItemsForProcessing,
    geridoPorLotes,
    batchNumbers,
    dataValidadeItensValidados,
  ]);

  const handleManualValidation = useCallback((item) => {
    // Simulate the exact same QR scanning process
    const simulatedQRData = {
      C1: item.LineNum.toString(), // This should match what your QR codes contain
      C2: item.ItemCode || "",
      C3: "",
      C4: "",
      C5: "",
      C6: "",
      F: "MateriaPrima",
    };

    // Set pickagens state (this triggers the same useEffect as QR scanning)
    setPickagens(simulatedQRData);

    toast.success(`${item.ItemCode} validado manualmente`);
  }, []);

  const renderValidationDialog = () => {
    // Calculate progress
    const progress = getValidationProgress();

    return (
      <AlertDialogContent className="max-w-4xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Receção</AlertDialogTitle>
          <AlertDialogDescription className="mx-auto">
            <section className="bg-white py-4 antialiased dark:bg-gray-900 md:py-16">
              <div className="mx-auto max-w-4xl px-4 2xl:px-0">
                <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                  Quaisquer alterações que desejar realizar no lançamento da
                  receção de produtos da ordem{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    #{orderId}
                  </span>{" "}
                  deverá ser feita agora.
                </p>

                {/* PROGRESS INDICATOR - RESTORED */}
                {validItemsForProcessing.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Progresso da Receção
                      </h4>
                      <span
                        className={`text-sm font-medium ${
                          progress.isComplete
                            ? "text-green-600 dark:text-green-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {Math.round(progress.progressPercentage)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          progress.isComplete ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${progress.progressPercentage}%` }}
                      ></div>
                    </div>

                    {/* Progress Details */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div
                          className={`font-medium ${
                            progress.batchesSet === progress.batchManagedItems
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {progress.batchesSet}/{progress.batchManagedItems}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Lotes Definidos
                        </div>
                      </div>

                      <div className="text-center">
                        <div
                          className={`font-medium ${
                            progress.quantitiesSet === progress.totalItems
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {progress.quantitiesSet}/{progress.totalItems}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Quantidades
                        </div>
                      </div>

                      <div className="text-center">
                        <div
                          className={`font-medium ${
                            progress.datesSet === progress.totalItems
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {progress.datesSet}/{progress.totalItems}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Datas Validade
                        </div>
                      </div>
                    </div>

                    {/* Completion Status */}
                    {progress.isComplete && (
                      <div className="mt-3 flex items-center text-green-600 dark:text-green-400 text-sm">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Pronto para validação
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 1: Batch Management Section - MOVED TO TOP */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    1. Gestão de Lotes
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      Defina os números de lote para os artigos que necessitam
                      de rastreabilidade por lotes.
                    </p>
                    <BatchManagement
                      validatedItems={validItemsForProcessing}
                      onArtigoChange={handleArtigoChange}
                      onLoteRefetch={handleLoteRefetch}
                      onBatchNumberSet={handleBatchNumberSet}
                      isLoading={
                        quantidadeLote.isRefetching || quantidadeLote.isFetching
                      }
                      loteData={quantidadeLote.data?.value}
                    />
                  </div>
                </div>

                {/* STEP 2: Quantity and Validation Date Section - MOVED DOWN */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    2. Quantidades e Datas de Validade
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                    {validItemsForProcessing.map((item, index) => {
                      const orderLine = OrdemCompra.data?.DocumentLines.find(
                        (line) => line.ItemCode === item.ItemCode
                      );
                      const validationDate = dataValidadeItensValidados.find(
                        (date) => date.ItemCode === item.ItemCode
                      );

                      // Check if this item has batches assigned
                      const itemBatches = batchNumbers.filter(
                        (batch) => batch.ItemCode === item.ItemCode
                      );
                      const isBatchManaged = geridoPorLotes.find(
                        (lote) => lote.ItemCode === item.ItemCode
                      );

                      return (
                        <div
                          key={`${item.ItemCode}-${item.baseLine}-${index}`}
                          className="border border-gray-300 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {orderLine?.ItemDescription}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Código: {item.ItemCode}
                              </p>

                              {/* Show batch status */}
                              {isBatchManaged && (
                                <div className="mt-2">
                                  {itemBatches.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                                        Lotes:{" "}
                                        {itemBatches
                                          .map((b) => b.BatchNumber)
                                          .join(", ")}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                                      ⚠️ Necessita lote - defina na secção acima
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveValidatedItem(item.baseLine)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Quantidade:
                              </label>
                              <Input
                                type="number"
                                min="0"
                                max={item.quantidade}
                                defaultValue={0}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.baseLine,
                                    e.target.value
                                  )
                                }
                                className="w-full"
                                // Disable if batch-managed but no batches assigned
                                disabled={
                                  isBatchManaged && itemBatches.length === 0
                                }
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Data de Validade:
                              </label>
                              <EnhancedCalendar
                                selected={
                                  validationDate?.dataValidade
                                    ? new Date(validationDate.dataValidade)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  handleDateChange(item.ItemCode, date)
                                }
                                placeholder="Selecionar data"
                                formatDate={(date) => formatDate(date, "P")}
                                buttonClassName="w-full"
                                // Disable if batch-managed but no batches assigned
                                disabled={
                                  isBatchManaged && itemBatches.length === 0
                                }
                              />
                            </div>
                          </div>

                          <Separator className="mt-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            disabled={validItemsForProcessing.length === 0}
            onClick={handleValidation}
          >
            Validar
          </Button>
          <Button
            disabled={!validouValores || etiquetas.length === 0}
            onClick={handlePrintLabels}
          >
            <Printer className="mr-1 h-4 w-4" /> Etiquetas
          </Button>
          <AlertDialogAction
            disabled={!validouValores}
            onClick={handleConfirmReceiving}
          >
            {lancarRececaoSAPmutation.isPending
              ? "A processar..."
              : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  };

  // CORRECTED MAIN RETURN - Remove the comment and use section
  return (
    <section className="border-2 border-slate-600 rounded-lg p-6 shadow-2xl mx-auto my-4 w-full max-w-7xl bg-white">
      <Retorceder numeroOrdem={id} />
      <div className="flex flex-col gap-x-1 h-full w-full">
        <PickingProgress
          itemsToPick={itensPorPickar}
          totalItems={OrdemCompra.data?.DocumentLines.length || 0}
        />

        <div className="mt-6 sm:mt-8 lg:flex lg:gap-8">
          {renderContent()}

          <div className="mt-6 grow sm:mt-8 lg:mt-0">
            <ValidationHistory validatedItems={itensValidados} />

            <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                Status dos Lotes:
              </h4>
              {validItemsForProcessing.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {validItemsForProcessing.map((item) => {
                    const isBatchManaged = geridoPorLotes.find(
                      (lote) => lote.ItemCode === item.ItemCode && lote.simNao
                    );
                    const itemBatches = batchNumbers.filter(
                      (batch) => batch.ItemCode === item.ItemCode
                    );
                    const orderLine = OrdemCompra.data?.DocumentLines.find(
                      (line) => line.ItemCode === item.ItemCode
                    );

                    return (
                      <div
                        key={item.ItemCode}
                        className="flex justify-between items-center"
                      >
                        <span className="text-blue-700 dark:text-blue-300">
                          {orderLine?.ItemDescription || item.ItemCode}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            isBatchManaged
                              ? itemBatches.length > 0
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {isBatchManaged
                            ? itemBatches.length > 0
                              ? `Lotes: ${itemBatches.length}`
                              : "Necessita lote"
                            : "Não requer lote"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Nenhum item validado ainda. Use o botão "Confirmar Receção"
                  para gerir lotes.
                </p>
              )}
            </div>

            <div className="gap-4 sm:flex sm:items-center mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={validItemsForProcessing.length === 0}
                    className="w-full sm:w-auto"
                  >
                    Confirmar Receção
                  </Button>
                </AlertDialogTrigger>
                {renderValidationDialog()}
              </AlertDialog>
            </div>

            <div className="mt-6">
              <PickingStatus pickState={pickState} />
            </div>

            <div className="flex flex-col mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-2">Última Pickagem:</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>C1:</strong> {pickagens?.C1 || "N/A"}
                </p>
                <p>
                  <strong>C2:</strong> {pickagens?.C2 || "N/A"}
                </p>
                <p>
                  <strong>C3:</strong> {pickagens?.C3 || "N/A"}
                </p>
                <p>
                  <strong>Tipo:</strong> {pickagens?.F || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainPickagem;
