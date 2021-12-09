sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, MessageBox) {
	"use strict";

	return BaseController.extend("com.yaskawa.ETOWorkFlow.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getView().byId("idZbStdPoNonStock2").setValue(sObjectId);
			var itemData = {
				results: [{
					"itemNo": "10",
					"matNo": "NB15842427A",
					"panel": "Z1D",
					"itemNotes": "z1D1B011PNG(2R) Schematic start NB15676557-21 Layout NB15676557A"
				}]
			};
			var itemModel = new JSONModel(itemData);
			this.setModel(itemModel, "itemModelName");

			var newItemToAdd = {
				results: [{
					"itemNo": "",
					"matNo": "",
					"panel": "",
					"itemNotes": ""
				}]
			};
			var newItemModel = new JSONModel(newItemToAdd);
			this.setModel(newItemModel, "newItemModelName");

			var hpsTableData = {
				results: [{
					"lineNo": "10",
					"field": "NB15842427A",
					"dataType": "Z1D",
					"example": "z1D1B011PNG(2R) Schematic start NB15676557-21 Layout NB15676557A"
				}, {
					"lineNo": "10",
					"field": "NB15842427A",
					"dataType": "Z1D",
					"example": "z1D1B011PNG(2R) Schematic start NB15676557-21 Layout NB15676557A"
				}, {
					"lineNo": "10",
					"field": "NB15842427A",
					"dataType": "Z1D",
					"example": "z1D1B011PNG(2R) Schematic start NB15676557-21 Layout NB15676557A"
				}, {
					"lineNo": "10",
					"field": "NB15842427A",
					"dataType": "Z1D",
					"example": "z1D1B011PNG(2R) Schematic start NB15676557-21 Layout NB15676557A"
				}, {
					"lineNo": "10",
					"field": "NB15842427A",
					"dataType": "Z1D",
					"example": "z1D1B011PNG(2R) Schematic start NB15676557-21 Layout NB15676557A"
				}, {
					"lineNo": "10",
					"field": "NB15842427A",
					"dataType": "Z1D",
					"example": "z1D1B011PNG(2R) Schematic start NB15676557-21 Layout NB15676557A"
				}, {
					"lineNo": "10",
					"field": "NB15842427A",
					"dataType": "Z1D",
					"example": "z1D1B011PNG(2R) Schematic start NB15676557-21 Layout NB15676557A"
				}]
			};
			var hpsTableDataModel = new JSONModel(hpsTableData);
			this.setModel(hpsTableDataModel, "hpsTableDataModelName");

			// this.getView().byId("idClarifyOrder").setVisible(false);
			// this.getView().byId("idItemsTable2").setVisible(false);
			//         this.getView().byId("idRequoteOrder").setVisible(false);
			//         this.getView().byId("idClarifyButton").setVisible(false);
			//         this.getView().byId("idRequoteButton").setVisible(false);
			//         this.getView().byId("idcreatefgmat").setVisible(false);
			//         this.getView().byId("idOrdStatus").setVisible(true);
			//         this.getView().byId("idAccAGnmnt22").setVisible(true);

			// this.getModel().metadataLoaded().then( function() {
			// 	var sObjectPath = this.getModel().createKey("POHeaderSet", {
			// 		PONumber :  sObjectId
			// 	});
			// 	this._bindView("/" + sObjectPath);
			// }.bind(this));

			var logDetailsData = {
				results: [{
					"changedBy": "G. Reichelt",
					"Date": "21.05.2021",
					"Time": "10:00 a.m",
					"Actionperfomed": "Created",
					"fileName": "xyz.pdf",
					"comments": "This has been approved"
				}, {
					"changedBy": "M. Koehler",
					"Date": "22.05.2021",
					"Time": "11:00 a.m",
					"Actionperfomed": "Requote Pending",
					"fileName": "xyz1.pdf",
					"comments": "Please Requote"
				}, {
					"changedBy": "C. Cerfus",
					"Date": "23.05.2021",
					"Time": "11:30 a.m",
					"Actionperfomed": "Requote Pending",
					"fileName": "xyz2.pdf",
					"comments": "Please clarify"
				}, {
					"changedBy": "M. Sevilla",
					"Date": "24.05.2021",
					"Time": "12:00 a.m",
					"Actionperfomed": "Scheduling",
					"fileName": "xyz3.xls",
					"comments": "Scheduling Completed."
				}, {
					"changedBy": "J. Midday",
					"Date": "25.05.2021",
					"Time": "12:30 p.m",
					"Actionperfomed": "ENG Complete",
					"fileName": "xyz.xls",
					"comments": "Completed"
				}]
			};
			var ilogTableModel = new JSONModel(logDetailsData);
			this.setModel(ilogTableModel, "ilogTableModelName");

			var attachmentsDetailsData = {
				results: [{
					"source": "Create ETO",
					"fileNmae": "xyz.pdf",
					"from": "S. Ranjan",
					"timeStamp": "24-May-2021 08:08:05 PM"
				}, {
					"source": "Create ETO",
					"fileNmae": "abc.pdf",
					"from": "S. Ranjan",
					"timeStamp": "24-May-2021 08:08:05 PM"
				}, {
					"source": "Create ETO",
					"fileNmae": "xyz1.pdf",
					"from": "S. Ranjan",
					"timeStamp": "24-May-2021 08:08:05 PM"
				}]
			};
			var attachtsTableModel = new JSONModel(attachmentsDetailsData);
			this.setModel(attachtsTableModel, "attachtsTableModelName");

		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.PONumber,
				sObjectName = oObject.CompanyCode;

			oViewModel.setProperty("/busy", false);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},
		itemTableSelectionChange: function (oEvent) {
			// this.getView().byId("idItemsTable2").setVisible(true);
			// this.getView().byId("idClarifyOrder").setVisible(true);
			// this.getView().byId("idRequoteButton").setVisible(true);
			// this.getView().byId("idClarifyButton").setVisible(true);
			//         this.getView().byId("idcreatefgmat").setVisible(true);
			// var preOrderItemsData = {
			// 	results: [{
			// 		"ItemNo": "10",
			// 		"Quality": "",
			// 		"Manufacturer": "",
			// 		"PartNo": "",
			// 		"Description": "item 10-UUAN1493 item 20-UUAN1495 item 10/20-UECN1123 item 30-UUAN1498, UECN1112 item 40/50-UUAN1500, UECN1112 ",
			// 	}]
			// };
			// var preOrderItemModel = new JSONModel(preOrderItemsData);
			// this.setModel(preOrderItemModel, "preOrderItemModelName");

			// this.getRouter().navTo("object", {
			// 	objectId: oItem.getBindingContext().getProperty("PONumber")
			// });

			this.getRouter().navTo("itemView");

		},
		_getRequoteSelectionDialog: function () {
			var _self = this;
			if (!_self._oDialogSelection) {
				_self._oDialogSelection = sap.ui.xmlfragment("com.yaskawa.ETOWorkFlow.fragments.RequoteSelection",
					_self);
				_self.getView().addDependent(_self._oDialogSelection);
			}
			return this._oDialogSelection;
		},
		onRequotePress: function (oEvent) {
			var oView = this.getView();
			this._getRequoteSelectionDialog().open();
			// oView.byId("idRequoteArea").setVisible(true);
			oView.byId("idOrderStatus").setValue("Requote Pending");
			oView.byId("idCfStatus").setValue("Complete");
			// oView.byId("idClarifyArea").setVisible(false);
			// oView.byId("idClarifyButtonn").setVisible(false);
			// oView.byId("idCreateFGMatrl").setVisible(false);

		},
		onRequoteSubmit: function (oEvent) {
			var selSoNumber = this.getView().byId("idZbStdPoNonStock2").getValue();
			MessageBox.success("SO Number" + " " + selSoNumber + " " + "successfully requoted.");
			this._getRequoteSelectionDialog().close();
		},

		onRequoteCancel: function (oEvent) {
			this._getRequoteSelectionDialog().close();
		},

		reQuoteSelectionYesNo: function (oEvent) {
			var oView = this.getView();
			if (oEvent.getSource().getProperty("text") === "Yes") {
				oView.byId("idRequoteOrder").setVisible(true);
				oView.byId("idClarifyButton").setVisible(false);
				// oView.byId("idOrdStatus").setVisible(true);
				// oView.byId("idAccAGnmnt22").setVisible(true);
			} else {
				oView.byId("idRequoteOrder").setVisible(false);
				oView.byId("idClarifyButton").setVisible(true);

			}
			// var id = sap.ui.getCore().byId("id_addNewRecordDialog");
			// id.destroy();
			this._getRequoteSelectionDialog().close();
		},
		_getClarifySelectionDialog: function () {
			var _self = this;
			if (!_self._oDialogClarify) {
				_self._oDialogClarify = sap.ui.xmlfragment("com.yaskawa.ETOWorkFlow.fragments.ClarifyOptionSelection",
					_self);
				_self.getView().addDependent(_self._oDialogClarify);
			}
			return this._oDialogClarify;
		},
		onClarifyPress: function (oEvent) {
			this._getClarifySelectionDialog().open();
			var oView = this.getView();
			// oView.byId("idClarifyArea").setVisible(true);
			// oView.byId("idRequoteArea").setVisible(false);
			// oView.byId("idRequotteButtonn").setVisible(false);
			// oView.byId("idClarifyButtonn").setVisible(true);
			oView.byId("idOsLbl").setVisible(false);
			oView.byId("idOrderStatus").setVisible(false);
			oView.byId("idCfStatus").setValue("Clarify");

		},
		onClarifySubmit: function (oEvent) {
			var selSoNumber = this.getView().byId("idZbStdPoNonStock2").getValue();
			MessageBox.success("SO Number" + " " + selSoNumber + " " + "has been clarified successfully.");
			this._getClarifySelectionDialog().close();
		},
		onClarifyCancel: function (oEvent) {
			this._getClarifySelectionDialog().close();
		},
		onFGMatPress: function (oEvent) {
			var oView = this.getView();
			oView.byId("idClarifyArea").setVisible(true);
			oView.byId("idRequoteArea").setVisible(false);
			oView.byId("idRequotteButtonn").setVisible(false);
			oView.byId("idClarifyButtonn").setVisible(false);
			oView.byId("idCfsLbl").setVisible(true);
			oView.byId("idCfOs").setVisible(true);
			oView.byId("idCfOs").setValue("Scheduling");
			oView.byId("idCfCs").setValue("Complete");
		},

		clarifySelectionYesNo: function (oEvent) {
			var oView = this.getView();
			if (oEvent.getSource().getProperty("text") === "Yes") {
				oView.byId("idClarifyOrder").setVisible(true);
				oView.byId("idOrdStatus").setVisible(false);
				oView.byId("idAccAGnmnt22").setVisible(false);
				oView.byId("idcreatefgmat").setVisible(false);
			} else {
				oView.byId("idClarifyOrder").setVisible(true);
				oView.byId("idcreatefgmat").setVisible(true);
			}
			// var id = sap.ui.getCore().byId("id_addNewRecordDialog");
			// id.destroy();
			this._getClarifySelectionDialog().close();
		},
		requoteClose: function (oEvent) {
			oEvent.getSource().destroy();
		},
		clrifyClose: function (oEvent) {
			oEvent.getSource().destroy();
		},
		handleSubmitPress: function (oEvent) {
			var _self = this;
			var selSoNumber = this.getView().byId("idZbStdPoNonStock2").getValue();
			MessageBox.success("SO Number" + " " + " " + selSoNumber + " " + "has been submitted successfully", {
				actions: [MessageBox.Action.OK],

				onClose: function (sAction) {
					_self.getRouter().navTo("worklist");
				}
			});

		},
		handleSubmitPress2: function (oEvent) {
			var _self = this;
			_self.getRouter().navTo("worklist");
			// MessageBox.success("Successfully Submitted", {
			// 	actions: [MessageBox.Action.OK],

			// 	onClose: function (sAction) {
			// 		_self.getRouter().navTo("worklist");
			// 	}
			// });

		},
		_getAttachmentDialog: function () {
			var _self = this;
			if (!_self._oDialogAttachment) {
				_self._oDialogAttachment = sap.ui.xmlfragment("com.yaskawa.ETOWorkFlow.fragments.AttachmentSection",
					_self);
				_self.getView().addDependent(_self._oDialogAttachment);
			}
			return this._oDialogAttachment;
		},
		onAttchmentPress: function () {
			this._getAttachmentDialog().open();
			sap.ui.getCore().byId("idAppEngUploadCollection").removeAllItems();
		},
		onAttachmentAddToTable: function () {
			var uploadedFileName = sap.ui.getCore().byId("idAppEngUploadCollection").getAggregation("items")[0].getProperty("fileName");
			var attachmentsDetailsDataAfterUpload = {
				results: [{
					"source": "AppEng",
					"fileNmae": uploadedFileName,
					"from": "G. Reichelt",
					"timeStamp": "27-May-2021 08:08:05 AM"
				}]
			};
			// var attachtsTableModel = new JSONModel(attachmentsDetailsDataAfterUpload);
			// this.setModel(attachtsTableModel, "attachtsTableModelName");
			var attachmentTableModel = this.getView().byId("idAttachmentsTable").getModel("attachtsTableModelName");
			attachmentTableModel.getData().results.push(attachmentsDetailsDataAfterUpload.results[0]);
			attachmentTableModel.refresh();
			this._getAttachmentDialog().close();
		},
		onAttachmentCancel: function () {
			this._getAttachmentDialog().close();
		},
		// onNotesPress: function(){
		// 	this.getView().byId("TextArea2").setEditable(true);
		// },
		onAttachmentTableItemDelete: function (oEvent) {
			var deletedItemTableIndexPath = oEvent.getSource().getBindingContext("attachtsTableModelName").getPath();
			var deletedItemTableIndex = deletedItemTableIndexPath.split("/")[2];
			var deletedTableModel = oEvent.getSource().getModel("attachtsTableModelName");
			var deletedTableModelData = oEvent.getSource().getModel("attachtsTableModelName").getData();

			sap.m.MessageBox.warning("Are you sure to delete this item?", {
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				styleClass: "messageBoxError",
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						deletedTableModelData.results.splice(deletedItemTableIndex, 1);
						deletedTableModel.refresh();
					}
				}
			});

		},
		onAddNewItemPress: function (oEvent) {
			var newItemToAdd = {
				results: [{
					"itemNo": "",
					"matNo": "",
					"panel": "",
					"itemNotes": ""
				}]
			};
			var newItemModel = new JSONModel(newItemToAdd);
			this.setModel(newItemModel, "newItemModelName");
			var oView = this.getView();
			oView.byId("idItemSubSection").setVisible(false);
			oView.byId("idAddNewItem").setVisible(true);
		},
		onAddNewItemToTable: function (oEvent) {
			var oView = this.getView();
			var itemTable = oView.byId("idItemsTable");
			// var itemNumber = idItemNumber
			// var materialNumber = 
			// var panel=
			// var itemNotes=
			// var newItemToAdd = {results:[{
			// 	"itemNo": "",
			// 		"matNo": "",
			// 		"panel": "",
			// 		"itemNotes": ""
			// }]};
			// var newItemModel = new JSONModel(newItemToAdd);
			// this.setModel(newItemModel, "newItemModelName");
			if (itemTable.getItems().length) {
				var newItemTableData = oView.getModel("newItemModelName").getData().results;
				oView.getModel("itemModelName").getData().results.push(newItemTableData[0]);
				oView.getModel("itemModelName").refresh();
			} else {
				var newItemModel = new JSONModel(oView.getModel("newItemModelName"));
				this.setModel(newItemModel, "newItemModelName");
			}

			oView.byId("idItemSubSection").setVisible(true);
			oView.byId("idAddNewItem").setVisible(false);
		},
		onAddItemCancel: function () {
			var oView = this.getView();
			oView.byId("idItemSubSection").setVisible(true);
			oView.byId("idAddNewItem").setVisible(false);
		}

	});

});