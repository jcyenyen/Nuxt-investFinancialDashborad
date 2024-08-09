import axios from "axios";

import {
	interceptorSuccessHandler,
	interceptorErrorHandler,
	alphaUrl,
	fmpUrl,
} from "./utilities";

const alphaApi = axios.create({
	baseURL: alphaUrl,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

const fmpApi = axios.create({
	baseURL: fmpUrl,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

alphaApi.interceptors.response.use(interceptorSuccessHandler, interceptorErrorHandler);
fmpApi.interceptors.response.use(interceptorSuccessHandler, interceptorErrorHandler);

export {alphaApi,fmpApi}
