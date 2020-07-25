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
			link.href = "/game/" + json[c].node.name;
			var div = document.createElement("DIV");
			div.classList.add("game");
			div.style = "background: url('" + json[c].node.avatarURL + "');";
			link.appendChild(div);
			document.getElementById("feed").appendChild(link);
		}
	}
}