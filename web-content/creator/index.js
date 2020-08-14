load();

function load() {
	var xhr = new XMLHttpRequest();
	var name = window.location.href.split("?")[1]
	xhr.open("GET", "/api/channel/" + name);
	xhr.send();
	xhr.onload = function() {
		endLoad();
	}
}