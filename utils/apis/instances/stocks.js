import { fmpApi } from '../index'

const fmpKey = import.meta.env.VITE_KEY_FMP

export const apiGetStockFundamental = (symbol) =>
  fmpApi.get(`/profile/${symbol}`, {
    params: {
      apikey: fmpKey
    }
  });

export const apiGetStockTrend = (symbol) =>
  fmpApi.get(`/historical-price-full/${symbol}`, {
    params: {
      timeseries: 365,
      apikey: fmpKey
    }
  });

export const apiSearchStock = (symbol) =>
  fmpApi.get('/search', {
    params: {
      query: symbol,
      limit: 10,
      exchange: 'NASDAQ',
      apikey: fmpKey
    }
  });
