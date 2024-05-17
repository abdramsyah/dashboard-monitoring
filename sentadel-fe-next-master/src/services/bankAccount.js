import { httpClient } from "../api/httpClient";

export const getBankAccount = () => {
  return httpClient.get("https://api.sampleapis.com/fakebank/accounts");
};

export const getDetailBankAccount = (id) => {
  return httpClient.get(`https://api.sampleapis.com/fakebank/accounts/${id}`);
};
