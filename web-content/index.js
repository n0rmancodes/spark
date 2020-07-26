loadGames();

function loadGames() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/games/");
	xhr.send();
	xhr.onload = function () {
		document.getElementById("loaderSfx").loop = false;
		document.getElementById("loader").style.display = "none";
		var json = JSON.parse(xhr.responseText);
		for (var c in json) {
			var link = document.createElement("A");
			link.href = "/game/?game=" + encodeURIComponent(json[c].node.name);
			var div = document.createElement("DIV");
			div.classList.add("game");
			div.style = "background: url('/api/proxy/?url=" + btoa(json[c].node.avatarURL) + "');";
			var mDiv = document.createElement("DIV");
			var h3 = document.createElement("H3");
			h3.innerHTML = json[c].node.displayName;
			mDiv.appendChild(h3);
			var v = document.createElement("P");
			var vi = document.createElement("SPAN");
			vi.classList.add("material-icons");
			vi.innerHTML = "visibility";
			v.appendChild(vi);
			v.innerHTML = v.innerHTML + " " + json[c].node.viewersCount.toLocaleString() + " views";
			mDiv.appendChild(v);
			div.appendChild(mDiv)
			link.appendChild(div);
			document.getElementById("feed").appendChild(link);
		}
		document.getElementById("main").style.display = "";
	}
}