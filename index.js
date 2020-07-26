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
				var u = s[3].toLowerCase();
				got.post("https://gql.twitch.tv/gql#origin=twilight", {
					json:[
						{"operationName":"ChannelShell","variables":{"login":u},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"2b29e2150fe65ee346e03bd417bbabbd0471a01a84edb7a74e3c6064b0283287"}}},
						{"operationName":"UseLive","variables":{"channelLogin":u},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"639d5f11bfb8bf3053b424d9ef650d04c4ebb7d94711d644afb08fe9a0fad5d9"}}},
						{"operationName":"UseHosting","variables":{"channelLogin":u},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"427f55a3daca510f726c02695a898ef3a0de4355b39af328848876052ea6b337"}}},
						{"operationName":"PlayerTrackingContextQuery","variables":{"channel":u,"isLive":true,"hasCollection":false,"collectionID":"","videoID":"","hasVideo":false,"slug":"","hasClip":false},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"dba40c8780d87bf368b0c7179fc02ed349e3ce95be3ccf1d77267d23be5c3c75"}}},
						{"operationName":"VideoPreviewOverlay","variables":{"login":u},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"3006e77e51b128d838fa4e835723ca4dc9a05c5efd4466c1085215c6e437e65c"}}},
						{"operationName":"VideoAdBanner","variables":{"input":{"login":u,"ownsCollectionID":"","ownsVideoID":""}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"33c38317fd1d2ca11dfd51ca241e7670eb55382c3cf435230ff244e6cd6af391"}}},
						{"operationName":"MatureGateOverlayBroadcaster","variables":{"input":{"login":u,"ownsVideoID":null}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"db5c4f54238cb6cde9d1ab49dab9d6388bb4990304766fcd70c1f37d4ed93bdb"}}},
						{"operationName":"StreamTagsTrackingChannel","variables":{"channel":u},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"327d7b1596b37898de6a0eaabfdd8ee37b6cc586daab0d12b8fad64f03856a4a"}}},
						{"operationName":"PersonalSections","variables":{"input":{"sectionInputs":["RECOMMENDED_SECTION"],"recommendationContext":{"platform":"web"}}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"956b5b6ecd1d461f51268755fbb15ef0570057872fbdcf736f07f5eaaf2c6778"}}},
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
					if (raw[7].data.user.stream) {
						var tags = raw[7].data.user.stream.tags;
					} else {
						var tags = null;
					}
					if (raw[4].data.user.stream) {
						var pr = raw[4].data.user.stream.previewImageURL;
						var r = raw[4].data.user.stream.restriction;
					} else {
						var pr = null;
						var r = null;
					}
					var body = JSON.stringify({
						"profile": {
							"id": raw[0].data.user.id,
							"login": raw[0].data.user.login,
							"display": raw[0].data.user.displayName,
							"hex": raw[0].data.user.primaryColorHex,
							"profilePic": raw[0].data.user.profileImageURL,
							"trailer": raw[0].data.user.channel.trailer,
							"isAffiliate": raw[5].data.userByAttribute.roles.isAffiliate,
							"isPartner": raw[3].data.user.isPartner,
							"isMature": raw[6].data.userByAttribute.broadcastSettings.isMature,
						},
						"stream": {
							"UseLive": raw[1].data.user.stream,
							"PlayerTrackingContextQuery": raw[3].data.user.stream,
							"tags": tags
						},
						"hosting": raw[2].data.user.hosting,
						"game": raw[3].data.user.game,
						"thumbnail": {
							"url": pr,
							"restricted": r
						},
						"reccomended": raw[8].data.personalSections,
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