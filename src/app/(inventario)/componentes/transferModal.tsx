import React, { useState, useEffect } from "react";
import { ItemDetails } from "./columns";
import { toast } from "sonner";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDetails | null;
  onTransfer: (transferData: any) => Promise<void>;
  isLoading?: boolean;
}

interface BatchQuantity {
  batchNumber: string;
  quantity: number;
  maxQuantity: number;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  item,
  onTransfer,
  isLoading = false,
}) => {
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [batchQuantities, setBatchQuantities] = useState<BatchQuantity[]>([]);

  // Common warehouse options (you can modify this based on your needs)
  const warehouseOptions = [
    { code: "A1", name: "Matéria Prima" },
    { code: "A2", name: "Produto Intermédio" },
    { code: "A3", name: "Produto Acabado" },
    { code: "A4", name: "Expedição" },
  ];

  // Initialize batch quantities when item changes
  useEffect(() => {
    if (item && item.IsBatchManaged === "Y" && item.BatchNum) {
      setBatchQuantities([
        {
          batchNumber: item.BatchNum,
          quantity: Math.min(1, item.Quantity),
          maxQuantity: item.Quantity,
        },
      ]);
      setTotalQuantity(Math.min(1, item.Quantity));
    } else {
      setBatchQuantities([]);
      setTotalQuantity(Math.min(1, item?.Quantity || 1));
    }
  }, [item]);

  // Update total quantity when batch quantities change
  useEffect(() => {
    if (batchQuantities.length > 0) {
      const total = batchQuantities.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );
      setTotalQuantity(total);
    }
  }, [batchQuantities]);

  if (!isOpen || !item) return null;

  const handleBatchQuantityChange = (index: number, newQuantity: number) => {
    setBatchQuantities((prev) =>
      prev.map((batch, i) =>
        i === index
          ? {
              ...batch,
              quantity: Math.max(0, Math.min(newQuantity, batch.maxQuantity)),
            }
          : batch
      )
    );
  };

  const handleTotalQuantityChange = (newQuantity: number) => {
    const maxQuantity = item.Quantity;
    const adjustedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));

    if (item.IsBatchManaged === "Y" && batchQuantities.length > 0) {
      // Distribute the total quantity across batches proportionally
      setBatchQuantities((prev) => {
        const totalMax = prev.reduce(
          (sum, batch) => sum + batch.maxQuantity,
          0
        );
        return prev.map((batch) => ({
          ...batch,
          quantity: Math.floor(
            (batch.maxQuantity / totalMax) * adjustedQuantity
          ),
        }));
      });
    } else {
      setTotalQuantity(adjustedQuantity);
    }
  };

  const buildTransferBody = () => {
    const transferData = {
      FromWarehouse: item.WhsCode,
      ToWarehouse: destinationWarehouse,
      StockTransferLines: [
        {
          LineNum: 0,
          ItemCode: item.ItemCode,
          Quantity: totalQuantity,
          WarehouseCode: destinationWarehouse,
          FromWarehouseCode: item.WhsCode,
          ...(item.IsBatchManaged === "Y" &&
            batchQuantities.length > 0 && {
              BatchNumbers: batchQuantities
                .filter((batch) => batch.quantity > 0)
                .map((batch) => ({
                  BatchNumber: batch.batchNumber,
                  Quantity: batch.quantity,
                  ItemCode: item.ItemCode,
                })),
            }),
        },
      ],
    };

    return transferData;
  };

  const handleTransfer = async () => {
    if (!destinationWarehouse) {
      toast.warning("Por favor, selecione um armazém de destino");
      return;
    }

    if (totalQuantity <= 0) {
      //alert("A quantidade deve ser maior que zero");
      toast.warning("A quantidade deve ser maior que zero");
      return;
    }

    if (destinationWarehouse === item.WhsCode) {
      //alert("O armazém de destino deve ser diferente do armazém de origem");
      toast.warning(
        "O armazém de destino deve ser diferente do armazém de origem"
      );
      return;
    }

    try {
      const transferData = buildTransferBody();
      await onTransfer(transferData);
      onClose();
    } catch (error) {
      console.error("Error transferring stock:", error);
      // Error handling is done in the parent component
    }
  };

  const availableWarehouses = warehouseOptions.filter(
    (warehouse) => warehouse.code !== item.WhsCode
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transferir Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Item Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-900">{item.ItemName}</h3>
          <p className="text-sm text-gray-600">Código: {item.ItemCode}</p>
          <p className="text-sm text-gray-600">
            Lote: {item.BatchNum || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            Armazém Origem: {item.WhsCode}
          </p>
          <p className="text-sm text-gray-600">
            Quantidade Disponível: {item.Quantity}
          </p>
        </div>

        {/* Transfer Options */}
        <div className="space-y-4 mb-6">
          {/* Destination Warehouse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Armazém de Destino
            </label>
            <select
              value={destinationWarehouse}
              onChange={(e) => setDestinationWarehouse(e.target.value)}
              className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-lime-600 focus:outline-none focus:ring-1 focus:ring-lime-600"
            >
              <option value="">Selecione um armazém</option>
              {availableWarehouses.map((warehouse) => (
                <option key={warehouse.code} value={warehouse.code}>
                  {warehouse.code} - {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Section */}
          {item.IsBatchManaged === "Y" && batchQuantities.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidades por Lote
              </label>
              {batchQuantities.map((batch, index) => (
                <div key={index} className="mb-2 p-3 border rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Lote: {batch.batchNumber}
                    </span>
                    <span className="text-xs text-gray-500">
                      Máx: {batch.maxQuantity}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={batch.maxQuantity}
                    value={batch.quantity}
                    onChange={(e) =>
                      handleBatchQuantityChange(
                        index,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-lime-600 focus:outline-none focus:ring-1 focus:ring-lime-600"
                  />
                </div>
              ))}
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">
                  Quantidade Total: {totalQuantity}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade a Transferir
              </label>
              <input
                type="number"
                min="1"
                max={item.Quantity}
                value={totalQuantity}
                onChange={(e) =>
                  handleTotalQuantityChange(parseInt(e.target.value) || 0)
                }
                className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-lime-600 focus:outline-none focus:ring-1 focus:ring-lime-600"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleTransfer}
            disabled={isLoading || !destinationWarehouse || totalQuantity <= 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? "Transferindo..." : "Transferir"}
          </button>
        </div>
      </div>
    </div>
  );
};
