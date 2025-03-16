/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/sup/search/{query}", async (e) => {
	var { cfg } = require(`${__hooks}/cfg.js`);
	let query = e.request.pathValue("query");
	const res = $http.send({
		url: `${cfg.url}${query}`,
		method: "GET",
		headers: {
			Authorization:
				cfg.key,
		},
		timeout: 120, // in seconds
	});
	return e.json(200, res.json);
});
