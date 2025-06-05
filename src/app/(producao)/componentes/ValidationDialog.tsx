// componentes/ValidationDialog.tsx
import React from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";

interface ValidationDialogProps {
  ordemProducao: ProductionOrder;
  mudancaEstado: boolean;
  mudancaReator: boolean;
  estadoOP: any;
  reatorOP: any;
  fetchOrdemProdSCADA: any;
  onConfirm: () => void;
  isLoading?: boolean; // NEW: Loading state prop
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  ordemProducao,
  mudancaEstado,
  mudancaReator,
  estadoOP,
  reatorOP,
  fetchOrdemProdSCADA,
  onConfirm,
  isLoading = false,
}) => {
  const renderValidationContent = () => {
    // Loading state
    if (fetchOrdemProdSCADA.isFetching || fetchOrdemProdSCADA.isRefetching) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">
            Validando ordem no sistema SCADA...
          </p>
        </div>
      );
    }

    // Error state
    if (fetchOrdemProdSCADA.isError) {
      const error = fetchOrdemProdSCADA.error;
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Erro na validação:</p>
              <p className="text-sm">
                {error?.message?.includes('timeout') 
                  ? 'Timeout: Sistema SCADA não está respondendo. Tente novamente.'
                  : error?.message || 'Erro desconhecido ao validar ordem.'
                }
              </p>
              <button
                onClick={() => fetchOrdemProdSCADA.refetch()}
                className="text-sm underline hover:no-underline"
                disabled={fetchOrdemProdSCADA.isFetching}
              >
                {fetchOrdemProdSCADA.isFetching ? 'Tentando...' : 'Tentar novamente'}
              </button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    // Success state
    if (fetchOrdemProdSCADA.data && fetchOrdemProdSCADA.data.length > 0) {
      return (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Ordem encontrada no sistema SCADA com sucesso!
            </AlertDescription>
          </Alert>
          
          {/* Show changes */}
          <div className="space-y-2">
            {mudancaEstado && (
              <p className="text-sm">
                <strong>Estado:</strong> Será alterado para {estadoOP.estadoSAPAtual}
              </p>
            )}
            {mudancaReator && (
              <p className="text-sm">
                <strong>Reator:</strong> Será alterado para Reator {reatorOP.idReatorAtual}
              </p>
            )}
            {!mudancaEstado && !mudancaReator && (
              <p className="text-sm text-gray-600">
                Nenhuma alteração detectada.
              </p>
            )}
          </div>
        </div>
      );
    }

    // No data state
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600">
          {`Clique em "Validar" para verificar a ordem no sistema SCADA.`}
        </p>
      </div>
    );
  };

  return (
    <AlertDialogContent className="max-w-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle>
          Validação da Ordem #{ordemProducao.AbsoluteEntry}
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="text-left">
            {renderValidationContent()}
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction 
          onClick={onConfirm}
          disabled={isLoading || fetchOrdemProdSCADA.isError || !fetchOrdemProdSCADA.data}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Confirmar"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};