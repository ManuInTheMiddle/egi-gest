import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const DB_NAME = process.env.NEXT_PUBLIC_SAP_DBNAME;
const DB_USER = process.env.NEXT_PUBLIC_SAP_USER;
const DB_PASSWORD = process.env.NEXT_PUBLIC_SAP_PASSWORD;

//BASE DE DADOS PRE LIVE
const UTILIZADOR = {
  CompanyDB: `${DB_NAME}`,
  Password: `${DB_USER}`,
  UserName: `${DB_PASSWORD}`,
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
