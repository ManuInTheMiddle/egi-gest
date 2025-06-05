import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const UTILIZADOR = {
  CompanyDB: "Egiquimica_TST3",
  Password: "egisap",
  UserName: "manager",
};

const fazerLoginSap = () => {
  return axios
    .post("http://egiquim-sap:50001/b1s/v1/Login", UTILIZADOR, {
      withCredentials: true,
    })
    .then((response) => {
      console.log(response.data);
      console.log(response.data.SessionId);
    });
};

export const useLoginSAP = () => {
  return useMutation({ mutationFn: fazerLoginSap });
};
