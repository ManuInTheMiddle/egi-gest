import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface consumosSCADA {
  IdConsumos:number;
  numOP:number;
  origemMP:number;
  materiaPrima:string;
  lote:string;
  quantidade:number;
  date:string;
}

interface FetchConsumosSCADAI {
  id: string;
}

export const useFetchConsumosSCADA = (id: FetchConsumosSCADAI["id"]) => {
  return useQuery({
    queryKey: ["consumosSCADA"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://DESKTOP-74D6VT2:8080/api/consumos/numOP/${id}`
      );
      return data as consumosSCADA[];
    },
    enabled: false,
  });
};