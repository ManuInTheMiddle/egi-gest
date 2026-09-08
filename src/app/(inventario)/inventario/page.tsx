"use client";

import React, { useState } from "react";
import Retorceder from "../componentes/retorceder";
import { DataTable } from "../componentes/data-table";
import { createColumns, ItemDetails } from "../componentes/columns";
import { PrintModal } from "../componentes/printingModal";
import { TransferModal } from "../componentes/transferModal";
import { useFetchQuantidadeArtigoLote } from "@/Services/LotesPorArtigo/fetchQuantidadeArtigoLote";

import { useTranferenciaInvSAP } from "@/Services/Inventario/criacaoTransferenciaInv";

function Page() {
  // State to manage the item code input
  const [artigo, setArtigo] = useState("");
  const [searchArtigo, setSearchArtigo] = useState("");

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintItem, setSelectedPrintItem] =
    useState<ItemDetails | null>(null);

  // Transfer Modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTransferItem, setSelectedTransferItem] =
    useState<ItemDetails | null>(null);

  // Fetch data based on the search term
  const dadosLoteArtigo = useFetchQuantidadeArtigoLote(searchArtigo);
  // Stock transfer mutation
  const transferMutation = useTranferenciaInvSAP();

  // Handle opening the print modal
  const handleOpenPrintModal = (item: ItemDetails) => {
    setSelectedPrintItem(item);
    setIsPrintModalOpen(true);
  };

  // Handle closing the print modal
  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedPrintItem(null);
  };

  // Handle opening the transfer modal
  const handleOpenTransferModal = (item: ItemDetails) => {
    setSelectedTransferItem(item);
    setIsTransferModalOpen(true);
  };

  // Handle closing the transfer modal
  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setSelectedTransferItem(null);
  };

  // Handle stock transfer
  // Handle stock transfer using React Query mutation
  const handleStockTransfer = async (transferData: any) => {
    try {
      await transferMutation.mutateAsync(transferData);

      // Show success message
      alert("Transferência realizada com sucesso!");

      // Refresh the data
      dadosLoteArtigo.refetch();
    } catch (error) {
      console.error("Transfer failed:", error);
      alert("Erro ao transferir stock. Tente novamente.");
      throw error; // Re-throw to let the modal handle the error
    }
  };

  // Create columns with action handlers
  const columns = createColumns(handleOpenPrintModal, handleOpenTransferModal);

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (artigo.trim()) {
      setSearchArtigo(artigo.trim());
      dadosLoteArtigo.refetch();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArtigo(e.target.value);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  return (
    <div className="flex flex-col mx-auto justify-center space-y-6 p-4">
      <div>
        <Retorceder />
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="container flex flex-row space-x-4 items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="artigo"
            className="block text-sm/6 font-medium text-gray-700"
          >
            Artigo
          </label>
          <div className="mt-2">
            <input
              id="artigo"
              name="artigo"
              type="text"
              value={artigo}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite o código do artigo"
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-lime-600 sm:text-sm/6"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!artigo.trim() || dadosLoteArtigo.isLoading}
          className="px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {dadosLoteArtigo.isLoading ? "Carregando..." : "Pesquisar"}
        </button>
      </form>

      {/* Results */}
      <div className="container">
        {dadosLoteArtigo.error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Erro ao carregar dados: {dadosLoteArtigo.error.message}
          </div>
        )}

        <DataTable columns={columns} data={dadosLoteArtigo.data?.value || []} />
      </div>

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        item={selectedPrintItem}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        item={selectedTransferItem}
        onTransfer={handleStockTransfer}
        isLoading={transferMutation.isPending}
      />
    </div>
  );
}

export default Page;
