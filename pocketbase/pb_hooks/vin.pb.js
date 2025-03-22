routerAdd("GET", "/api/vin/search/{query}", async (e) => {
	try {
		var { cfg } = require(`${__hooks}/cfg.js`);

		let query = e.request.pathValue("query");
		const res = $http.send({
			url: `${cfg.vin_search_url}?q=${query}`,
			method: "GET",
			headers: {
				Referer: cfg.referer,
				Authorization: cfg.key,
			},
		});
		return e.json(200, res.json);
	} catch (err) {
		console.error(err);
		return e.json(200, {});
	}
});

routerAdd("POST", "/api/vin/quick_groups", async (e) => {
	var { cfg } = require(`${__hooks}/cfg.js`);

	const res = $http.send({
		url: cfg.oem_groups_url,
		method: "POST",
		headers: {
			Referer: cfg.referer,
			Authorization: cfg.key,
		},
		body: JSON.stringify(e.requestInfo().body),
	});
	return e.json(200, res.json);
});

routerAdd("POST", "/api/vin/quick_group", async (e) => {
	var { cfg } = require(`${__hooks}/cfg.js`);

	const res = $http.send({
		url: cfg.oem_group_url,
		method: "POST",
		headers: {
			Referer: cfg.referer,
			Authorization: cfg.key,
		},
		body: JSON.stringify(e.requestInfo().body),
	});
	return e.json(200, res.json);
});
