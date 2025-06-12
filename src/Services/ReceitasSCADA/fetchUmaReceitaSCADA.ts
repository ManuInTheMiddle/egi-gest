import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const BASE_API_URL = process.env.NEXT_PUBLIC_SCADA_BASE_URL;

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
    queryKey: ["receitasSCADA",id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${BASE_API_URL}/api/receita/id/${id}`
      );
      return data as PassoReceita[];
    },
    enabled: false,
  });
};

