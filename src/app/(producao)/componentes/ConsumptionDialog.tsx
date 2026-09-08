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
import {
  Loader2,
  AlertTriangle,
  Package,
  Plus,
  CheckCircle,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UseQueryResult } from "@tanstack/react-query";
import { useAdicionarLinhaOrdemProducao } from "@/Services/Consumos/updateOrdemProducao";
import { useAtualizarLoteConsumo } from "@/Services/Consumos/updateLoteConsumos"; 
import { useState, useMemo } from "react";

// Match your exact interface structure
interface ConsumosSCADA {
  idConsumos: number;
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
  addedItemsWithLines: Map<string, number>;
  setAddedItemsWithLines: (map: Map<string, number>) => void;
}

export const ConsumptionDialog: React.FC<ConsumptionDialogProps> = ({
  ordemProducao,
  fetchConsumosSCADA,
  onConfirm,
  addedItemsWithLines,
  setAddedItemsWithLines,
}) => {
  const { data, isFetching, isRefetching, isError, error } = fetchConsumosSCADA;
  const addLineMutation = useAdicionarLinhaOrdemProducao();
  const updateLoteMutation = useAtualizarLoteConsumo();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  
  // CHANGED: Single lote editing state
  const [editedLotes, setEditedLotes] = useState<Map<number, string>>(new Map());
  const [editingLote, setEditingLote] = useState<number | null>(null);

  const isLoading = isFetching || isRefetching;
  const hasData = data && data.length > 0;

  // Calculate total consumption - handle undefined quantities
  const totalConsumption = hasData
    ? data.reduce((sum, consumo) => sum + (consumo.quantidade || 0), 0)
    : 0;

  // Identify missing items
  const missingItems = useMemo(() => {
    if (!hasData) return [];

    const existingItemNos = new Set(
      ordemProducao.ProductionOrderLines.map((line) => line.ItemNo)
    );

    const consumedItems = new Set(data.map((consumo) => consumo.materiaPrima));

    return Array.from(consumedItems).filter(
      (itemNo) =>
        !existingItemNos.has(itemNo) &&
        !addedItems.has(itemNo) &&
        itemNo !== "MP0000"
    );
  }, [data, ordemProducao.ProductionOrderLines, addedItems]);

  // CHANGED: Single lote editing handlers
  const handleLoteChange = (idConsumos: number, newValue: string) => {
    setEditedLotes(prev => new Map(prev).set(idConsumos, newValue));
  };

  const handleStartLoteEdit = (idConsumos: number, currentLote: string) => {
  if (idConsumos === undefined || idConsumos === null) {
    console.error('❌ Cannot edit: idConsumos is invalid:', idConsumos);
    return;
  }
  
  
  setEditingLote(idConsumos);
  if (!editedLotes.has(idConsumos)) {
    setEditedLotes(prev => new Map(prev).set(idConsumos, currentLote));
  }
  };

  const handleSaveLote = async (idConsumos: number) => {
    //console.log('🔍 Debug - idConsumos received:', idConsumos);
    //console.log('🔍 Debug - consumo data:', data?.find(c => c.idConsumos === idConsumos));
    
    const newLote = editedLotes.get(idConsumos);
    const originalLote = data?.find(c => c.idConsumos === idConsumos)?.lote;
    
    if (newLote && newLote.trim() && newLote !== originalLote) {
      //console.log('🚀 Sending to API:', { idConsumos, novoLote: newLote.trim() });
      try {
        await updateLoteMutation.mutateAsync({ 
          idConsumos, 
          novoLote: newLote.trim() 
        });
        // Success handled by mutation's onSuccess
      } catch (error) {
        // Error handled by mutation's onError
        // Revert the UI change
        if (originalLote) {
          setEditedLotes(prev => new Map(prev).set(idConsumos, originalLote));
        } else {
          setEditedLotes(prev => {
            const newMap = new Map(prev);
            newMap.delete(idConsumos);
            return newMap;
          });
        }
      }
    } else if (newLote !== originalLote) {
      // Revert if empty or unchanged
      if (originalLote) {
        setEditedLotes(prev => new Map(prev).set(idConsumos, originalLote));
      } else {
        setEditedLotes(prev => {
          const newMap = new Map(prev);
          newMap.delete(idConsumos);
          return newMap;
        });
      }
    }
    
    // CHANGED: Exit single edit mode
    setEditingLote(null);
  };

  const handleCancelLoteEdit = (idConsumos: number, originalLote: string) => {
    setEditingLote(null);
    setEditedLotes(prev => new Map(prev).set(idConsumos, originalLote));
  };

  
  const renderLoteField = (consumo: ConsumosSCADA) => {
    //console.log('editing lote field', consumo);
	
	if (!consumo || consumo.idConsumos === undefined || consumo.idConsumos === null) {
    //console.error('❌ Invalid consumo data:', consumo);
    return <div className="text-red-500 text-xs">Erro: dados inválidos</div>;
  }
  
  //console.log('editing lote field', consumo);
  
  
    
	const isEditing = editingLote === consumo.idConsumos && editingLote !== null;
    const currentLote = editedLotes.get(consumo.idConsumos) ?? consumo.lote;
    const isModified = editedLotes.has(consumo.idConsumos) && 
                      editedLotes.get(consumo.idConsumos) !== consumo.lote;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gray-500">Lote:</span>
          <input
            value={currentLote}
            onChange={(e) => handleLoteChange(consumo.idConsumos, e.target.value)}
            className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveLote(consumo.idConsumos);
              } else if (e.key === 'Escape') {
                handleCancelLoteEdit(consumo.idConsumos, consumo.lote);
              }
            }}
            autoFocus
            disabled={updateLoteMutation.isPending}
          />
          <button
            onClick={() => handleSaveLote(consumo.idConsumos)}
            className="text-green-600 hover:text-green-700 disabled:opacity-50"
            disabled={updateLoteMutation.isPending}
            title="Guardar (Enter)"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleCancelLoteEdit(consumo.idConsumos, consumo.lote)}
            className="text-red-600 hover:text-red-700 disabled:opacity-50"
            disabled={updateLoteMutation.isPending}
            title="Cancelar (Esc)"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 mt-1 group">
        <span className="text-xs text-gray-500">
          Lote: <span className={isModified ? "text-blue-600 font-medium" : ""}>{currentLote}</span>
        </span>
        <button
          onClick={() => handleStartLoteEdit(consumo.idConsumos, currentLote)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
          title="Editar lote"
          disabled={updateLoteMutation.isPending || editingLote !== null}
        >
          <Edit3 className="h-3 w-3" />
        </button>
        {isModified && (
          <span className="text-blue-600 text-xs" title="Lote modificado">●</span>
        )}
        {updateLoteMutation.isPending && 
         updateLoteMutation.variables?.idConsumos === consumo.idConsumos && (
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
        )}
      </div>
    );
  };

  const handleAddMissingItems = async () => {
    const newAddedItems = new Map(addedItemsWithLines);
    let nextLineNumber =
      Math.max(
        ...ordemProducao.ProductionOrderLines.map((line) => line.LineNumber),
        -1
      ) + 1;

    for (const itemNo of missingItems) {
      try {
        await addLineMutation.mutateAsync({
          numeroOP: ordemProducao.AbsoluteEntry,
          itemNo: itemNo,
          baseQuantity: 1.0,
          issueType: "im_Manual",
        });

        // Track the added item with its line number
        newAddedItems.set(itemNo, nextLineNumber);
        nextLineNumber++;

        setAddedItems((prev) => new Set(prev).add(itemNo));
      } catch (error) {
        console.error(`Failed to add item ${itemNo}:`, error);
        // Continue with other items even if one fails
      }
    }

    setAddedItemsWithLines(newAddedItems);
  };

  const handleConfirm = async () => {
    if (hasData) {
      // If there are missing items, add them first
      if (missingItems.length > 0) {
        await handleAddMissingItems();
      }
      onConfirm();
    }
  };

  const renderMissingItemsAlert = () => {
    if (missingItems.length === 0) return null;

    return (
      <Alert className="my-4 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium text-orange-800">
              Itens não encontrados na ordem de produção:
            </p>
            <div className="flex flex-wrap gap-1">
              {missingItems.map((itemNo) => (
                <span
                  key={itemNo}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs font-medium"
                >
                  {itemNo}
                </span>
              ))}
            </div>
            <p className="text-sm text-orange-700">
              Estes itens serão automaticamente adicionados à ordem quando
              confirmar.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
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
                {error?.message?.includes("timeout")
                  ? "Timeout: Sistema SCADA não está respondendo. Tente novamente."
                  : error?.message ||
                    "Erro desconhecido ao buscar dados de consumo."}
              </p>
              <button
                onClick={() => fetchConsumosSCADA.refetch()}
                className="text-sm underline hover:no-underline"
                disabled={fetchConsumosSCADA.isFetching}
              >
                {fetchConsumosSCADA.isFetching
                  ? "Tentando..."
                  : "Tentar novamente"}
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

    // Count modified lotes
    const modifiedLotesCount = Array.from(editedLotes.entries()).filter(
      ([idConsumos, editedLote]) => {
        const originalLote = data?.find(c => c.idConsumos === idConsumos)?.lote;
        return editedLote !== originalLote;
      }
    ).length;

    // Data display
    return (
      <div className="space-y-4">
        {/* Missing items alert */}
        {renderMissingItemsAlert()}

        {/* Summary */}
        {data && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Total de consumos:</span>
              <span className="font-semibold">{data.length} item(s)</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="font-medium">Quantidade total:</span>
              <span className="font-semibold">
                {totalConsumption.toFixed(2)} kg
              </span>
            </div>
            {missingItems.length > 0 && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="font-medium text-orange-600">
                  Itens em falta:
                </span>
                <span className="font-semibold text-orange-600">
                  {missingItems.length} item(s)
                </span>
              </div>
            )}
            {modifiedLotesCount > 0 && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="font-medium text-blue-600">
                  Lotes modificados:
                </span>
                <span className="font-semibold text-blue-600">
                  {modifiedLotesCount} item(s)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Consumption list */}
        <div className="max-h-[300px] overflow-y-scroll">
          <ul role="list" className="divide-y divide-gray-200">
            {data.map((consumo, indexConsumo) => {
              const itemExists = ordemProducao.ProductionOrderLines.some(
                (line) => line.ItemNo === consumo.materiaPrima
              );
              const itemWasAdded = addedItems.has(consumo.materiaPrima);

              return (
                <li
                  key={`${consumo.idConsumos}-${indexConsumo}`}
                  className="flex justify-between gap-x-6 py-4 hover:bg-gray-50 rounded-lg px-2"
                >
                  <div className="flex min-w-0 gap-x-4">
                    <div className="h-12 w-12 flex-none rounded-full bg-blue-100 flex items-center justify-center relative">
                      {itemExists ? (
                        <Package className="h-6 w-6 text-blue-600" />
                      ) : itemWasAdded ? (
                        <>
                          <Package className="h-6 w-6 text-green-600" />
                          <CheckCircle className="h-3 w-3 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                        </>
                      ) : (
                        <>
                          <Package className="h-6 w-6 text-red-600" />
                          <Plus className="h-3 w-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full" />
                        </>
                      )}
                    </div>
                    <div className="min-w-0 flex-auto">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                          {consumo.materiaPrima}
                        </p>
                        {!itemExists && !itemWasAdded && (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Não existe
                          </span>
                        )}
                        {itemWasAdded && (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
                            Adicionado
                          </span>
                        )}
                      </div>
                      {renderLoteField(consumo)}
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Origem: {consumo.origemMP}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                    <p className="text-sm font-medium leading-6 text-gray-900">
                      {(consumo.quantidade ?? 0).toFixed(2)} kg
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {new Date(consumo.date).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  const isProcessing = isLoading || addLineMutation.isPending || updateLoteMutation.isPending;
  const hasActiveEdit = editingLote !== null;

  return (
    <AlertDialogContent className="w-[900px] max-h-[700px]">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Consumos de MP - Ordem #{ordemProducao.DocumentNumber}
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="text-left">
            <p className="text-sm text-gray-600 mb-4">
              Visualize os consumos de matéria-prima registrados no sistema
              SCADA para esta ordem de produção. Clique no ícone de edição para alterar lotes.
            </p>
            {renderContent()}
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isProcessing || hasActiveEdit}>
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          disabled={!hasData || isProcessing || hasActiveEdit}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {addLineMutation.isPending
                ? "A adicionar linhas..."
                : updateLoteMutation.isPending
                ? "A atualizar lote..."
                : "A carregar..."}
            </>
          ) : hasData ? (
            <>
              Confirmar Consumo
              {missingItems.length > 0 && (
                <span className="ml-1 text-xs opacity-75">
                  (+{missingItems.length} item
                  {missingItems.length !== 1 ? "s" : ""})
                </span>
              )}
            </>
          ) : (
            "Sem dados para confirmar"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};