/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comiherbtm/ztm_iherbfreightorders/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
