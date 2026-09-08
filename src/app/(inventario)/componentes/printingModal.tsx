import React, { useState } from "react";
import { ItemDetails } from "./columns";
import { usePrinting } from "../hooks/usePrinting";
import { formatDate } from "../utils/dateUtils";

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
  const currentDate = new Date();
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
      let zplContent =
        `^XA${LOGO_ZPL}^CF0,60^FO220,50^FDEgiquimica^FS` +
        `^CF0,30^FO220,115^FDParque Industrial Guarda, Lt.10/15^FS` +
        `^FO220,155^FDGuarda^FS` +
        `^FO220,195^FDPortugal (PT)^FS` +
        `^FO50,245^GB700,3,3^FS`;

      // Add item code and name
      zplContent +=
        `^CFD,50^FO50,265^FDLote:^FS` +
        `^CFD,50^FO50,400^FDArmazem:^FS` +
        `^CFA,45^FO50,450^FD${item.WhsCode}^FS` +
        `^CFD,50^FO50,550^FDData:^FS` +
        `^CFA,45^FO50,600^FD${formatDate(currentDate)}^FS` +
        `^CFA,50^FO50,700^FD${item.ItemName}^FS`;

      // Add batch info if selected
      if (includeBatch && item.BatchNum) {
        zplContent += `^CFA,45^FO50,315^FD${item.BatchNum}^FS`;
      }

      // Add barcode if selected
      if (includeBarcode) {
        zplContent += `^FO515,255^BQ,,6^FD123F:MateriaPrima&C1:${
          item.ItemCode
        }&C2:${item.ItemName}&C3:NA&C4:${
          item.BatchNum
        }&C5:NAvalidade&C6:${formatDate(currentDate)}&^FS`;
      }

      zplContent += `^FO50,775^GB700,100,3^FS` + `^FO50,875^GB700,300,3^FS`;

      if (item.ItemCode.length > 6) {
        zplContent += `^CF0,160^FO60,940^FD${item.ItemCode}^FS`;
      } else {
        zplContent += `^CF0,200^FO60,940^FD${item.ItemCode}^FS`;
      }

      if (item.WhsCode.trim() === "A2") {
        zplContent += `^CF0,50^FO250,800^FDPrd Intermedio^FS`;
      } else if (item.WhsCode.trim() === "A3") {
        zplContent += `^CF0,50^FO250,800^FDPrd Acabado^FS`;
      } else {
        zplContent += `^CF0,50^FO250,800^FDMateria Prima^FS`;
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
          {
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
          }

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

const LOGO_ZPL =
  "^FO50,60^GFA,2016,2016,16,,:T07IF8,S0LFC,R0NFC,Q07OFC,P03QF,P0RFC,O03SF,O0TFC,N03UF,N0VFC,M01LFCI0LFE,M07KF8K07KF8,M0KFCM0KFC,L01JFEN01JFE,L03JFP03JF,L07IFCQ0JF8,K01JFR03IFE,K03IFER01JF,K07IF8S07IF8,K07IFT03IFC,K0IFCU0IFE,J01IF8U07FFE,J03IFJ0E38O03IF,J07FFE0079F7EO01IF8,J0IFC00JFEP0IFC,I01IF800JFEP07FFE,I01IFI0IF7EP03FFE,I03FFEI0F9E3CP01IF,I07FFCI03U0IF,I07FF8I078E3C7P07FF8,I0IFJ0FDF7EF8O03FFC,I0IFJ0LFCO03FFC,001FFEJ0LFCO01FFE,001FFCJ0FDF7EF8P0FFE,003FFCJ078E3C7Q0IF,003FF8L0E1830CO07FF,007FF8J079F7CF9FO03FF8,007FFK0NFO03FF8,00FFEK0NFO01FFC,00FFEK0JFEIFO01FFC,00FFCK0FDF3CF9FP0FFC,01FFCK078418S0FFE,01FFCK078E3CS0FFE,01FF8K0FDF7ES07FE,03FF8K0JFES07FF,:03FFL0FDF7ES03FF,03FFL078E18S03FF,07FFL038E1C30EP03FF807FEL07DFBEFDFP01FF807FEL0NF8O01FF8:07FEL0FDLF8O01FF807FEL07CF3E79FP01FFC0FFEL03060C306Q0FFC0FFCL07CF3E79F3CO0FFC0FFCL0FDFBEFDFFEO0FFC0FFCL0OFEO0FFC:P07DFBEFDF3E,P03861C30E1C,P038F1C78E1C7,P07DFBEFDF3EF8,0FFCL0QFCM0FFC:0FFCL0FDFBEFDFFEFCM0FFC0FFCL07CF3E79F3C78M0FFC0FFCL01X0FFC0FFEL03071ET0FFC07FEL07CFBFS01FFC07FEL0FDIFS01FF8:07FEL0FDFBFS01FF807FEL07CF1ES01FF807FFL03W03FF803FFL078F1E78E3CF8L03FF,03FFL0FDFBEFDF7EF8L03FF,03FF8K0QFCL07FF,:01FF8K07DFBEFDFFEF8L07FE,01FFCK038F1C78F3C7M0FFE,01FFCK03861C38E1C71EK0FFE,00FFCK07DFBE7DF3EFBFK0FFC,00FFEK0SFJ01FFC,:007FFK0FDJFDFFEFBFJ03FF8,007FFK07CF3E79F3E79EJ03FF8,003FF8J01060C3061870C1I07FF,003FFCJ038F3E78F3CF9F7C00IF,001FFCJ07DFBFFDLF7E00FFE,001FFEJ0TFE01FFE,I0IFJ0SF7E03FFC,I0IFJ07DFBEFDF3EF9F7C03FFC,I07FF8I07CF1C78E1C70C1807FF8,I03FFCY0IF8,I03FFEX01IF,I01IFX03FFE,J0IF8W07FFE,J0IFCW0IFC,J07FFEV01IF8,J03IFV03IF,J01IF8U07FFE,J01IFCU0IFC,K0JFT03IFC,K07IF8S07IF8,K03IFER01JF,K01JFR03IFE,L0JFCQ0JF8,L03JFP03JF,L01JFEN01JFE,M0KF8M07JFC,M07KF8K07KF8,M01LFE001LFE,N0VFC,N03UF,O0TFC,O03SF,P0RFE,P03QF,Q07OF8,Q01NFC,R01LFE,T07IF8,,^FS";
