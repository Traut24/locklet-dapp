import axios from 'axios';

const lockletApi = axios.create({
  baseURL: 'https://func.locklet.finance/api/',
});

export const getTokenLocks = (networkId, pageNumber, pageSize) => {
  return lockletApi.get(`locks/tokens?network=${networkId}&page=${pageNumber}&pageSize=${pageSize}`);
};
