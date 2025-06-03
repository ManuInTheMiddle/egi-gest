import { useMutation} from "@tanstack/react-query";
import axios from "axios";

const criarTransferencia = async (body: any) => {
  return await axios.post(
    `http://egiquim-sap:50001/b1s/v1/StockTransfers`,
    body,
    {
      withCredentials: true,
    }
  );
};

export const useTranferenciaInvSAP = () => {
  const mutate = useMutation({
    mutationFn: criarTransferencia,
    onSuccess:()=>{
      console.log("Transferencia de inventario realizada com sucesso")
    },
    onError: (error) => {
      console.error("Erro na transferencia de inventario:", error);
    },
  });
  return mutate;
};