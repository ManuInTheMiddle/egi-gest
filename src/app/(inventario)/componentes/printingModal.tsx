import React, { useState } from "react";
import { ItemDetails } from "./columns";
import { usePrinting } from "../hooks/usePrinting";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDetails | null;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [includeBatch, setIncludeBatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { printLabels } = usePrinting();

  if (!isOpen || !item) return null;

  const handlePrint = async () => {
    setIsLoading(true);
    try {
      // Generate ZPL content based on user selections
      let zplContent = `^XA`;

      // Add item code and name
      zplContent += `^FO50,50^A0N,30,30^FDCódigo: ${item.ItemCode}^FS`;
      zplContent += `^FO50,100^A0N,25,25^FD${item.ItemName}^FS`;

      // Add batch info if selected
      if (includeBatch && item.BatchNum) {
        zplContent += `^FO50,150^A0N,25,25^FDLote: ${item.BatchNum}^FS`;
      }

      // Add quantity info
      zplContent += `^FO50,200^A0N,25,25^FDQuantidade: ${item.Quantity}^FS`;
      zplContent += `^FO50,250^A0N,25,25^FDArmazém: ${item.WhsCode}^FS`;

      // Add barcode if selected
      if (includeBarcode) {
        zplContent += `^FO50,300^BY3^BCN,70,Y,N,N^FD${item.ItemCode}^FS`;
      }

      zplContent += `^XZ`;

      // Print the specified quantity
      for (let i = 0; i < quantity; i++) {
        await printLabels(zplContent);
      }

      onClose();
    } catch (error) {
      console.error("Error printing labels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Imprimir Etiqueta</h2>
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
          <p className="text-sm text-gray-600">Armazém: {item.WhsCode}</p>
        </div>

        {/* Print Options */}
        <div className="space-y-4 mb-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade de etiquetas
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-lime-600 focus:outline-none focus:ring-1 focus:ring-lime-600"
            />
          </div>

          {/* Include Barcode */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeBarcode"
              checked={includeBarcode}
              onChange={(e) => setIncludeBarcode(e.target.checked)}
              className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
            />
            <label
              htmlFor="includeBarcode"
              className="ml-2 text-sm text-gray-700"
            >
              Incluir código de barras
            </label>
          </div>

          {/* Include Batch */}
          {item.BatchNum && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeBatch"
                checked={includeBatch}
                onChange={(e) => setIncludeBatch(e.target.checked)}
                className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
              />
              <label
                htmlFor="includeBatch"
                className="ml-2 text-sm text-gray-700"
              >
                Incluir informação do lote
              </label>
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
            onClick={handlePrint}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-lime-600 rounded-md hover:bg-lime-700 disabled:bg-gray-400"
          >
            {isLoading
              ? "Imprimindo..."
              : `Imprimir ${quantity} etiqueta${quantity > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};
