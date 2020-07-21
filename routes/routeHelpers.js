/**
 *
 * @param {Router} router - Express router
 * @param {Array} routes - An array of routes
 */
const buildRouter = (router, routes) => {
	// for each route in the provided routes array
	for (let i in routes) {
		// build the route like you would one by one
		// EG: router.get("/image/meta/:id", getImageMeta);
		router[routes[i].method](
			routes[i].path,
			routes[i].middleware,
			routes[i].handler
		);
		router.stack[i].helpDescription = routes[i].help;
	}

	return router;
};

module.exports = buildRouter;
