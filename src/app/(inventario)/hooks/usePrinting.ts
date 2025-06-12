import { useCallback } from "react";
import { PrinterService } from "../utils/printerUtil";
import { toast } from "sonner";

interface UsePrintingReturn {
  printLabels: (zplContent: string) => Promise<void>;
}

export const usePrinting = (): UsePrintingReturn => {
  const printLabels = useCallback(async (zplContent: string): Promise<void> => {
    try {
      const printerService = new PrinterService();
      await printerService.printLabel(zplContent);
      toast.success("Etiquetas impressas com sucesso!");
    } catch (error) {
      console.error("Erro ao imprimir etiquetas:", error);
      toast.error("Erro ao imprimir etiquetas: " + (error as Error).message);
    }
  }, []);

  return { printLabels };
};
