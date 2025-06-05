"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { produce } from "immer";
import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
import {
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { ScrollText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";

import { useAtualizarEstadoOrdemSAP } from "@/Services/OrdensProducao/updateEstadoOrdemSAP";
import { useCriarOrdemProducaoSCADA } from "@/Services/OrdensProducao/criarOrdemProducaoSCADA";
import { useFetchOrdemProdSCADA } from "@/Services/OrdensProducao/fetchOrdemProducaoSCADA";
import { useAtualizarReatorOrdemSCADA } from "@/Services/OrdensProducao/updateReatorOrdemSCADA";
import { useFetchConsumosSCADA } from "@/Services/Consumos/fetchConsumosSCADA";
import { useConsumoSAP } from "@/Services/Consumos/criarConsumo";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";

// ==================== COMPONENTS ====================
import { OrderDetailsForm } from "../componentes/OrderDetailsForm";
import { OrderMaterialsTable } from "../componentes/OrderMaterialsTable";
import { OrderActionButtons } from "../componentes/OrderActionButtons";
import { ValidationDialog } from "../componentes/ValidationDialog";
import { ConsumptionDialog } from "../componentes/ConsumptionDialog";

// ==================== CONSTANTS ====================
const REACTORS = [
  { id: 1, nome: "Reator 1" },
  { id: 2, nome: "Reator 2" },
  { id: 3, nome: "Reator 3" },
  { id: 4, nome: "Reator 4" },
  { id: 5, nome: "Reator 5" },
  { id: 6, nome: "Reator 6" },
  { id: 7, nome: "Reator 7" },
  { id: 8, nome: "Reator 8" },
] as const;

const ORDER_STATES = [
  { id: 1, statusSAP: "boposPlanned", estado: "Planeada" },
  { id: 2, statusSAP: "boposReleased", estado: "Autorizada a Sair" },
  { id: 3, statusSAP: "boposClosed", estado: "Fechada" },
  { id: 4, statusSAP: "boposCancelled", estado: "Cancelada" },
] as const;

const TPIS = [
  { Receita: "231", TPI: 1 }, { Receita: "219F", TPI: 2 }, { Receita: "215E", TPI: 3 },
  { Receita: "215", TPI: 4 }, { Receita: "214D", TPI: 5 }, { Receita: "214", TPI: 6 },
  { Receita: "213", TPI: 7 }, { Receita: "216", TPI: 8 }, { Receita: "609", TPI: 9 },
  { Receita: "604", TPI: 10 }, { Receita: "232", TPI: 11 }, { Receita: "219", TPI: 12 },
  { Receita: "210", TPI: 13 }, { Receita: "200R", TPI: 14 }, { Receita: "205", TPI: 15 },
  { Receita: "214M", TPI: 16 }, { Receita: "209T", TPI: 17 }, { Receita: "209", TPI: 18 },
  { Receita: "607D", TPI: 19 }, { Receita: "216D", TPI: 20 }, { Receita: "745", TPI: 21 },
  { Receita: "609D", TPI: 22 }, { Receita: "601", TPI: 23 }, { Receita: "605D", TPI: 24 },
  { Receita: "602", TPI: 25 }, { Receita: "604D", TPI: 26 }, { Receita: "605", TPI: 27 },
  { Receita: "608", TPI: 28 }, { Receita: "607", TPI: 29 }, { Receita: "603", TPI: 30 },
  { Receita: "229", TPI: 31 },
] as const;

const EGIQUIMICA_LOGO_ZPL = "^FO50,60^GFA,2016,2016,16,,:T07IF8,S0LFC,R0NFC,Q07OFC,P03QF,P0RFC,O03SF,O0TFC,N03UF,N0VFC,M01LFCI0LFE,M07KF8K07KF8,M0KFCM0KFC,L01JFEN01JFE,L03JFP03JF,L07IFCQ0JF8,K01JFR03IFE,K03IFER01JF,K07IF8S07IF8,K07IFT03IFC,K0IFCU0IFE,J01IF8U07FFE,J03IFJ0E38O03IF,J07FFE0079F7EO01IF8,J0IFC00JFEP0IFC,I01IF800JFEP07FFE,I01IFI0IF7EP03FFE,I03FFEI0F9E3CP01IF,I07FFCI03U0IF,I07FF8I078E3C7P07FF8,I0IFJ0FDF7EF8O03FFC,I0IFJ0LFCO03FFC,001FFEJ0LFCO01FFE,001FFCJ0FDF7EF8P0FFE,003FFCJ078E3C7Q0IF,003FF8L0E1830CO07FF,007FF8J079F7CF9FO03FF8,007FFK0NFO03FF8,00FFEK0NFO01FFC,00FFEK0JFEIFO01FFC,00FFCK0FDF3CF9FP0FFC,01FFCK078418S0FFE,01FFCK078E3CS0FFE,01FF8K0FDF7ES07FE,03FF8K0JFES07FF,:03FFL0FDF7ES03FF,03FFL078E18S03FF,07FFL038E1C30EP03FF807FEL07DFBEFDFP01FF807FEL0NF8O01FF8:07FEL0FDLF8O01FF807FEL07CF3E79FP01FFC0FFEL03060C306Q0FFC0FFCL07CF3E79F3CO0FFC0FFCL0FDFBEFDFFEO0FFC0FFCL0OFEO0FFC:P07DFBEFDF3E,P03861C30E1C,P038F1C78E1C7,P07DFBEFDF3EF8,0FFCL0QFCM0FFC:0FFCL0FDFBEFDFFEFCM0FFC0FFCL07CF3E79F3C78M0FFC0FFCL01X0FFC0FFEL03071ET0FFC07FEL07CFBFS01FFC07FEL0FDIFS01FF8:07FEL0FDFBFS01FF807FEL07CF1ES01FF807FFL03W03FF803FFL078F1E78E3CF8L03FF,03FFL0FDFBEFDF7EF8L03FF,03FF8K0QFCL07FF,:01FF8K07DFBEFDFFEF8L07FE,01FFCK038F1C78F3C7M0FFE,01FFCK03861C38E1C71EK0FFE,00FFCK07DFBE7DF3EFBFK0FFC,00FFEK0SFJ01FFC,:007FFK0FDJFDFFEFBFJ03FF8,007FFK07CF3E79F3E79EJ03FF8,003FF8J01060C3061870C1I07FF,003FFCJ038F3E78F3CF9F7C00IF,001FFCJ07DFBFFDLF7E00FFE,001FFEJ0TFE01FFE,I0IFJ0SF7E03FFC,I0IFJ07DFBEFDF3EF9F7C03FFC,I07FF8I07CF1C78E1C70C1807FF8,I03FFCY0IF8,I03FFEX01IF,I01IFX03FFE,J0IF8W07FFE,J0IFCW0IFC,J07FFEV01IF8,J03IFV03IF,J01IF8U07FFE,J01IFCU0IFC,K0JFT03IFC,K07IF8S07IF8,K03IFER01JF,K01JFR03IFE,L0JFCQ0JF8,L03JFP03JF,L01JFEN01JFE,M0KF8M07JFC,M07KF8K07KF8,M01LFE001LFE,N0VFC,N03UF,O0TFC,O03SF,P0RFE,P03QF,Q07OF8,Q01NFC,R01LFE,T07IF8,,^FS";

// ==================== TYPES ====================
interface EstadoOrdensSapI {
  estado: "boposReleased" | "boposClosed" | "boposCancelled" | "boposPlanned";
}

interface ReatorOrdemProducao {
  idReatorAtual: number;
  numeroOrdemProducao: number;
}

interface EstadoOrdemProducao {
  estadoSAPAtual: string;
  numeroOrdemProducao: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// ==================== CUSTOM HOOKS ====================
const useProductionOrderState = () => {
  const [estadoOP, setEstadoOP] = useState<EstadoOrdemProducao>({
    estadoSAPAtual: "",
    numeroOrdemProducao: 0,
  });
  const [mudancaEstado, setMudancaEstado] = useState(false);
  const [enviarMudancaSAP, setEnviarMudancaSAP] = useState(false);

  const resetState = useCallback(() => {
    setEstadoOP({ estadoSAPAtual: "", numeroOrdemProducao: 0 });
    setMudancaEstado(false);
    setEnviarMudancaSAP(false);
  }, []);

  return {
    estadoOP, setEstadoOP, mudancaEstado, setMudancaEstado,
    enviarMudancaSAP, setEnviarMudancaSAP, resetState,
  };
};

const useReactorState = () => {
  const [reatorOP, setReator] = useState<ReatorOrdemProducao>({
    idReatorAtual: 0,
    numeroOrdemProducao: 0,
  });
  const [mudancaReator, setMudancaReator] = useState(false);

  const resetState = useCallback(() => {
    setReator({ idReatorAtual: 0, numeroOrdemProducao: 0 });
    setMudancaReator(false);
  }, []);

  return { reatorOP, setReator, mudancaReator, setMudancaReator, resetState };
};

// ==================== UTILITY FUNCTIONS ====================
const transformarParaEstruturaSAP = (ordemProducao: any, ConsumosSCADA: any, horario: Date) => {
  if (!ConsumosSCADA || !Array.isArray(ConsumosSCADA) || ConsumosSCADA.length === 0) {
    throw new Error("Dados de consumo inválidos ou vazios");
  }

  const documentLinesByMateriaPrima = ConsumosSCADA.reduce((acc: any, consumo: any) => {
    const { materiaPrima, lote, quantidade } = consumo;
    
    if (!materiaPrima || quantidade === undefined) {
      console.warn("Consumo com dados incompletos:", consumo);
      return acc;
    }

    const baseLine = ordemProducao.ProductionOrderLines?.find(
      (line: any) => line.ItemNo === materiaPrima
    )?.LineNumber;

    if (acc[materiaPrima]) {
      acc[materiaPrima].BatchNumbers.push({
        BatchNumber: lote || "N/A",
        Quantity: quantidade,
        ItemCode: materiaPrima,
      });
      acc[materiaPrima].Quantity += quantidade;
    } else {
      acc[materiaPrima] = {
        BaseEntry: ordemProducao.AbsoluteEntry,
        BaseLine: baseLine,
        BaseType: 202,
        Quantity: quantidade,
        BatchNumbers: [
          {
            BatchNumber: lote || "N/A",
            Quantity: quantidade,
            ItemCode: materiaPrima,
          },
        ],
      };
    }
    return acc;
  }, {});

  return {
    DocDate: format(horario, "yyyyMMdd", { locale: pt }),
    DocumentLines: Object.values(documentLinesByMateriaPrima),
  };
};

const generateZPLLabel = (ordemProducao: ProductionOrder, horario: Date) => {
  return `^XA${EGIQUIMICA_LOGO_ZPL}^FS^CF0,60^FO220,50^FDEgiquimica^FS^CF0,30^FO220,115^FDParque Industrial Guarda,Lt.10/15^FS^FO220,155^FDGuarda^FS^FO220,195^FDPortugal(PT)^FS^FO50,245^GB700,3,3^FS^CFD,50^FO50,265^FDOrdem Produc:^FS^CFA,45^FO50,315^FD${ordemProducao.AbsoluteEntry}^FS^CFD,50^FO50,400^FDLote:^FS^CFA,45^FO50,450^FD${ordemProducao.ItemNo}^FS^CFD,50^FO50,550^FDDescricao:^FS^CFA,45^FO50,600^FD${ordemProducao.ProductDescription}^FS^CFA,50^FO50,700^FD${horario.toISOString()}^FS^FO515,255^BQ,,6^FD123F:PI&C1:${ordemProducao.ItemNo}&C2:${ordemProducao.ProductDescription}&C3:${ordemProducao.U_LoteFabrico}&C4:${horario.toISOString()}&C5:${ordemProducao.AbsoluteEntry}&C6:&^FS^FO50,775^GB700,100,3^FS^FO50,875^GB700,300,3^FS^CF0,250^FO60,920^FD${ordemProducao.ItemNo}^FS^CF0,50^FO250,800^FDPrd Intermedio^FS^XZ`;
};

const imprimirEtiqueta = async (informacaoEtiqueta: string): Promise<{ success: boolean; message: string }> => {
  try {
    const browserPrint = new ZebraBrowserPrintWrapper();
    const foundPrinter = await browserPrint.getAvailablePrinters();
    
    if (foundPrinter.length === 0) {
      throw new Error("Nenhuma impressora encontrada");
    }

    browserPrint.setPrinter(foundPrinter[0]);
    const printerStatus = await browserPrint.checkPrinterStatus();

    if (printerStatus.isReadyToPrint) {
      browserPrint.print(informacaoEtiqueta);
      return { success: true, message: "Etiqueta impressa com sucesso" };
    } else if (printerStatus.errors) {
      throw new Error(`Erro na impressora: ${JSON.stringify(printerStatus.errors)}`);
    } else {
      // ADD THIS: Handle the case when printer is not ready but has no errors
      throw new Error("Impressora não está pronta para imprimir");
    }
  } catch (error) {
    console.error("Error printing label:", error);
    throw error;
  }
};

// ==================== MAIN COMPONENT ====================
export default function DataTable<TData extends ProductionOrder, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // ========== STATE ==========
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [numOP, setNumOP] = useState("");
  const [criouOrdemSCADA, setCriouOrdemSCADA] = useState<number[]>([]);
  const [consumptionConfirmed, setConsumptionConfirmed] = useState<number[]>([])
  
  
  // NEW: Error and status state
  const [systemStatus, setSystemStatus] = useState<{
    validation: 'idle' | 'loading' | 'success' | 'error';
    consumption: 'idle' | 'loading' | 'success' | 'error';
    printing: 'idle' | 'loading' | 'success' | 'error';
    errorMessage: string;
    successMessage: string;
  }>({
    validation: 'idle',
    consumption: 'idle',
    printing: 'idle',
    errorMessage: '',
    successMessage: ''
  });

  // ========== CUSTOM HOOKS ==========
  const {
    estadoOP, setEstadoOP, mudancaEstado, setMudancaEstado,
    enviarMudancaSAP, setEnviarMudancaSAP, resetState: resetOrderState,
  } = useProductionOrderState();

  const {
    reatorOP, setReator, mudancaReator, setMudancaReator, resetState: resetReactorState,
  } = useReactorState();

  // ========== TABLE CONFIGURATION ==========
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableMultiRowSelection: false,
    initialState: { pagination: { pageSize: 20 } },
    state: { columnFilters, sorting, rowSelection },
  });

  // ========== MEMOIZED VALUES ==========
  const horario = useMemo(() => new Date(), []);
  const selectedOrder = useMemo(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    return selectedRows.length > 0 ? selectedRows[0].original : null;
  }, [table, rowSelection]);

  // ========== API HOOKS ==========
  const criarOrdemProducaoSCADAMutation = useCriarOrdemProducaoSCADA();
  const enviarConsumoSAPMutation = useConsumoSAP();
  const atualizarReatorOrdemSCADAMutation = useAtualizarReatorOrdemSCADA();
  const atualizarEstadoOrdemMutation = useAtualizarEstadoOrdemSAP();
  
  const fetchOrdemProdSCADA = useFetchOrdemProdSCADA(
    numOP,
    !!selectedOrder && !!numOP
  );
  
  const fetchConsumosSCADA = useFetchConsumosSCADA(numOP);

  // ========== UTILITY FUNCTIONS ==========
  const clearMessages = useCallback(() => {
    setSystemStatus(prev => ({ ...prev, errorMessage: '', successMessage: '' }));
  }, []);

  const setError = useCallback((operation: keyof typeof systemStatus, message: string) => {
    setSystemStatus(prev => ({
      ...prev,
      [operation]: 'error',
      errorMessage: message,
      successMessage: ''
    }));
  }, []);

  const setSuccess = useCallback((operation: keyof typeof systemStatus, message: string) => {
    setSystemStatus(prev => ({
      ...prev,
      [operation]: 'success',
      errorMessage: '',
      successMessage: message
    }));
  }, []);

  const setLoading = useCallback((operation: keyof typeof systemStatus) => {
    setSystemStatus(prev => ({
      ...prev,
      [operation]: 'loading',
      errorMessage: '',
      successMessage: ''
    }));
  }, []);

  const isConsumptionConfirmed = selectedOrder ? consumptionConfirmed.includes(selectedOrder.AbsoluteEntry) : false;

  // ========== EVENT HANDLERS ==========
  const handleStateChange = useCallback((newState: string, ordemProducao: ProductionOrder) => {
    const estadoSap = ORDER_STATES.find(estado => estado.estado === newState)?.statusSAP;
    if (!estadoSap) return;

    const atualizarEstadoOP = produce(estadoOP, (draft) => {
      draft.estadoSAPAtual = estadoSap;
      draft.numeroOrdemProducao = ordemProducao.AbsoluteEntry;
    });

    setEstadoOP(atualizarEstadoOP);
    const hasChanged = estadoSap !== ordemProducao.ProductionOrderStatus;
    setMudancaEstado(hasChanged);
    setEnviarMudancaSAP(hasChanged);
  }, [estadoOP, setEstadoOP, setMudancaEstado, setEnviarMudancaSAP]);

  const handleReactorChange = useCallback((reactorName: string, ordemProducao: ProductionOrder) => {
    const reactor = REACTORS.find(r => r.nome === reactorName);
    if (!reactor) return;

    const atualizarReator = produce(reatorOP, (draft) => {
      draft.idReatorAtual = reactor.id;
      draft.numeroOrdemProducao = ordemProducao.AbsoluteEntry;
    });

    setReator(atualizarReator);
    setMudancaReator(true);
  }, [reatorOP, setReator, setMudancaReator]);

  const handleConfirmValidation = useCallback(async (ordemProducao: ProductionOrder) => {
    try {
      setLoading('validation');
      clearMessages();

      if (enviarMudancaSAP) {
        await atualizarEstadoOrdemMutation.mutateAsync({
          estado: estadoOP.estadoSAPAtual as EstadoOrdensSapI["estado"],
          numeroOP: ordemProducao.AbsoluteEntry,
        });
      }

      const isOrderCreated = criouOrdemSCADA.includes(ordemProducao.AbsoluteEntry);

      if (!isOrderCreated) {
        const TPI = TPIS.find(tpi => tpi.Receita === ordemProducao.ItemNo)?.TPI;

        await criarOrdemProducaoSCADAMutation.mutateAsync([{
          numeroOrdemProducao: ordemProducao.AbsoluteEntry,
          receita: ordemProducao.ItemNo,
          quantidade: ordemProducao.PlannedQuantity,
          reator: reatorOP.idReatorAtual,
          estado: ORDER_STATES.find(estado => estado.statusSAP === ordemProducao.ProductionOrderStatus)?.id,
          dataCriacao: ordemProducao.CreationDate,
          estadoReator: 1,
          tpa: TPI ?? 0,
        }]);

        setCriouOrdemSCADA(prev => [...prev, ordemProducao.AbsoluteEntry]);
        setSuccess('validation', 'Ordem criada no SCADA com sucesso');
      } else {
        await atualizarReatorOrdemSCADAMutation.mutateAsync({
          numeroOP: ordemProducao.AbsoluteEntry,
          Reator: reatorOP.idReatorAtual,
        });
        setSuccess('validation', 'Reator atualizado com sucesso');
      }

      table.resetRowSelection();
    } catch (error: any) {
      console.error('Validation error:', error);
      if (error.message?.includes('timeout')) {
        setError('validation', 'Timeout: Sistema SCADA não está respondendo. Tente novamente.');
      } else {
        setError('validation', `Erro na validação: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }, [
    enviarMudancaSAP, estadoOP, criouOrdemSCADA, reatorOP,
    atualizarEstadoOrdemMutation, criarOrdemProducaoSCADAMutation,
    atualizarReatorOrdemSCADAMutation, table, setLoading, clearMessages, setSuccess, setError
  ]);

const handleConfirmConsumption = useCallback(async (ordemProducao: ProductionOrder) => {
  try {
    setLoading('consumption');
    clearMessages();

    if (!fetchConsumosSCADA.data || fetchConsumosSCADA.data.length === 0) {
      throw new Error('Nenhum dado de consumo disponível');
    }

    const sapPayload = transformarParaEstruturaSAP(
      ordemProducao,
      fetchConsumosSCADA.data,
      horario
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    await enviarConsumoSAPMutation.mutateAsync(JSON.stringify(sapPayload));
    
    // ADD THIS LINE: Mark consumption as confirmed for this order
    setConsumptionConfirmed(prev => [...prev, ordemProducao.AbsoluteEntry]);
    
    setSuccess('consumption', 'Consumo enviado para SAP com sucesso');
  } catch (error: any) {
    console.error('Consumption error:', error);
    if (error.message?.includes('timeout')) {
      setError('consumption', 'Timeout: Sistema SAP não está respondendo. Tente novamente.');
    } else {
      setError('consumption', `Erro no consumo: ${error.message || 'Erro desconhecido'}`);
    }
  }
}, [fetchConsumosSCADA.data, horario, enviarConsumoSAPMutation, setLoading, clearMessages, setSuccess, setError]);

  const handleValidateClick = useCallback(async () => {
    if (numOP && selectedOrder) {
      try {
        setLoading('validation');
        clearMessages();
        await fetchOrdemProdSCADA.refetch();
        setSuccess('validation', 'Validação concluída com sucesso');
      } catch (error: any) {
        if (error.message?.includes('timeout')) {
          setError('validation', 'Timeout: Sistema SCADA não está respondendo. Tente novamente.');
        } else {
          setError('validation', `Erro na validação: ${error.message || 'Erro desconhecido'}`);
        }
      }
    }
  }, [numOP, selectedOrder, fetchOrdemProdSCADA, setLoading, clearMessages, setSuccess, setError]);

  const handlePrintLabel = useCallback(async () => {
    if (!selectedOrder) return;
    
    try {
      setLoading('printing');
      clearMessages();
      
      const result = await imprimirEtiqueta(generateZPLLabel(selectedOrder, horario));
      setSuccess('printing', result.message);
    } catch (error: any) {
      setError('printing', `Erro na impressão: ${error.message || 'Erro desconhecido'}`);
    }
  }, [selectedOrder, horario, setLoading, clearMessages, setSuccess, setError]);

  // ========== EFFECTS ==========
  useEffect(() => {
    resetOrderState();
    resetReactorState();
    clearMessages();
  }, [rowSelection, resetOrderState, resetReactorState, clearMessages]);

  useEffect(() => {
    if (selectedOrder && numOP !== selectedOrder.AbsoluteEntry.toString()) {
      setNumOP(selectedOrder.AbsoluteEntry.toString());
    }
  }, [selectedOrder, numOP]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (systemStatus.errorMessage || systemStatus.successMessage) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [systemStatus.errorMessage, systemStatus.successMessage, clearMessages]);

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {systemStatus.errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{systemStatus.errorMessage}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearMessages}
              className="h-auto p-1"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {systemStatus.successMessage && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex justify-between items-center">
            <span>{systemStatus.successMessage}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearMessages}
              className="h-auto p-1 text-green-800 hover:text-green-900"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header Controls */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center py-4 gap-x-2">
          <Input
            type="number"
            placeholder="Filtrar Ordem ... "
            value={(table.getColumn("numeroOP")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("numeroOP")?.setFilterValue(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex mr-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="producao/historico">
                  <Button>
                    <ScrollText />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Verificar Historico de Producao</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Main Table */}
      <div className="rounded-md border-2 border-lime-500 max-h-[400px] overflow-y-scroll">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Não Existem Ordens
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Table Info */}
      <div className="flex items-center px-2 py-3">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} ordem(s) selecionada.
        </div>
      </div>

      {/* Selected Order Details */}
      {selectedOrder && (
        <div className="space-y-6">
          <div className="flex flex-row mt-10 justify-between">
            <div className="flex flex-col mx-2">
              <OrderDetailsForm 
                ordemProducao={selectedOrder}
                onStateChange={handleStateChange}
                onReactorChange={handleReactorChange}
              />
            </div>
            
            <div className="flex flex-col justify-items-center gap-4 mx-auto h-[410px] w-[700px]">
              <OrderMaterialsTable ordemProducao={selectedOrder} />
            </div>
          </div>
          
          {/* Action Buttons with Loading States */}
          <div className="flex justify-center space-x-4">
<OrderActionButtons
  ordemProducao={selectedOrder}
  onValidate={handleValidateClick}
  onConsumption={() => fetchConsumosSCADA.refetch()}
  onPrintLabel={handlePrintLabel}
  isValidating={systemStatus.validation === 'loading'}
  isLoadingConsumption={systemStatus.consumption === 'loading'}
  isPrinting={systemStatus.printing === 'loading'}
  isPrintDisabled={!isConsumptionConfirmed} // ADD THIS LINE
  validationDialog={
    <ValidationDialog
      ordemProducao={selectedOrder}
      mudancaEstado={mudancaEstado}
      mudancaReator={mudancaReator}
      estadoOP={estadoOP}
      reatorOP={reatorOP}
      fetchOrdemProdSCADA={fetchOrdemProdSCADA}
      onConfirm={() => handleConfirmValidation(selectedOrder)}
      isLoading={systemStatus.validation === 'loading'}
    />
  }
  consumptionDialog={
    <ConsumptionDialog
      ordemProducao={selectedOrder}
      fetchConsumosSCADA={fetchConsumosSCADA}
      onConfirm={() => handleConfirmConsumption(selectedOrder)}
    />
  }
/>
            
          </div>

          {/* SCADA Connection Status */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                fetchOrdemProdSCADA.isError ? 'bg-red-500' : 
                fetchOrdemProdSCADA.isFetching ? 'bg-yellow-500' : 
                'bg-green-500'
              }`} />
              <span className="text-gray-600">
                SCADA: {
                  fetchOrdemProdSCADA.isError ? 'Desconectado' :
                  fetchOrdemProdSCADA.isFetching ? 'Conectando...' :
                  'Conectado'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}