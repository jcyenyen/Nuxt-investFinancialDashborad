import { fmpApi, alphaApi } from '../index'

const fmpKey = import.meta.env.VITE_KEY_FMP
const alphaKey = import.meta.env.VITE_KEY_ALPHA

export const apiGetStockButton = () =>
  fmpApi.get('/quote-order/AAPL,GOOGL,META,TSLA', { params: { apikey: fmpKey } })

export const apiGetStockData = (stock) =>
  alphaApi.get('/query', {
    params: {
      function: 'TIME_SERIES_INTRADAY',
      symbol: stock,
      interval: '1min',
      outputsize: 'full',
      apikey: alphaKey
    }
  })

export const apiGetNews = (topic, stock, startTime, endTime) =>
  alphaApi.get('/query', {
    params: {
      function: 'NEWS_SENTIMENT',
      topics: topic,
      tickers: stock,
      time_from: startTime,
      time_to: endTime,
      apikey: alphaKey
    }
  });

export const apiRisingStockRanking = () =>
  fmpApi.get('/stock_market/gainers', {
    params: {
      apikey: fmpKey
    }
  });

export const apiLosingStockRanking = () =>
  fmpApi.get('/stock_market/losers', {
    params: {
      apikey: fmpKey
    }
  });

export const apiActivedStockRanking = () =>
  fmpApi.get('/stock_market/actives', {
    params: {
      apikey: fmpKey
    }
  });
