import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner"; // Add this import

const BASE_API_URL = process.env.NEXT_PUBLIC_SCADA_BASE_URL;

interface corpoUpdate {
  numeroOP: number;
  Reator: number;
}

const atualizarReatorOrdemSCADA = async (body: corpoUpdate) => {
  return await axios.patch(
    `${BASE_API_URL}/api/ordemProducao/reator/${body.numeroOP}`,
    { reator: body.Reator },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
};

export const useAtualizarReatorOrdemSCADA = () => {
  const queryClient = useQueryClient();
  
  const mutate = useMutation({
    mutationFn: atualizarReatorOrdemSCADA,
    onMutate: (variables) => {
      // Show loading toast
      toast.loading(`Atualizando reator para ordem ${variables.numeroOP}...`);
    },
    onSuccess: (data, variables) => {
      // Dismiss loading and show success
      toast.dismiss();
      toast.success(`Reator ${variables.Reator} atualizado com sucesso para ordem ${variables.numeroOP}!`, {
        duration: 4000,
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["ordemProducaoSCADA"] });
      queryClient.invalidateQueries({ queryKey: ["ordemProducaoSCADA", variables.numeroOP.toString()] });
      
      console.log("Reator SCADA atualizado com sucesso");
    },
    onError: (error, variables) => {
      // Dismiss loading and show error
      toast.dismiss();
      toast.error(`Erro ao atualizar reator para ordem ${variables.numeroOP}`, {
        description: error.message || "Tente novamente mais tarde",
        duration: 5000,
      });
      
      console.log("Erro ao atualizar reator SCADA:", error);
    }
  });
  
  return mutate;
};
/*
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface corpoUpdate {
  numeroOP: number;
  Reator: number; // Keep your current naming
}

const atualizarReatorOrdemSCADA = async (body: corpoUpdate) => {
  return await axios.patch(
    `http://DESKTOP-74D6VT2:8080/api/ordemProducao/reator/${body.numeroOP}`, // Changed URL
    { reator: body.Reator }, // Changed property to lowercase
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
};

export const useAtualizarReatorOrdemSCADA = () => {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: atualizarReatorOrdemSCADA,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ordemProducaoSCADA"] });
      queryClient.invalidateQueries({ queryKey: ["ordemProducaoSCADA", variables.numeroOP.toString()] });
      console.log("Reator SCADA atualizado com sucesso");
    },
    onError: (error) => {
      console.log("Erro ao atualizar reator SCADA:", error);
    }
  });
  return mutate;
};
*/