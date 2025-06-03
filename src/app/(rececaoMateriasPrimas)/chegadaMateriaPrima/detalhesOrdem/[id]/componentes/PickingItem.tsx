import React from 'react';
import { OrdemCompraDocumentLine } from '../constantsAndTypes/pickingTypes';
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import { formatDate } from '../utils/dateUtils';

interface PickingItemProps {
  item: OrdemCompraDocumentLine;
  isValidated: boolean;
  quantidadeRestante?: number;
}

const PickingItem: React.FC<PickingItemProps> = ({ 
  item, 
  isValidated, 
  quantidadeRestante 
}) => {
  const currentDate = new Date();

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-6">
        <a className="h-14 w-14 shrink-0">
          {isValidated ? (
            <img
              className="h-full w-full"
              src="/assets/images/packageClr.png"
              alt="package image"
            />
          ) : (
            <img
              className="h-full w-full"
              src="/assets/images/package.png"
              alt="package image"
            />
          )}
        </a>

        <div className="min-w-0 flex-1 flex-row font-medium text-gray-900 dark:text-white">
          {item.LineNum} {item.ItemDescription}
          {item.LineStatus === "bost_Open" ? (
            <div className="mt-1 flex items-center gap-x-1.5">
              <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs leading-5 text-gray-500">
                {`Em aberto (falta ${quantidadeRestante || item.RemainingOpenQuantity})`}
              </p>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-x-1.5">
              <div className="flex-none rounded-full bg-rose-500/20 p-1">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              </div>
              <p className="text-xs leading-5 text-gray-500">
                Fechada
              </p>
            </div>
          )}
        </div>

        <div>
          <QrcodeComponent
            information={`F:MateriaPrima&C1:${item.LineNum}&C2:${
              item.ItemDescription
            }&C3:F0001&C4:4230126&C5:2024-01-05T00:00:00Z&C6:${formatDate(
              currentDate,
              "P"
            )}&`}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">
            ID do Produto:
          </span>{" "}
          {item.ItemCode}
        </p>
        <div className="flex items-center justify-end gap-4">
          <p className="text-base font-normal text-gray-900 dark:text-white">
            x{item.Quantity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PickingItem;