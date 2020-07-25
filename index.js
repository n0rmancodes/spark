const got = require("got");
const http = require("http");
const url = require("url");
const vers = "0.1";
http.createServer(runServer).listen(3000);
function runServer(req,res) {
	const r = url.parse(req.url, true);
	const path = r.path;
	const param = r.query;
	if (path.includes("/")) {
		const s = path.split("/")
		if (s[1] == "api" && s[2]) {
			if (s[2] == "games") {
				if (param.sortBy) {
					if (param.sortBy == "reccomended") {
						var sort = "RELEVANCE";
					} else {
						var sort = "VIEWER_COUNT";
					}
				} else {
					var sort = "VIEWER_COUNT";
				}
				got.post("https://gql.twitch.tv/gql#origin=twilight", {
					json: {
						"operationName":"BrowsePage_AllDirectories",
						"variables":{
							"limit":30,
							"options": {
								"reccomendationsContext": {
									"platform":"web"
								},
								"sort":sort,
								"tags":[],
							},
						},
						"extensions": {
							"persistedQuery": {
								"sha256hash":"78957de9388098820e222c88ec14e85aaf6cf844adf44c8319c545c75fd63203",
								"version": 1
							}
						}
					},
					headers: {
						"Accept": "*/*",
						"Accept-Encoding": "gzip, deflate, br",
						"Accept-Language": "en-US",
						"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0"
					}
				}).then(function(response) {
					var body = JSON.parse(response.body);
					res.writeHead(200, {
						"Access-Control-Allow-Origin": "*",
						"Content-Type": "application/json"
					})
					res.end(JSON.stringify(body.data.directoriesWithTags.edges));
				})
			} else if (s[2] == "game") {
				if (!param.game) {
					var j = JSON.stringify({
						"err":"noGame"
					})
					res.writeHead(404, {
						"Access-Control-Allow-Origin": "*",
						"Content-Type": "application/json"
					})
					res.end(j);
				} else {
					var g = param.game;
					got.post("https://gql.twitch.tv/gql#origin=twilight", {
						json: [
							{
								"operationName":"Directory_DirectoryBanner",
								"variables": {
									"name": g,
								},
								"extensions": {
									"persistedQuery": {
										"sha256Hash":"a64b0348103e054cbdb20c58de5fc05160da3f86c37c80263d7e6282f2577f54",
										"version":1,
									}
								}
							},
							{
								"operationName":"DirectoryPage_Game",
								"variables":{
									"name":g.toLowerCase(),
									"options":{
										"sort":"VIEWER_COUNT",
										"recommendationsContext":{
											"platform":"web"
										},
										"tags":[]
									},
									"sortTypeIsRecency":false,
									"limit":30
								},
								"extensions":{
									"persistedQuery":{
										"version":1,
										"sha256Hash":"f2ac02ded21558ad8b747a0b63c0bb02b0533b6df8080259be10d82af63d50b3"
									},
								},
							},
						],
						headers: {
							"Accept": "*/*",
							"Accept-Encoding": "gzip, deflate, br",
							"Accept-Language": "en-US",
							"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0"
						}
					}).then(function(response) {
						var raw = JSON.parse(response.body)
						var body = JSON.stringify({
							"gameInfo": raw[0].data.game,
							"streams": raw[1].data.game.streams.edges
						})
						res.writeHead(200, {
							"Access-Control-Allow-Origin": "*",
							"Content-Type": "application/json"
						})
						res.end(body);
					})
				}
			}
		} else if (s[1] == "api" && !s[2]) {
			var j = JSON.stringify({
				"err":"invalidEnpoint",
				"version":vers
			})
			res.writeHead(200, {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			})
			res.end(j);
		} else {
			
		}
	}
}