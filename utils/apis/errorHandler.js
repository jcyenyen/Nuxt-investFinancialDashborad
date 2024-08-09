import { useRouteHandler } from "../apis/useRouteHandler";

export const axiosErrorHandler = error => {
	console.log(error);
	const { jsDirect } = useRouteHandler();

	const status = error?.response?.status;
	switch (status) {
		case 401:
			console.log(401);
			break;
		case 403:
			console.log(403);
			jsDirect("/");
			break;
		case 404:
			console.log(404);
			break;
		case 422:
			console.log(422);
			break;
		default:
			break;
	}
};
