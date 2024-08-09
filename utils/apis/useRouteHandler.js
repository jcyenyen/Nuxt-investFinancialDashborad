export const useRouteHandler = () => {
	const jsDirect = (path) => {
		if (path.charAt(0) !== "/") {
			return;
		}
		window.location.href = path;
	};

	return {
		jsDirect,
	};
};
