sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/core/format/FileSizeFormat",
	"sap/ui/Device"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageBox, FileSizeFormat, Device) {
	"use strict";

	return BaseController.extend("com.yaskawa.ETOWorkFlow.controller.Worklist", {

		formatter: formatter,

		onInit: function () {

			this.createInitialModel();
			this._createHeaderDetailsModel();
			this.callDropDownService();
			this._createAttachmentsModel();
			this.popupFlag = true;

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
				typoofApplicationDD: [],
				typoofApplicationKey: "",
				typoofOrderDD: [],
				typoofOrderKey: "",
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

		_createAttachmentsModel: function () {
			var oModel = new JSONModel({
				attachmentSet: [],
				distributionChannelKey: ""

			});
			this.setModel(oModel, "AttachmentsModel");
		},

		callDropDownService: function () {
			this.getModel("objectViewModel").setProperty("/busy", true);
			Promise.allSettled([this.readChecklistEntity("/ETODistributionChannelSet"),
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
			var typoofApplicationDD = values[1].value.results;
			var typoofOrderDD = values[2].value.results;

			this.getModel("HeaderDetailsModel").setSizeLimit(5000);
			this.getModel("HeaderDetailsModel").setProperty("/distributionChannelDD", distributionChannelDD);
			this.getModel("HeaderDetailsModel").setProperty("/typoofApplicationDD", typoofApplicationDD);
			this.getModel("HeaderDetailsModel").setProperty("/typoofOrderDD", typoofOrderDD);

		},

		handleChecklistError: function (reason) {
			//handle errors			
		},

		onSearchSaleOrder: function () {

			var sSaleOrderNo = this.getView().byId("idSaleOrderInput").getValue();

			if (sSaleOrderNo === "") {
				sap.m.MessageBox.error("Please Enter Sales Order Number");

				return false;
			}

			if (this.popupFlag) {
				this.callItemPopupService(sSaleOrderNo);
			}

			this.getView().byId("idSaleOrderInput").setEnabled(false);
			this.getModel("objectViewModel").setProperty("/busy", true);
			var sSaleOrderNoFilter = new sap.ui.model.Filter({
				path: "Vbeln",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sSaleOrderNo
			});
			var sIndicatorFilter = new sap.ui.model.Filter({
				path: "Indicator",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "C"
			});
			var filter = [];
			filter.push(sSaleOrderNoFilter, sIndicatorFilter);
			this.getOwnerComponent().getModel().read("/ETOHeaderDetailSet", {
				filters: [filter],
				success: function (oData, oResponse) {
					if (oData.results[0].Message.length > 0) {
						sap.m.MessageBox.information(oData.results[0].Message);
					}

					// 	this.getModel("objectViewModel").setProperty("/busy", false);
					this.databuilding(oData.results[0]);
					this.getAttachments();
				}.bind(this),
				error: function (oError) {
					this.getModel("objectViewModel").setProperty("/busy", false);

				}.bind(this),
			});
		},
		callItemPopupService: function (sSaleOrderNo) {
			var sVBlenFilter = new sap.ui.model.Filter({
				path: "Vbeln",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sSaleOrderNo
			});
			var filter = [];
			filter.push(sVBlenFilter);
			this.getOwnerComponent().getModel().read("/ETOLineItemSOSet", {
				filters: [filter],
				success: function (oData, oResponse) {

					this.openPopFragment(oData.results);

				}.bind(this),
				error: function (oError) {
					this.getModel("objectViewModel").setProperty("/busy", false);

				}.bind(this),
			});
		},

		openPopFragment: function (response) {

			this.getModel("HeaderDetailsModel").setProperty("/POPItemDataModel", response);
			if (!this._oItemPopupDialog) {
				this._oItemPopupDialog = sap.ui.xmlfragment(
					"com.yaskawa.ETOWorkFlow.view.fragments.ItemPopup", this);
				this.getView().addDependent(this._oItemPopupDialog);
			}
			if (Device.system.desktop) {
				this._oItemPopupDialog.addStyleClass("sapUiSizeCompact");
			}
			this._oItemPopupDialog.open();
		},

		onSelectAllItems: function (oEvent) {
			var bState = oEvent.getSource().getSelected();

			var ItemData = this.getModel("HeaderDetailsModel").getProperty("/POPItemDataModel");
			ItemData.forEach(item => {
				item.Selected = bState;

			});

			this.getModel("HeaderDetailsModel").refresh();
		},
		onPressConfirmPopupItems: function (oEvent) {
			var aItemData = this.getModel("HeaderDetailsModel").getProperty("/POPItemDataModel");
			for (var i = 0; i < aItemData.length; i++) {
				if (!aItemData[i].Selected) {
					aItemData.splice(i, 1);
					i--;
				}
			}

			this.SelectedPOPupItemNo = Array.prototype.map.call(aItemData, function (item) {
				return item.ItemNo;
			}).join(",");
			this._oItemPopupDialog.close();
		},
		onCancelItemPopup: function () {
			this._oItemPopupDialog.close();
		},
		onResetSaleOrder: function () {

			this.getView().byId("idSaleOrderInput").setValue("");
			this.getView().byId("idSaleOrderInput").setEnabled(true);
			this.onInit();

		},

		databuilding: function (data) {
			this.getModel("HeaderDetailsModel").setProperty("/OrderDate", data.OrderDate);
			this.getModel("HeaderDetailsModel").setProperty("/ReqestedBy", data.ReqestedBy);
			this.getModel("HeaderDetailsModel").setProperty("/ShipDate", data.ShipDate);
			this.getModel("HeaderDetailsModel").setProperty("/CustReprsntv", data.CustReprsntv);
			this.getModel("HeaderDetailsModel").setProperty("/CustName", data.CustName);
			this.getModel("HeaderDetailsModel").setProperty("/CustNumber", data.CustNumber);
			this.getModel("HeaderDetailsModel").setProperty("/OrderStatus", data.OrderStatus);
			this.getModel("HeaderDetailsModel").setProperty("/TotalNetValue", data.TotalNetValue);
			this.getModel("HeaderDetailsModel").setProperty("/typoofApplicationKey", data.TypeApp);
			this.getModel("HeaderDetailsModel").setProperty("/typoofOrderKey", data.TypeOrder);
			this.getModel("HeaderDetailsModel").setProperty("/NoSalesOrder", data.NoSalesOrder);
			this.getModel("HeaderDetailsModel").setProperty("/CustPo", data.CustPo);
			this.getModel("HeaderDetailsModel").setProperty("/distributionChannelKey", data.Vtweg);
			this.getModel("HeaderDetailsModel").setProperty("/QuotationNo", data.QuotationNo);
			this.getModel("HeaderDetailsModel").setProperty("/orderStatusSetKey", data.OrderStatus);

		},
		onUploadPress: function (oEvent) {
			this.popupFlag = false;
			var that = this;
			var sSaleOrderNo = this.getView().byId("idSaleOrderInput").getValue();
			if (sSaleOrderNo === "") {
				sap.m.MessageBox.error("Please Enter Sales Order Number!");
				this.byId("__FILEUPLOAD").setValue("");
				return;
			}
			this.getModel("objectViewModel").setProperty("/busy", true);
			var file = this.byId("__FILEUPLOAD").getFocusDomRef().files[0];

			//Input = "458076",
			var Filename = file.name,
				Filetype = file.type,
				Filesize = file.size;

			//code for byte array 
			// 			this._getImageData(URL.createObjectURL(file), function (Filecontent) {
			// 				that._updateDocumentService(Filecontent, Filename, Filetype, Filesize, sSaleOrderNo);
			// 			});

			//code for base64/binary array 
			this._getImageData((file), function (Filecontent) {
				that._updateDocumentService(Filecontent, Filename, Filetype, Filesize, sSaleOrderNo);
			});

		},

		onComplete: function (oEvent) {
			this.MainModel = this.getComponentModel();
			if (oEvent.getParameter("status") === 500 || oEvent.getParameter("status") === 201) {
				this.getModel("objectViewModel").setProperty("/busy", false);
				sap.m.MessageBox.success("The File has been uploaded successfully!");
				this.getView().getModel().refresh();
				// this.onSearchSaleOrder();
				this.getAttachments();
				this.byId("__FILEUPLOAD").setValue("");
				this.MainModel.refresh();
				this.getModel().refresh();

			} else {
				this.getModel("objectViewModel").setProperty("/busy", false);
				sap.m.MessageBox.error("The File  upload failed!");
				this.byId("__FILEUPLOAD").setValue("");
			}

		},

		getAttachments: function ()

		{
			//	this.getModel("objectViewModel").setProperty("/busy", true);
			var sSaleOrderNo = this.getView().byId("idSaleOrderInput").getValue();
			var sSaleOrderFilter = new sap.ui.model.Filter({
				path: "Input",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sSaleOrderNo
			});
			var sItemNoFilter = new sap.ui.model.Filter({
				path: "ItemNr",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "000000"
			});
			var filter = [];
			filter.push(sSaleOrderFilter, sItemNoFilter);
			this.getOwnerComponent().getModel().read("/ETOAttachmentSet", {
				filters: [filter],
				success: function (oData, oResponse) {
					this.getModel("objectViewModel").setProperty("/busy", false);
					this.getModel("AttachmentsModel").setProperty("/attachmentSet", oData.results);
					this.getModel("objectViewModel").setProperty("/busy", false);
				}.bind(this),
				error: function (oError) {
					this.getModel("objectViewModel").setProperty("/busy", false);

				}.bind(this),
			});
		},
		onFileNameLengthExceed: function () {
			MessageBox.error("File name length exceeded, Please upload file with name lenght upto 50 characters.");
		},

		onFileSizeExceed: function () {
			MessageBox.error("File size exceeded, Please upload file with size upto 200KB.");
		},
		onPressDeleteAttchmnt: function (oEvent) {
			var object = oEvent.getSource().getBindingContext("AttachmentsModel").getObject();
			sap.m.MessageBox.warning("Are you sure to delete this attachment?", {
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				styleClass: "messageBoxError",
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						this.deleteServiceCall(object);

					}

				}.bind(this),
			});
		},
		deleteServiceCall: function (object) {
			this.getModel("objectViewModel").setProperty("/busy", true);
			var sSaleOrderNo = this.getView().byId("idSaleOrderInput").getValue();

			var oPayload = {

				"SONumber": sSaleOrderNo,
				"Item": object.ItemNr,
				"Index": object.Index,
				"Message": ""

			};
			this.getOwnerComponent().getModel().create("/DeleteAttachmentSet", oPayload, {

				success: function (oData, oResponse) {

					this.getModel("objectViewModel").setProperty("/busy", false);
					this.onSearchSaleOrder();

					sap.m.MessageBox.success(oData.Message);
				}.bind(this),
				error: function (oError) {

					this.getModel("objectViewModel").setProperty("/busy", false);
					sap.m.MessageBox.error("HTTP Request Failed");

				}.bind(this),
			});
		},

		formatAttribute: function (sValue) {
			if (jQuery.isNumeric(sValue)) {
				return FileSizeFormat.getInstance({
					binaryFilesize: false,
					maxFractionDigits: 1,
					maxIntegerDigits: 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

		onPressSubmit: function () {
			var oView = this.getView();
			var sSaleOrderNo = this.getView().byId("idSaleOrderInput").getValue();
			if (sSaleOrderNo === "") {
				sap.m.MessageBox.error("Please Enter Sales Order Number and press Go!");

				return;
			}

			var ScannedAttachedSelection = oView.byId("idScannedAttached").getSelected();
			var ConfirmationSentAttached = oView.byId("idConfirmationSentAttached").getSelected();
			var SalesOrderConfirmation = oView.byId("idSalesOrderConfirmation").getSelected();
			if (!ScannedAttachedSelection && !ConfirmationSentAttached && !SalesOrderConfirmation) {
				sap.m.MessageBox.error("Please check atleast one item from check list");
				return;
			}

			var sTypeofOrder = this.getView().byId("idTypeOfOrder").getSelectedKey();
			var sTypeofApplication = this.getView().byId("idTypeOfApp").getSelectedKey();

			if (sTypeofOrder === "") {
				sap.m.MessageBox.error("Please Select Type of Order");

				return;
			}
			if (sTypeofApplication === "") {
				sap.m.MessageBox.error("Please Select Type of Application");

				return;
			}
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
				"TypeApp": oSalesData.typoofApplicationKey,
				"TypeOrder": oSalesData.typoofOrderKey,
				"NoSalesOrder": oSalesData.NoSalesOrder,
				"Notes": oSalesData.Notes,
				"Indicator": "",
				"Items": this.SelectedPOPupItemNo
			};

			this.getOwnerComponent().getModel().create("/ETOHeaderDetailSet", oPayload, {
				success: function (oData, oResponse) {
					this.getModel("objectViewModel").setProperty("/busy", false);
					this._createHeaderDetailsModel();

					sap.m.MessageBox.success(oData.Message);

				}.bind(this),
				error: function (oError) {
					this.getModel("objectViewModel").setProperty("/busy", false);
					// 	sap.m.MessageBox.error("Something went Wrong!");
				}.bind(this),
			});
		},

		// file  Bytearray conversion code

		_getImageData1: function (url, callback, fileName) {
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
				};
			};
			xhr.open('GET', url);
			xhr.responseType = 'blob';
			xhr.send();
		},

		// file base64/binary conversion code

		_getImageData: function (url, callback) {

			var reader = new FileReader();

			reader.onloadend = function (evt) {
				if (evt.target.readyState === FileReader.DONE) {

					var binaryString = evt.target.result,
						base64file = btoa(binaryString);

					callback(base64file);
				}
			};
			reader.readAsBinaryString(url);

		},
		// file base64 conversion code
		base64coonversionMethod: function (Filecontent) {

			// 			if (!FileReader.prototype.readAsBinaryString) {
			// 				FileReader.prototype.readAsBinaryString = function (Filecontent) {
			// 					var binary = "";
			// 					var reader = new FileReader();
			// 					reader.onload = function (e) {
			// 						var bytes = new Uint8Array(reader.result);
			// 						var length = bytes.byteLength;
			// 						for (var i = 0; i < length; i++) {
			// 							binary += String.fromCharCode(bytes[i]);
			// 						}
			// 						that.base64ConversionRes = btoa(binary);

			// 					};
			// 					reader.readAsArrayBuffer(Filecontent);
			// 				};
			// 			}
			var that = this;
			var reader = new FileReader();
			reader.onload = function (readerEvt) {
				var binaryString = readerEvt.target.result;
				that.base64ConversionRes = btoa(binaryString);

			};
			reader.readAsBinaryString(Filecontent);

			return that.base64ConversionRes;
		},

		_updateDocumentService: function (Filecontent, Filename, Filetype, Filesize, Input) {
			this.getModel("objectViewModel").setProperty("/busy", true);
			var oFileUploader = this.byId("__FILEUPLOAD");
			Filecontent = null;
			oFileUploader.removeAllHeaderParameters();
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: Filecontent + "|" + Input + "|" + Filename + "|" + Filetype + "|" + Filesize

			}));
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: this.getModel().getSecurityToken()
			}));
			var sUrl = this.getModel().sServiceUrl + "/ETOAttachmentSet";
			oFileUploader.setUploadUrl(sUrl);
			oFileUploader.setSendXHR(true);
			oFileUploader.setUseMultipart(true);
			oFileUploader.upload();
		},

		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
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

		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("PONumber")
			});
		},

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

		onBack: function () {
			this.handleNav("Tiles");
		},
		onBackList: function () {
			this.handleNav("Tiles");
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
		onAttachmentsPess: function () {
			this._getAddAttachments().open();
		},
		_getAddAttachments: function () {
			var _self = this;
			if (!_self._oDialogSelection2) {
				_self._oDialogSelection2 = sap.ui.xmlfragment("com.yaskawa.ETOWorkFlow.view.fragments.AddAttachments", _self);
				_self.getView().addDependent(_self._oDialogSelection2);
			}
			return _self._oDialogSelection2;
		},
		onCloseAddAttachDialog: function () {
			this._getAddAttachments().close();
		},

		// File upload event handelers //		
		onChange: function (oEvent) {
			var _ofileUpload = sap.ui.getCore().byId("idFileUploadCollection");
			var _oFileUploderLength = _ofileUpload.getItems().length;
			// 			this.fileContent = oEvent.getParameters().files[0];
			this.fileContent = null;
			this.vbeln = this.getView().byId("idSaleOrderInput").getValue();
			this.fileName = oEvent.getParameters().files[0].name;
			this.fileType = oEvent.getParameters().files[0].type;
			this.fileSize = oEvent.getParameters().files[0].size;

			if (_oFileUploderLength > 9) {
				sap.m.MessageBox.alert(
					"You can not upload more than 10 files. ", {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {
							if (oAction === "OK") {}
						}

					});

				jQuery.sap.delayedCall(0, this, function () {

					_ofileUpload.removeItem(_ofileUpload.getItems()[0]);

				});
			} else {
				var oModel = this.getOwnerComponent().getModel();
				var oUploadCollection = oEvent.getSource();
				var sectoken = oModel.getSecurityToken();
				var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
					name: "x-csrf-token",
					value: sectoken
				});
				oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			}

		},
		// 		onTypeMissmatch: function (oEvent) {
		// 			var _oFileTypeExt = oEvent.getParameters().files[0].fileType;
		// 			sap.m.MessageBox.alert(
		// 				"You can not upload " + _oFileTypeExt + " file type", {
		// 					actions: [sap.m.MessageBox.Action.OK],
		// 					onClose: function (oAction) {
		// 						if (oAction === "OK") {}
		// 					}

		// 				});

		// 			//sap.m.MessageToast.show("You can not upload " + _oFileTypeExt + " file type");
		// 		},
		// 		onFileSizeExceed: function (oEvent) {
		// 			var oUploadCollection = this.getView().byId("idFileUploadCollection");
		// 			var fileSize = oEvent.getParameter("fileSize"),
		// 				fileName = oEvent.getParameter("fileName");
		// 			/*sap.m.MessageToast.show("The chosen file '" + fileName + "' is " + fileSize + " MB big, this exceeds the maximum filesize of " +
		// 				oUploadCollection.getMaximumFileSize() + " MB.");*/
		// 			sap.m.MessageBox.alert(
		// 				"The chosen file '" + fileName + "' is " + fileSize + " MB big, this exceeds the maximum filesize of " +
		// 				oUploadCollection.getMaximumFileSize() + " MB.", {
		// 					actions: [sap.m.MessageBox.Action.OK],
		// 					onClose: function (oAction) {
		// 						if (oAction === "OK") {}
		// 					}

		// 				});

		// 		},

		onStartUpload: function (oEvent) {
			var oUploadCollection = sap.ui.getCore().byId("idFileUploadCollection");
			var cFiles = oUploadCollection.getItems().length;
			this._allItems = oUploadCollection.getItems();
			this._responseReceivedCnt = 0;
			if (cFiles > 10) {
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.error("Maximum file count per interaction is 10");
			} else {
				var uploadInfo = "";
				oUploadCollection.upload();
				uploadInfo = cFiles + " file(s)";
			}
		},

		onFilenameLengthExceed: function (oEvent) {
			/*	var fileNameLengthExceedErrorMsg = this.getView().getModel("i18n").getResourceBundle().getText("fileNameLengthExceedErrorMsg");

				sap.m.MessageToast.show(fileNameLengthExceedErrorMsg);*/

			sap.m.MessageBox.alert(
				"File name can't be exceed 55 characters.", {
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (oAction) {
						if (oAction === "OK") {}
					}

				});
		},

		onBeforeUploadStarts: function (oEvent) {
			var _self = this;
			var fileContent = "";
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				// value: oEvent.getParameter("fileName") + "|" + _self._oMessageId
				value: this.fileContent + "|" + this.vbeln + "|" + this.fileName + "|" + this.fileType + "|" + this.fileSize
					// value: "" + "|" + this.vbeln + "|" + this.fileName + "|" + this.fileType + "|" + this.fileSize
			});

			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			setTimeout(function () {}, 40000);
		},
		onUploadComplete: function (oEvent) {
			var _that = this;
			var oUploadCollection;
			oUploadCollection = sap.ui.getCore().byId("idFileUploadCollection");
			var sUploadedFileName = "";
			var uploadError = "";
			var _responseReceivedlen = "";
			for (var j = 0; j < oEvent.getParameter("files").length; j++) {
				sUploadedFileName = oEvent.getParameter("files")[j].fileName;
				for (var i = 0; i < this._allItems.length; i++) {
					if (this._allItems[i].getFileName() === sUploadedFileName) {
						_responseReceivedlen = oEvent.getParameter("files").length;
						this._responseReceivedCnt = 0 + this._responseReceivedCnt + _responseReceivedlen;
						if (oEvent.getParameter("files")[j].status === 201) {
							oUploadCollection.removeItem(this._allItems[i]);
							_that.getView().byId("idAttachmentsTable").getModel("AttachmentsModel").refresh();
						} else {
							// 			var responceFile = oEvent.getParameter("files")[j].reponse;
							// 			var slpliteString = responceFile.split("/");
							// 			uploadError = slpliteString[1].slice(3);
							// 			this._uploadErrorOccured = true;
							// 			sap.m.MessageBox.show(uploadError, sap.m.MessageBox.Icon.ERROR);
							sap.ui.core.BusyIndicator.hide();
							break;
						}
					}

				}

			}

			if (this._responseReceivedCnt === this._allItems.length) {
				var _self = this;
			}

		},
		// End of File upload event handelers //	

	});
});