sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], (Controller, MessageBox, MessageToast, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("com.iherb.tm.ztmiherbfreightorders.controller.FOtable", {
        onInit() {
            var oFreightOrderTable = this.getView().byId("SmartTable").getTable();
            this._oFOModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(this._oFOModel, "FOTableModel");
            this.getView().getModel("FOTableModel").setSizeLimit(500);
            this.onReadOdata();
        },
        onReadOdata: function () {
            var that = this;
            sap.ui.core.BusyIndicator.show();
            var oModel = this.getView().getModel("FOTableModel");
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.read("/ZC_FoTorRoot", {
                urlParameters: {
                    "$top": 500
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oData.results) {
                        oData.results.forEach(item => {
                            if (item.PickupDt) {
                                let utcDate = new Date(item.PickupDt);
                                // Convert UTC to CST in 24-hour format
                                let cstDate = utcDate.toLocaleString("en-US", {
                                    timeZone: "America/Chicago",
                                    hour12: false,
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                }).replace(",", "");
                                item.PickupDtCST = cstDate;
                            }
                        });
                    }
                    if (oData.results) {
                        oData.results.forEach(item => {
                            if (item.DeliveryDt) {
                                let utcDate = new Date(item.DeliveryDt);
                                // Convert UTC to PST in 24-hour format
                                let pstDate = utcDate.toLocaleString("en-US", {
                                    timeZone: "America/Los_Angeles",
                                    hour12: false,
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                }).replace(",", "");
                                item.DeliveryDtPST = pstDate;
                            }
                        });
                    }
                    this._oFOModel.setData(oData);
                    console.log("FO OData loaded/Response:", oData);
                    oModel.setSizeLimit(oData.results.length);
                    that._oFOModel.setData({ FreightOrders: oData.results });
                }.bind(this),
                error: function (oerror) {
                    sap.ui.core.BusyIndicator.hide();
                    console.log("FO data not loaded", oerror);
                }.bind(this),
            });
        },

        // formatUTCToCST: function (sDateUTC) {
        //     if (!sDateUTC) return "";

        //     try {
        //         // Create Date object from UTC string
        //         const utcDate = new Date(sDateUTC); // example: "2024-04-08T10:00:00Z"

        //         // Calculate CST offset (UTC-6), or CDT (UTC-5 for daylight saving)
        //         // CST offset is -6 hours
        //         const cstOffset = -6 * 60; // in minutes

        //         // Convert UTC time to CST
        //         const localTimestamp = utcDate.getTime() + cstOffset * 60 * 1000;
        //         const cstDate = new Date(localTimestamp);

        //         // Format it to SAPUI5 date string
        //         const oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
        //             pattern: "yyyy/MM/dd HH:mm:ss",
        //             UTC: false
        //         });

        //         return oDateFormat.format(cstDate);
        //     } catch (e) {
        //         console.error("Date formatting error:", e);
        //         return sDateUTC;
        //     }
        // },

        convertUTCtoCST: function (utcDate) {
            debugger;
            if (!utcDate) return "";
            try {
                // Step 1: Make sure it's a valid Date object
                if (typeof utcDate === "string") {
                    utcDate = new Date(utcDate); // parse from string
                }

                if (!utcDate || isNaN(utcDate.getTime())) {
                    console.error("Invalid UTC date:", utcDate);
                    return null;
                }

                // Step 2: Manually subtract 6 hours to convert from UTC to CST (UTC -5)
                var cstOffsetMillis = 5 * 60 * 60 * 1000;
                var cstDate = new Date(utcDate.getTime() - cstOffsetMillis);

                // Step 3: Log or return the new CST date
                var oFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "yyyy/MM/dd HH:mm:ss"
                });

                var sFormattedCST = oFormatter.format(cstDate);
                return sFormattedCST;
            } catch (e) {
                console.error("Date formatting error:", e);
                return utcDate;
            }
        },

        formatUTCToPST: function (sDateUTC) {
            if (!sDateUTC) return "";

            try {
                // Create Date object from UTC string
                const utcDate = new Date(sDateUTC); // e.g., "2024-04-08T10:00:00Z"

                // Convert UTC to PST using Intl.DateTimeFormat with timeZone
                const pstFormatted = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'America/Los_Angeles',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).format(utcDate);

                return pstFormatted; // output: "04/07/2024, 02:00:00"
            } catch (e) {
                console.error("Date conversion error:", e);
                return sDateUTC;
            }
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
        statusFormatter: function (value) {
            var statusMap = {
                "01": "Not Relevant",
                "02": "Not Started",
                "03": "In Execution",
                "04": "Executed",
                "05": "Interrupted",
                "06": "Canceled",
                "07": "Ready for Transportation Execution"
            };
            return statusMap[value] || "Unknown";
        },
        iconFormatter: function (value) {
            var iconMap = {
                "01": "sap-icon://status-in-process",
                "02": "sap-icon://pending",
                "03": "sap-icon://activity-items",
                "04": "sap-icon://accept",
                "05": "sap-icon://error",
                "06": "sap-icon://decline",
                "07": "sap-icon://complete"
            };
            return iconMap[value] || "sap-icon://question-mark";
        },
        stateFormatter: function (value) {
            var stateMap = {
                "01": "None",
                "02": "Warning",
                "03": "Information",
                "04": "Success",
                "05": "Error",
                "06": "Error",
                "07": "Success"
            };
            return stateMap[value] || "None";
        },
        onFilterSelect: function (oEvent) {
            debugger
            var sKey = oEvent.getParameter("key");
            var oSmartTable = this.byId("SmartTable").getTable();
            var oBinding = oSmartTable.getBinding("rows"),
                aFilter = [];
            oBinding.filter([]);

            if (sKey === "Editable") {
                aFilter.push(new Filter("ReadOnly", "EQ", "X"));
            } else if (sKey === "non-Editable") {
                aFilter.push(new Filter("ReadOnly", "EQ", ""));
            }
            oBinding.filter(aFilter);
        },

        // ******************************
    });
});