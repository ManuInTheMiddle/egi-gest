"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Printer } from "lucide-react";
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
  const orderId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

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
    C1: "", C2: "", C3: "", C4: "", C5: "", C6: "", F: ""
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
    setItensValidados
  } = usePickingItems({ OrdemCompraData: OrdemCompra.data });

  const {
    batchNumbers,
    geridoPorLotes,
    addBatchNumber,
    updateBatchQuantity,
    setBatchNumbers
  } = useBatchManagement();

  const { pickState, handlePickagem, resetPickState } = usePicking({
    itensAValidar,
    itensValidados
  });

  const {
    dataValidadeItensValidados,
    updateValidationDate,
    getValidationDate,
    setDataValidadeItensValidados
  } = useValidationDates();

  const {
    documentLinesGlobal,
    generateDocumentLines,
    clearDocumentLines
  } = useDocumentLines({ orderId });

  const { generateLabels } = useLabelGeneration({
    ordemCompraData: OrdemCompra.data,
    batchNumber: numeroLote
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
        .filter(item => item.ItemCode !== "")
        .map(item => [item.baseLine, item])
    );
  }, [itensValidados]);

  const quantityMap = useMemo(() => {
    return new Map(
      quantidadePorReceber.map(item => [item.ItemCode, item.quantidade])
    );
  }, [quantidadePorReceber]);

  const validItemsForProcessing = useMemo(() => {
    return itensValidados.filter(item => item.ItemCode !== "");
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
  }, [lancarRececaoSAPmutation.isSuccess, lancarRececaoSAPmutation.isError, router]);

  useEffect(() => {
    if (pickagens.F === "MateriaPrima" && pickagens.C1) {
      const result = handlePickagem(pickagens.C1);
      
      if (result === 'success') {
        addValidatedItem(Number(pickagens.C1));
      }
    }
  }, [pickagens, handlePickagem, addValidatedItem]);

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

  const handleBatchNumberSet = useCallback((batchNumber: string) => {
    if (!artigo || !batchNumber.trim()) {
      toast.error("Selecione um artigo e digite um número de lote");
      return;
    }

    const exists = batchNumbers.find(
      batch => batch.ItemCode === artigo && batch.BatchNumber === batchNumber
    );

    if (exists) {
      toast.error("Este lote já foi adicionado para este artigo");
      return;
    }

    addBatchNumber(artigo, batchNumber, 0);
    toast.success("Número de lote definido com sucesso");
  }, [artigo, batchNumbers, addBatchNumber]);

  const handleQuantityChange = useCallback((baseLine: number, quantity: string) => {
    const numericQuantity = parseInt(quantity) || 0;
    updateValidatedItemQuantity(baseLine, numericQuantity);
    
    // Update batch quantity if item is batch managed
    const item = itensValidados.find(item => item.baseLine === baseLine);
    if (item && geridoPorLotes.find(lote => lote.ItemCode === item.ItemCode)) {
      updateBatchQuantity(item.ItemCode, numericQuantity);
    }
  }, [updateValidatedItemQuantity, itensValidados, geridoPorLotes, updateBatchQuantity]);

  const handleDateChange = useCallback((itemCode: string, date: Date | undefined) => {
    if (date) {
      const item = itensValidados.find(validated => validated.ItemCode === itemCode);
      if (item) {
        updateValidationDate(item.baseLine, itemCode, date);
      }
    }
  }, [itensValidados, updateValidationDate]);

  const handleRemoveValidatedItem = useCallback((baseLine: number) => {
    removeValidatedItem(baseLine);
    toast.success("Item removido da lista");
  }, [removeValidatedItem]);

  const handleValidation = useCallback(() => {
    if (validItemsForProcessing.length === 0) {
      toast.error("Nenhum item para validar");
      return;
    }

    try {
      generateDocumentLines(itensValidados, geridoPorLotes, batchNumbers);
      
      // Generate labels
      const validationDatesForLabels = dataValidadeItensValidados
        .filter(item => item.ItemCode !== "")
        .map(item => ({
          ItemCode: item.ItemCode,
          dataValidade: item.dataValidade
        }));

      const labels = generateLabels(itensValidados, validationDatesForLabels);
      setEtiquetas(labels);
      
      setValidouValores(true);
      toast.success("Itens validados com sucesso");
    } catch (error) {
      console.error("Erro na validação:", error);
      toast.error("Erro ao validar itens");
    }
  }, [validItemsForProcessing, generateDocumentLines, itensValidados, geridoPorLotes, batchNumbers, dataValidadeItensValidados, generateLabels]);

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
    setItensValidados([{ ItemCode: "", timestamp: "", quantidade: 0, baseLine: 9999 }]);
    clearDocumentLines();
  }, [validouValores, docDate, cardCode, documentLinesGlobal, lancarRececaoSAPmutation, setItensValidados, clearDocumentLines]);

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
            onClick={() => router.push('/chegadaMateriaPrima')} 
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700 lg:max-w-xl xl:max-w-2xl">
        {OrdemCompra.data.DocumentLines.map((item) => (
          <PickingItem 
            key={item.LineNum} 
            item={item} 
            isValidated={validatedItemsMap.has(item.LineNum)}
            quantidadeRestante={quantityMap.get(item.ItemCode)}
          />
        ))}
      </div>
    );
  };

  const renderValidationDialog = () => (
    <AlertDialogContent className="max-w-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle>Confirmar Receção</AlertDialogTitle>
        <AlertDialogDescription className="mx-auto">
          <section className="bg-white py-4 antialiased dark:bg-gray-900 md:py-16">
            <div className="mx-auto max-w-2xl px-4 2xl:px-0">
              <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                Quaisquer alterações que desejar realizar no lançamento da receção de produtos da ordem{" "}
                <span className="font-medium text-gray-900 dark:text-white">#{orderId}</span>{" "}
                deverá ser feita agora.
              </p>
              <div className="space-y-4 max-h-[339px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
                {validItemsForProcessing.map((item, index) => {
                  const orderLine = OrdemCompra.data?.DocumentLines.find(
                    line => line.ItemCode === item.ItemCode
                  );
                  const validationDate = dataValidadeItensValidados.find(
                    date => date.ItemCode === item.ItemCode
                  );

                  return (
                    <div key={`${item.ItemCode}-${item.baseLine}-${index}`} className="border border-gray-300 rounded-lg p-4">
                      <dl className="sm:flex items-center justify-between gap-4">
                        <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                          {orderLine?.ItemDescription} ({item.ItemCode})
                        </dt>
                        <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                          <div className="flex flex-row gap-1 items-center">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Quantidade:
                            </span>
                            <Input
                              className="w-[85px]"
                              type="number"
                              min="0"
                              defaultValue={item.quantidade}
                              onChange={(e) => handleQuantityChange(item.baseLine, e.target.value)}
                            />
                          </div>
                          <div className="flex flex-row gap-1 items-center mt-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Validade:
                            </span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-[180px] justify-start text-left font-normal",
                                    !validationDate?.dataValidade && "text-muted-foreground"
                                  )}
                                >
                                  {validationDate?.dataValidade ? (
                                    formatDate(validationDate.dataValidade, "P")
                                  ) : (
                                    <>
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      <span>Selecionar data</span>
                                    </>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={validationDate?.dataValidade ? new Date(validationDate.dataValidade) : undefined}
                                  onSelect={(date) => handleDateChange(item.ItemCode, date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </dd>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveValidatedItem(item.baseLine)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </dl>
                      <Separator className="mt-2" />
                    </div>
                  );
                })}
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
          {lancarRececaoSAPmutation.isPending ? "A processar..." : "Confirmar"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

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
              
              <BatchManagement
                validatedItems={itensValidados}
                onArtigoChange={handleArtigoChange}
                onLoteRefetch={handleLoteRefetch}
                onBatchNumberSet={handleBatchNumberSet}
                isLoading={quantidadeLote.isRefetching || quantidadeLote.isFetching}
                loteData={quantidadeLote.data?.value}
              />

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
                  <p><strong>C1:</strong> {pickagens?.C1 || "N/A"}</p>
                  <p><strong>C2:</strong> {pickagens?.C2 || "N/A"}</p>
                  <p><strong>C3:</strong> {pickagens?.C3 || "N/A"}</p>
                  <p><strong>Tipo:</strong> {pickagens?.F || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
  );
};

export default MainPickagem;