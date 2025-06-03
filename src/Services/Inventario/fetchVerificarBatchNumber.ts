import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const useFetchBatchManagedSAPData = (Item:string) => {
  return useQuery({
    queryKey: ["batchManagedSAPdata"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://egiquim-sap:50001/b1s/v1/Items('${Item}')?$select=ManageBatchNumbers`,
        { withCredentials: true }
      );
      return data;
    },
    enabled:false,
  });
};