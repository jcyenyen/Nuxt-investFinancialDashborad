import {
	apiGetStockFundamental,
	apiGetStockTrend,
	apiSearchStock,
} from "~/utils/apis/instances/stocks";

export const getStockFundamental = (symbol) => {
	try {
		return apiGetStockFundamental(symbol).then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};

export const getStockTrend = (symbol) => {
	try {
		return apiGetStockTrend(symbol).then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};

export const searchStock = (symbol) => {
	try {
		return apiSearchStock(symbol).then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};
