import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";
import { Loader2, AlertTriangle, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UseQueryResult } from "@tanstack/react-query";

// Match your exact interface structure
interface ConsumosSCADA {
  IdConsumos: number;
  numOP: number;
  origemMP: number;
  materiaPrima: string;
  lote: string;
  quantidade: number;
  date: string;
}

interface ConsumptionDialogProps {
  ordemProducao: ProductionOrder;
  fetchConsumosSCADA: UseQueryResult<ConsumosSCADA[], Error>;
  onConfirm: () => void;
}

export const ConsumptionDialog: React.FC<ConsumptionDialogProps> = ({
  ordemProducao,
  fetchConsumosSCADA,
  onConfirm,
}) => {
  const { data, isFetching, isRefetching, isError, error } = fetchConsumosSCADA;
  const isLoading = isFetching || isRefetching;
  const hasData = data && data.length > 0;

  // Calculate total consumption
  const totalConsumption = hasData 
    ? data.reduce((sum, consumo) => sum + consumo.quantidade, 0)
    : 0;

  const handleConfirm = () => {
    if (hasData) {
      onConfirm();
    }
  };

  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">
            {isFetching ? "A carregar consumos..." : "A atualizar dados..."}
          </p>
        </div>
      );
    }

    // Error state
    if (isError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Erro ao carregar consumos:</p>
              <p className="text-sm">
                {error?.message?.includes('timeout') 
                  ? 'Timeout: Sistema SCADA não está respondendo. Tente novamente.'
                  : error?.message || 'Erro desconhecido ao buscar dados de consumo.'
                }
              </p>
              <button
                onClick={() => fetchConsumosSCADA.refetch()}
                className="text-sm underline hover:no-underline"
                disabled={fetchConsumosSCADA.isFetching}
              >
                {fetchConsumosSCADA.isFetching ? 'Tentando...' : 'Tentar novamente'}
              </button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    // No data state
    if (!hasData) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Package className="h-12 w-12 text-gray-300" />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-900">
              Nenhum consumo encontrado
            </p>
            <p className="text-xs text-gray-500">
              Não existem registros de consumo de matéria-prima para esta ordem.
            </p>
            <button
              onClick={() => fetchConsumosSCADA.refetch()}
              className="text-sm text-blue-600 hover:text-blue-500 underline"
            >
              Recarregar dados
            </button>
          </div>
        </div>
      );
    }

    // Data display
    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Total de consumos:</span>
            <span className="font-semibold">{data.length} item(s)</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="font-medium">Quantidade total:</span>
            <span className="font-semibold">{totalConsumption.toFixed(2)} kg</span>
          </div>
        </div>

        {/* Consumption list */}
        <div className="max-h-[350px] overflow-y-auto">
          <ul role="list" className="divide-y divide-gray-200">
            {data.map((consumo, indexConsumo) => (
              <li
                key={`${consumo.IdConsumos}-${indexConsumo}`}
                className="flex justify-between gap-x-6 py-4 hover:bg-gray-50 rounded-lg px-2"
              >
                <div className="flex min-w-0 gap-x-4">
                  <div className="h-12 w-12 flex-none rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                      {consumo.materiaPrima}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Lote: {consumo.lote}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Origem: {consumo.origemMP}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end">
                  <p className="text-sm font-medium leading-6 text-gray-900">
                    {consumo.quantidade.toFixed(2)} kg
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {new Date(consumo.date).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <AlertDialogContent className="w-[900px] max-h-[700px]">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Consumos de MP - Ordem #{ordemProducao.AbsoluteEntry}
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="text-left">
            <p className="text-sm text-gray-600 mb-4">
              Visualize os consumos de matéria-prima registrados no sistema SCADA para esta ordem de produção.
            </p>
            {renderContent()}
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction 
          onClick={handleConfirm}
          disabled={!hasData || isLoading}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A carregar...
            </>
          ) : hasData ? (
            "Confirmar Consumo"
          ) : (
            "Sem dados para confirmar"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};