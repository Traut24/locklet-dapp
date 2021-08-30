import axios from 'axios';

const lockletApi = axios.create({
  baseURL: 'https://func.locklet.finance/api/',
});

export const getMarketStats = () => {
  return lockletApi.get(`stats/market`);
}

export const getChainsStats = () => {
  return lockletApi.get(`stats/chains`);
}

export const getTokenLocks = (networkId, pageNumber, pageSize) => {
  return lockletApi.get(`locks/tokens?network=${networkId}&page=${pageNumber}&pageSize=${pageSize}`);
};
