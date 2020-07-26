const got = require("got");
const jimp = require("jimp");
const http = require("http");
const url = require("url");
const fs = require("fs");
const vers = "0.1";
http.createServer(runServer).listen(3000);
async function runServer(req,res) {
	const r = url.parse(req.url, true);
	var path = r.path;
	var param = r.query;
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
						if (raw[0].data.game && raw[1].data.game.streams) {
							var body = JSON.stringify({
								"gameInfo": raw[0].data.game,
								"streams": raw[1].data.game.streams.edges
							});
						} else {
							if (raw[0].data.game == null) {
								var body = JSON.stringify({
									"err": "noGameFound"
								});
							}
						}
						res.writeHead(200, {
							"Access-Control-Allow-Origin": "*",
							"Content-Type": "application/json"
						})
						res.end(body);
					})
				}
			} else if (s[2] == "channel") {
				var u = s[3];
				got.post("https://gql.twitch.tv/gql#origin=twilight", {
					json: [
						{
							"operationName":"ChannelShell",
							"variables": {
								"login": u
							},
							"extensions": {
								"persistedQuery": {
									"sha256Hash": "2b29e2150fe65ee346e03bd417bbabbd0471a01a84edb7a74e3c6064b0283287",
									"version":1	
								}
							}
						},
						{
							"operationName":"UseLive",
							"variables": {
								"channelLogin": u
							},
							"extensions": {
								"persistedQuery": {
									"sha256Hash": "639d5f11bfb8bf3053b424d9ef650d04c4ebb7d94711d644afb08fe9a0fad5d9",
									"version":1	
								}
							}
						},
						{
							"operationName":"UseHosting",
							"variables": {
								"channelLogin": u
							},
							"extensions": {
								"persistedQuery": {
									"sha256Hash": "427f55a3daca510f726c02695a898ef3a0de4355b39af328848876052ea6b337",
									"version":1	
								}
							}
						}
					],
					headers: {
						"Accept": "*/*",
						"Accept-Encoding": "gzip, deflate, br",
						"Accept-Language": "en-US",
						"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0"
					}
				}).then(function(response) {
					var raw = JSON.parse(response.body);
					var body = JSON.stringify({
						"profile": raw[0].data.user,
						"stream": raw[1].data.user.stream,
						"hosting": raw[2].data.user.hosting
					})
					res.writeHead(200, {
						"Access-Control-Allow-Origin": "*",
						"Content-Type": "application/json"
					})
					res.end(body);
				})
			} else if (s[2] == "proxy") {
				var decode = Buffer.from(param.url,"base64").toString();
				got(decode).then(async function (response) {
					var h = response.headers;
					var r = response.rawBody;
					res.writeHead(response.statusCode,h);
					res.end(r);
				})
			} else {
				var j = JSON.stringify({
					"err":"invalidEnpoint",
					"version":vers
				})
				res.writeHead(404, {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json"
				})
				res.end(j);
			}
		} else if (s[1] == "api" && !s[2]) {
			var j = JSON.stringify({
				"err":"invalidEnpoint",
				"version":vers
			})
			res.writeHead(404, {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json"
			})
			res.end(j);
		} else {
			if (path == "/") {
				fs.readFile("./web-content/index.html", function (err,resp) {
					if (err) {
						if (err.code == "ENONET") {
							fs.readFile("./errors/404.html", function(err,resp) {
								if (err){
									res.writeHead(404, {
										"Access-Control-Allow-Origin": "*",
										"Content-Type":"text/html"
									})
									res.end(resp);
								} else {
									res.end(err.code);
								}
							})
						}
					} else {
						res.writeHead(200, {
							"Access-Control-Allow-Origin": "*",
							"Content-Type":"text/html"
						})
						res.end(resp);
					}
				})
			} else {
				var path = path.split("?")[0];
				fs.readFile("./web-content" + path, function(err,resp) {
					if (err) {
						if (err.code == "EISDIR") {
							if (path.substring(path.length - 1, path.length) == "/") {
								fs.readFile("./web-content" + path + "index.html", function(err,resp) {
									if (err) {
										if (err.code == "ENONET") {
											fs.readFile("./errors/404.html", function(err,resp) {
												if (err){
													res.writeHead(404, {
														"Access-Control-Allow-Origin": "*",
														"Content-Type":"text/html"
													})
													res.end(resp);
												} else {
													res.end(err.code);
												}
											})
										}
									} else {
										res.writeHead(200, {
											"Access-Control-Allow-Origin": "*",
											"Content-Type":"text/html"
										})
										res.end(resp);
									}
								})
							} else {
								fs.readFile("./web-content" + path + "/index.html", function(err,resp) {
									if (err) {
										if (err.code == "ENONET") {
											fs.readFile("./errors/404.html", function(err,resp) {
												if (err){
													res.writeHead(404, {
														"Access-Control-Allow-Origin": "*",
														"Content-Type":"text/html"
													})
													res.end(resp);
												} else {
													res.end(err.code);
												}
											})
										}
									} else {
										res.writeHead(200, {
											"Access-Control-Allow-Origin": "*",
											"Content-Type":"text/html"
										})
										res.end(resp);
									}
								})
							}
						} else if (err.code == "ENOENT") {
							fs.readFile("./errors/404.html", function(err,resp) {
								if (!err) {
									res.writeHead(404, {
										"Access-Control-Allow-Origin": "*",
										"Content-Type":"text/html"
									})
									res.end(resp);
								} else {
									res.end(err.code);
								}
							})
						} else {
							res.end(err)
						}
					} else {
						if (path.includes(".")) {
							var fileType = path.split(".")[path.split(".").length - 1];
							if (fileType == "css") {
								res.writeHead(200, {
									"Access-Control-Allow-Origin": "*",
									"Content-Type":"text/css"
								})
								res.end(resp);
							} else if (fileType == "js") {
								res.writeHead(200, {
									"Access-Control-Allow-Origin": "*",
									"Content-Type":"application/javascript"
								})
								res.end(resp);
							} else if (fileType == "html") {
								res.writeHead(200, {
									"Access-Control-Allow-Origin": "*",
									"Content-Type":"text/html"
								})
								res.end(resp);
							} else if (fileType == "mp3") {
								res.writeHead(200, {
									"Access-Control-Allow-Origin": "*",
									"Content-Type":"audio/mp3"
								})
								res.end(resp);
							} else {
								res.writeHead(200, {
									"Access-Control-Allow-Origin": "*"
								})
								res.end(resp);
							}
						} else {
							res.writeHead(200, {
								"Access-Control-Allow-Origin": "*",
								"Content-Type":"text/html"
							})
							res.end(resp);
						}
					}
				})
			}
		}
	}
}