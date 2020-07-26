load();

function load() {
	var xhr = new XMLHttpRequest();
	var g = decodeURI(window.location.href.split("?game=")[1]);
	xhr.open("GET", "/api/game/?game=" + g);
	xhr.send();
	xhr.onload = function () {
		document.getElementById("loaderSfx").loop = false;
		document.getElementById("loader").style.display = "none";
		var json = JSON.parse(xhr.responseText);
		if (json.err) {
			if (json.err == "noGameFound") {
				var errText = "There was no game on Twitch with that name!";
			} else if (json.err) {
				var errText = json.err
			}
			document.getElementById("errTxt").innerHTML = errText;
			document.getElementById("err").style.display = "";
		} else {
			document.getElementById("cover").style = "background: url('" + json.gameInfo.avatarURL + "');";
			document.getElementById("main").style.display = "";
			document.getElementById("gameTitle").innerHTML = json.gameInfo.name;
			document.title = json.gameInfo.name + " | Spark";
			document.getElementById("gameViews").innerHTML = json.gameInfo.viewersCount.toLocaleString();
			document.getElementById("gameFollow").innerHTML = json.gameInfo.followersCount.toLocaleString();
			for (var c in json.streams) {
				var link = document.createElement("A");
				link.href = "/creator/?" + json.streams[c].node.broadcaster.displayName;
				var div = document.createElement("DIV");
				div.style = "background: url('/api/proxy/?url=" + btoa(json.streams[c].node.previewImageURL) + "');";
				var mainDiv = document.createElement("DIV");
				var h3 = document.createElement("H3");
				h3.innerHTML = json.streams[c].node.title;
				mainDiv.appendChild(h3);
				var stream = document.createElement("H4");
				var stream_ico = document.createElement("SPAN");
				stream_ico.classList.add("material-icons");
				stream_ico.innerHTML = "person"
				stream.appendChild(stream_ico)
				stream.innerHTML = stream.innerHTML + " " + json.streams[c].node.broadcaster.displayName;
				mainDiv.appendChild(stream);
				div.appendChild(mainDiv);
				link.appendChild(div);
				document.getElementById("streamFeed").appendChild(link);
			}
		}
	}
}