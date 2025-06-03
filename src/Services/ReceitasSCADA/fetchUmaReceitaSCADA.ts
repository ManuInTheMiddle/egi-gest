import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface PassoReceita {
  IdReceita: number;
  numeroPasso: number;
  receita: string;
  phMin: number;
  phMax: number;
  densidade: number;
  fase: number;
  materiaPrima: string;
  parametro1: number;
  parametro2: number;
  dataCriacao: string;
}

interface FetchReceitasSCADAI {
  id: string;
}

export const useFetchReceitasSCADA = (id: FetchReceitasSCADAI["id"]) => {
  return useQuery({
    queryKey: ["receitasSCADA"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://DESKTOP-74D6VT2:8080/api/receita/id/${id}`
      );
      return data as PassoReceita[];
    },
    enabled: false,
  });
};
