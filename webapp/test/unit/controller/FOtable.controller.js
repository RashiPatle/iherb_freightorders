/*global QUnit*/

sap.ui.define([
	"comiherbtm/ztm_iherbfreightorders/controller/FOtable.controller"
], function (Controller) {
	"use strict";

	QUnit.module("FOtable Controller");

	QUnit.test("I should test the FOtable controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
