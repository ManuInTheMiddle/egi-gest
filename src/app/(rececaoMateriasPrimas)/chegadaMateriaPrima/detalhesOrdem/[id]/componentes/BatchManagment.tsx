import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rings } from "react-loader-spinner";
import { ValidatedItem } from '../constantsAndTypes/pickingTypes';

interface BatchManagementProps {
  validatedItems: ValidatedItem[];
  onArtigoChange: (artigo: string) => void;
  onLoteRefetch: () => void;
  onBatchNumberSet: (batchNumber: string) => void;
  isLoading: boolean;
  loteData?: any[];
}

const BatchManagement: React.FC<BatchManagementProps> = ({
  validatedItems,
  onArtigoChange,
  onLoteRefetch,
  onBatchNumberSet,
  isLoading,
  loteData = []
}) => {
  const [numeroLote, setNumeroLote] = useState<string>("");

  const validItems = validatedItems.filter(item => item.ItemCode !== "");

  return (
    <div className="flex flex-row space-x-2 items-center">
      <Select onValueChange={onArtigoChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Artigo" />
        </SelectTrigger>
        <SelectContent>
          {validItems.map((item, index) => (
            <SelectItem
              key={`${item.ItemCode}-${item.quantidade}-${index}`}
              value={item.ItemCode}
            >
              {`${item.baseLine} ${item.ItemCode}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onLoteRefetch}>
        {isLoading ? (
          <Rings
            visible={true}
            height="40"
            width="40"
            color="#FFFFFF"
            ariaLabel="rings-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        ) : (
          "Lote"
        )}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Detalhes</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Detalhes do Lote</DialogTitle>
          <DialogDescription>
            <div className="space-y-4 max-h-[339px] overflow-y-scroll sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
              {loteData.map((lote, index) => (
                <dl
                  key={index}
                  className="sm:flex items-center justify-between gap-4"
                >
                  <dd className="flex-col items-center justify-center">
                    <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                      Artigo
                    </div>
                    <div>{lote.ItemCode}</div>
                  </dd>
                  <dd className="flex-col items-center justify-center">
                    <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                      Gerido por Lotes
                    </div>
                    <div>
                      {lote.IsBatchManaged === "Y" ? "Sim" : "Não"}
                    </div>
                  </dd>
                  <dd className="flex-col items-center justify-center">
                    <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                      Armazém
                    </div>
                    <div>{lote.WhsCode}</div>
                  </dd>
                  <dd className="flex-col items-center justify-center">
                    <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                      Número Lote
                    </div>
                    <div>{lote.BatchNum}</div>
                  </dd>
                  <dd className="flex-col items-center justify-center">
                    <div className="font-medium text-gray-900 dark:text-white sm:text-end">
                      Quantidade
                    </div>
                    <div>{lote.Quantity}</div>
                  </dd>
                </dl>
              ))}
            </div>
          </DialogDescription>
          <DialogFooter>
            <Input
              placeholder="Número do lote"
              value={numeroLote}
              onChange={(e) => setNumeroLote(e.target.value)}
            />
            <Button
              disabled={validItems.length < 1 || !numeroLote.trim()}
              onClick={() => {
                onBatchNumberSet(numeroLote);
                setNumeroLote("");
              }}
            >
              Definir Número Lote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchManagement;