import axios from 'axios';

const lockletApi = axios.create({
  baseURL: 'https://func.locklet.finance/api/',
});

export const getMarketStats = () => {
  return lockletApi.get(`stats/market`);
};

export const getChainsStats = () => {
  return lockletApi.get(`stats/chains`);
};

export const getTokenLocks = (networkId, pageNumber, pageSize) => {
  return lockletApi.get(`locks/tokens?network=${networkId}&page=${pageNumber}&pageSize=${pageSize}`);
};

export const getTokenLocksByTokenAddr = (networkId, tokenAddress) => {
  return lockletApi.get(`locks/tokens/search?network=${networkId}&tokenAddress=${tokenAddress}`);
};

export const getTokenLockTxHash = (networkId, lockIndex) => {
  return lockletApi.get(`locks/tokens/tx-hash?network=${networkId}&lock=${lockIndex}`);
};
