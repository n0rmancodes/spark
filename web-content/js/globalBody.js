function endLoad() {
	if (document.getElementById("loader")) {
		document.getElementById("loader").style.display = "none";
	}
	if (document.getElementById("loaderSfx")) {
		if (document.getElementById("loaderSfx").currentTime < 0.45) {
			document.getElementById("loaderSfx").pause()
		} else {
			document.getElementById("loaderSfx").loop = false;
		}
	}
	if (document.getElementById("main")) {
		document.getElementById("main").style.display = "";
	}
}