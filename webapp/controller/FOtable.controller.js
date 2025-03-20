sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("com.iherb.tm.ztmiherbfreightorders.controller.FOtable", {
        onInit() {
            var oFreightOrderTable = this.getView().byId("SmartTable").getTable();
            this._oFOModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(this._oFOModel, "FOTableModel");
            this.onReadOdata();
        },
        onReadOdata: function () {
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.read("/ZC_FoTorRoot", {
                success: function (oData) {
                    this._oFOModel.setData(oData);
                    console.log("FO OData loaded/Response:", oData);
                    // Store the fetched data in FOTableModel
                    that._oFOModel.setData({ FreightOrders: oData.results });
                }.bind(this),
                error: function (oerror) {
                    console.log("FO data not loaded", oerror);
                }.bind(this),
            });
        },
        onSavePress: function (oEvent) {
            var i;
            var oUpdateModel = this.getView().getModel();
            var gettingInternalTable = this.byId("SmartTable").getTable();
            var gettingAllRows = gettingInternalTable.getBinding().aKeys;
            var oSelIndices = gettingInternalTable.getSelectedIndices();
            if (oSelIndices.length === 0) {
                MessageBox.error("Please Select the Rows");
            } else {
                for (i = 0; i < oSelIndices.length; i++) {
                    var oFreightOrder = this.getView().getModel().getObject("/" + gettingAllRows[oSelIndices[i]]);
                    var sFO = oFreightOrder.DbKey;
                    var sFOPayload = {
                        "DbKey": sFO,
                        "TorId": oFreightOrder.TorId,
                        "TrackingNo": oFreightOrder.TrackingNo,
                        "Instruction": oFreightOrder.Instruction
                    };
                    var path = "/" + gettingAllRows[oSelIndices[i]];
                    oUpdateModel.update(path, sFOPayload, {
                        success: function (oData, response) {
                            MessageToast.show("Freight Order " + oFreightOrder.TorId + " Updated successfully");
                        },
                        error: function (oError) {
                            MessageToast.show("Freight Order " + oFreightOrder.TorId + " Update request failed");
                        }
                    });
                }
            }
        },
        onRefresh: function () {
            this.byId("SmartTable").rebindTable();
        },

        // ******************************
    });
});