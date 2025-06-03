import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";

export class PrinterService {
  private browserPrint: ZebraBrowserPrintWrapper;

  constructor() {
    this.browserPrint = new ZebraBrowserPrintWrapper();
  }

  async printLabel(zplContent: string): Promise<void> {
    try {
      const foundPrinters = await this.browserPrint.getAvailablePrinters();
      
      if (foundPrinters.length === 0) {
        throw new Error("Nenhuma impressora encontrada");
      }

      console.log("Impressora encontrada:", foundPrinters[0]);
      await this.browserPrint.setPrinter(foundPrinters[0]);

      const printerStatus = await this.browserPrint.checkPrinterStatus();
      console.log("Status da impressora:", printerStatus);

      if (printerStatus.isReadyToPrint) {
        await this.browserPrint.print(zplContent);
        console.log("Etiqueta impressa com sucesso");
      } else {
        throw new Error("Impressora não está pronta para imprimir");
      }
    } catch (error) {
      console.error("Erro ao imprimir etiqueta:", error);
      throw error;
    }
  }
}