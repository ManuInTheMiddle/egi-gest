import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, Package, Printer } from "lucide-react";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";

interface OrderActionButtonsProps {
  ordemProducao: ProductionOrder;
  onValidate: () => void;
  onConsumption: () => void;
  onPrintLabel: () => void;
  validationDialog: React.ReactNode;
  consumptionDialog: React.ReactNode;
  isValidating?: boolean;
  isLoadingConsumption?: boolean;
  isPrinting?: boolean;
  isPrintDisabled?: boolean; // NEW PROP
}

export const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  ordemProducao,
  onValidate,
  onConsumption,
  onPrintLabel,
  validationDialog,
  consumptionDialog,
  isValidating = false,
  isLoadingConsumption = false,
  isPrinting = false,
  isPrintDisabled = false,
}) => {
  return (
    <div className="flex justify-center space-x-4 p-4">
      {/* Validation Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            onClick={onValidate}
            disabled={isValidating}
            className="flex items-center space-x-2"
            variant="default"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>
              {isValidating ? "Validando..." : "Validar Ordem"}
            </span>
          </Button>
        </AlertDialogTrigger>
        {validationDialog}
      </AlertDialog>

      {/* Consumption Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            onClick={onConsumption}
            disabled={isLoadingConsumption}
            className="flex items-center space-x-2"
            variant="secondary"
          >
            {isLoadingConsumption ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Package className="h-4 w-4" />
            )}
            <span>
              {isLoadingConsumption ? "Carregando..." : "Ver Consumos"}
            </span>
          </Button>
        </AlertDialogTrigger>
        {consumptionDialog}
      </AlertDialog>

      {/* Print Label Button with Conditional Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onPrintLabel}
              disabled={isPrinting || isPrintDisabled}
              className="flex items-center space-x-2"
              variant="outline"
            >
              {isPrinting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              <span>
                {isPrinting ? "Imprimindo..." : "Imprimir Etiqueta"}
              </span>
            </Button>
          </TooltipTrigger>
          {isPrintDisabled && (
            <TooltipContent>
              <p>Confirme os consumos primeiro antes de imprimir a etiqueta</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};