import { axiosErrorHandler } from "~/utils/apis/errorHandler.js";

export const interceptorSuccessHandler = response => response.data;

export const interceptorErrorHandler = error => {
	axiosErrorHandler(error);
	return Promise.reject(error?.response?.data);
};

export const alphaUrl = 'https://www.alphavantage.co';
export const fmpUrl = 'https://financialmodelingprep.com/api/v3';
