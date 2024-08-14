import {
	apiGetStockButton,
	apiGetStockData,
	apiGetNews,
	apiRisingStockRanking,
	apiLosingStockRanking,
	apiActivedStockRanking,
} from "~/utils/apis/instances/index";

export const getStockButton = () => {
	try {
		return apiGetStockButton().then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};

export const getStockData = (stock) => {
	try {
		return apiGetStockData(stock).then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};

export const getNews = (topic, stock, startTime, endTime) => {
	try {
		return apiGetNews(topic, stock, startTime, endTime).then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};

export const losingStockRanking = () => {
	try {
		return apiLosingStockRanking().then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};

export const activedStockRanking = () => {
	try {
		return apiActivedStockRanking().then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};

export const risingStockRanking = () => {
	try {
		return apiRisingStockRanking().then(
			res => res,
			error => {
				console.error(error);
			},
		);
	} catch (error) {
		console.error(error);
	}
};