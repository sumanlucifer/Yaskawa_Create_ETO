sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.yaskawa.ETOWorkFlow.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {

			this.createInitialModel();
			this._createHeaderDetailsModel();
			this.callDropDownService();

		},

		createInitialModel: function () {
			var oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "objectViewModel");
		},
		_createHeaderDetailsModel: function () {
			var oModel = new JSONModel({
				distributionChannelDD: [],
				distributionChannelKey: "",
				orderTypeSetDD: [],
				orderTypeSetKey: "",
				typoofApplicationDD: [],
				typoofApplicationKey: "02",
				typoofOrderDD: [],
				typoofOrderKey: "01",
				ReqestedBy: "",
				QuotationNo: "",
				OrderDate: null,
				ShipDate: null,
				CustReprsntv: null,
				CustName: null,
				CustNumber: null,
				OrderStatus: null,
				OrderType: null,
				TypeApp: null,
				TypeOrder: null,
				TotalNetValue: null,
				NoSalesOrder: null,
				CustPo: null

			});
			this.setModel(oModel, "HeaderDetailsModel");
		},

		callDropDownService: function () {
			this.getModel("objectViewModel").setProperty("/busy", true);
			Promise.allSettled([this.readChecklistEntity("/ETODistributionChannelSet"),
				this.readChecklistEntity("/ETOOrderTypeSet"),
				this.readChecklistEntity("/ETOTypeOfApplSet"),
				this.readChecklistEntity("/ETOTypeOfOrderSet"),
				this.readChecklistEntity("/ETOOrderStatusSet")
			]).then(this.buildChecklist.bind(this)).catch(function (error) {}.bind(this));

		},

		readChecklistEntity: function (path) {

			return new Promise(
				function (resolve, reject) {
					this.getOwnerComponent().getModel().read(path, {
						success: function (oData) {
							resolve(oData);

						},
						error: function (oResult) {
							reject(oResult);

						}
					});
				}.bind(this));
		},

		buildChecklist: function (values) {
			this.getModel("objectViewModel").setProperty("/busy", false);
			var distributionChannelDD = values[0].value.results;
			var orderTypeSetDD = values[1].value.results;
			var typoofApplicationDD = values[2].value.results;
			var typoofOrderDD = values[3].value.results;
			var orderStatusSetDD = values[4].value.results;
			this.getModel("HeaderDetailsModel").setSizeLimit(5000);
			this.getModel("HeaderDetailsModel").setProperty("/distributionChannelDD", distributionChannelDD);
			this.getModel("HeaderDetailsModel").setProperty("/orderTypeSetDD", orderTypeSetDD);
			this.getModel("HeaderDetailsModel").setProperty("/typoofApplicationDD", typoofApplicationDD);
			this.getModel("HeaderDetailsModel").setProperty("/typoofOrderDD", typoofOrderDD);
			this.getModel("HeaderDetailsModel").setProperty("/orderStatusSetDD", orderStatusSetDD);

		},

		handleChecklistError: function (reason) {
			//handle errors			
		},

		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		onSearchSaleOrder: function () {
			this.getModel("objectViewModel").setProperty("/busy", true);
			var sSaleOrderNo = this.getView().byId("idSaleOrderInput").getValue();

			var sSaleOrderNoFilter = new sap.ui.model.Filter({
				path: "Vbeln",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sSaleOrderNo
			});
			var filter = [];
			filter.push(sSaleOrderNoFilter);
			this.getOwnerComponent().getModel().read("/ETOHeaderDetailSet", {
				filters: [filter],
				success: function (oData, oResponse) {
					this.getModel("objectViewModel").setProperty("/busy", false);
					this.databuilding(oData.results[0]);
				}.bind(this),
				error: function (oError) {
					this.getModel("objectViewModel").setProperty("/busy", false);
					var oMessage = JSON.parse(oError.responseText).error.message.value;

				}.bind(this),
			});
		},

		databuilding: function (data) {
			this.getModel("HeaderDetailsModel").setProperty("/OrderDate", data.OrderDate);
			this.getModel("HeaderDetailsModel").setProperty("/ShipDate", data.ShipDate);
			this.getModel("HeaderDetailsModel").setProperty("/CustReprsntv", data.CustReprsntv);
			this.getModel("HeaderDetailsModel").setProperty("/CustName", data.CustName);
			this.getModel("HeaderDetailsModel").setProperty("/CustNumber", data.CustNumber);
			this.getModel("HeaderDetailsModel").setProperty("/OrderStatus", data.OrderStatus);
			this.getModel("HeaderDetailsModel").setProperty("/TotalNetValue", data.TotalNetValue);
			this.getModel("HeaderDetailsModel").setProperty("/TypeApp", data.TypeApp);
			this.getModel("HeaderDetailsModel").setProperty("/TypeOrder", data.TypeOrder);
			this.getModel("HeaderDetailsModel").setProperty("/NoSalesOrder", data.NoSalesOrder);
			this.getModel("HeaderDetailsModel").setProperty("/CustPo", data.CustPo);

		},
		onPressSubmit: function () {
			this.getModel("objectViewModel").setProperty("/busy", true);
			var oSalesData = this.getModel("HeaderDetailsModel").getData();
			var oPayload = {

				"Vbeln": oSalesData.Vbeln,
				"ReqStatus": oSalesData.ReqStatus,
				"ReqestedBy": oSalesData.ReqestedBy,
				"OrderDate": oSalesData.OrderDate,
				"ShipDate": oSalesData.ShipDate,
				"CustReprsntv": oSalesData.CustReprsntv,
				"CustName": oSalesData.CustName,
				"CustNumber": oSalesData.CustNumber,
				"CustPo": oSalesData.CustPo,
				"Vtweg": oSalesData.distributionChannelKey,
				"QuotationNo": oSalesData.QuotationNo,
				"TotalNetValue": oSalesData.TotalNetValue,
				"OrderStatus": oSalesData.orderStatusSetKey,
				"OrderType": oSalesData.orderTypeSetKey,
				"TypeApp": oSalesData.typoofApplicationKey,
				"TypeOrder": oSalesData.typoofOrderKey,
				"NoSalesOrder": oSalesData.NoSalesOrder,
				"Notes": oSalesData.Notes
			};

			this.getOwnerComponent().getModel().create("/ETOHeaderDetailSet", oPayload, {
				success: function (oData, oResponse) {
					this.getModel("objectViewModel").setProperty("/busy", false);
					this._createHeaderDetailsModel();

					sap.m.MessageBox.success("The Sale order has been succesfully created!");

				}.bind(this),
				error: function (oError) {
					this.getModel("objectViewModel").setProperty("/busy", false);
					// 	sap.m.MessageBox.error("Something went Wrong!");
				}.bind(this),
			});
		},

		onAttachmentChange: function (oEvent) {
			// keep a reference of the uploaded file

			var oFiles = oEvent.getParameters().files;
			var that = this;
			this.oFiles = oFiles;
			var fileName = oFiles[0].name;

			var fileType = oFiles[0].type;

			fileType = fileType === "application/pdf" ? "application/pdf" : "application/octet-stream";

			var fileSize = oFiles[0].size;
			for (var i = 0; i < oFiles.length; i++) {
				var fileName = oFiles[i].name;
				var fileSize = oFiles[i].size;
				this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
					// 	that._addData(base64, fileName, fileType, fileSize, rowObj, oFiles);
					that.Content = btoa(encodeURI(base64));

				}, fileName);
			}
		},
		_getImageData: function (url, callback, fileName) {
			var xhr = new XMLHttpRequest();
			xhr.onload = function () {
				var reader = new FileReader();
				var fileByteArray = [];
				reader.readAsArrayBuffer(xhr.response);
				reader.onloadend = function (evt) {
					if (evt.target.readyState == FileReader.DONE) {
						var arrayBuffer = evt.target.result,
							array = new Int8Array(arrayBuffer);
						for (var i = 0; i < array.length; i++) {
							fileByteArray.push(array[i]);
						}
						callback(fileByteArray);
					}
				}
			};
			xhr.open('GET', url);
			xhr.responseType = 'blob';
			xhr.send();
		},

		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {

				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("CompanyCode", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("PONumber")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		onCparCreate: function () {
			this.handleNav("CREATE");
		},
		handleNav: function (target) {
			// this._oTPC.destroy();
			var navCon = this.getView().byId("NavCon");
			if (target) {
				var animation = "show";
				navCon.to(this.getView().byId(target), animation);
			} else {
				navCon.back();
			}
		},
		onCparDisplay: function () {
			this.handleNav("LIST");
		},
		onBack: function () {
			this.handleNav("Tiles");
		},
		onBackList: function () {
			this.handleNav("Tiles");
		},
		onTypeofOredrSelect: function (oEvent) {
			var oView = this.getView();
			if (oEvent.getSource().getSelected()) {
				oView.byId("Approve").setVisible(true);
				oView.byId("Reject").setVisible(true);
			} else {
				oView.byId("Approve").setVisible(false);
				oView.byId("Reject").setVisible(false);
			}
		},
		itemTableSelectionChange: function (oEvent) {
			var selectedRowIndex = oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
			// var oItem = oEvent.getSource();
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var selItemNumber = this.getView().getModel("orderlineitemmodelName").getData().results[selectedRowIndex].sono;
			this.getRouter().navTo("object", {
				objectId: selItemNumber
			});
		},
		_getReassignSectionDialog: function () {
			var _self = this;
			if (!_self._oDialogReassignSection) {
				_self._oDialogReassignSection = sap.ui.xmlfragment("com.yaskawa.ETOWorkFlow.fragments.ReassignSection",
					_self);
				_self.getView().addDependent(_self._oDialogReassignSection);
			}
			return this._oDialogReassignSection;
		},
		onReassignButtonPress: function () {
			this._getReassignSectionDialog().open();
		},
		onAttachmentOk: function () {
			this._getReassignSectionDialog().close();
		},
		onAttachmentCancel: function () {
			this._getReassignSectionDialog().close();
		},
		_getDownloadOptionSelectDialog: function () {
			var _self = this;
			if (!_self._oDownloadOptionSelect) {
				_self._oDownloadOptionSelect = sap.ui.xmlfragment("com.yaskawa.ETOWorkFlow.fragments.DownloadOptionSelect",
					_self);
				_self.getView().addDependent(_self._oDownloadOptionSelect);
			}
			return this._oDownloadOptionSelect;
		},
		onDataExport: function () {
			this._getDownloadOptionSelectDialog().open();
		},
		onDownloadExcelSelected: function () {
			this._getDownloadOptionSelectDialog().close();
		},
		onDownloadWinshuttleSelected: function () {
			this._getDownloadOptionSelectDialog().close();
		}

	});
});