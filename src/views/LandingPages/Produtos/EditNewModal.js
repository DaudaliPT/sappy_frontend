import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axios from "axios";
var $ = window.$;
var byUs = window.byUs;

import { ByUsTextBox, ByUsTextBoxNumeric, ByUsComboBox } from "../../../Inputs";
import { ByUsModalMessage } from "../../../Modals";


const getInitialState = function (props) {
  return {
    saving: false,
    changeItemCode: props.changeItemCode || '',
    loading: props.changeItemCode && true,
    numberOfBarCodes: 1,
    showFabricante: false,
    supplierCollection: [{}],
    Propriedades: [],
    U_rsaMargem: '',
    PrecoCash: '',
    newItem: {
      PurchaseItem: "tYES",
      SalesItem: "tYES",
      InventoryItem: "tYES",
      ManageBatchNumbers: "tNO",
      GLMethod: "glm_WH",
      ManageStockByWarehouse: "tYES",
      InventoryUOM: "Un",
      UoMGroupEntry: -1,
      ItemType: "itItems",
      ItemClass: "itcMaterial",
      ItemBarCodeCollection: [],
      ItemPrices: [{ PriceList: 1 }],
      Valid: "tYES",
      Frozen: "tNO",
      FrozenRemarks: ""
    },
    validationMessages: {
      // ItemName: "danger|Iválido sskljsdkfs"
    }
  };
}

class ModalCreateArtigo extends Component {
  constructor(props) {
    super(props);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onClick_AddBarCode = this.onClick_AddBarCode.bind(this);
    this.onClick_AddSupplier = this.onClick_AddSupplier.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.onDeleteDraft = this.onDeleteDraft.bind(this);
    this.onSaveArtigo = this.onSaveArtigo.bind(this);
    this.onSaveDraft = this.onSaveDraft.bind(this);
    this.onSave = this.onSave.bind(this);
    this.toggleModalMessage = this.toggleModalMessage.bind(this);

    this.state = getInitialState(props);
  }

  componentWillMount() {
    let that = this;
    $("body").css("position", "fixed");

    if (this.state.changeItemCode && this.state.changeItemCode.length > 0) {
      this.serverRequest = axios({
        method: "get",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ ...this.state }),
        url: "api/inv/oitm/item/" + this.state.changeItemCode
      })
        .then(result => {
          let item = result.data.Item;
          let AlternateCatNum = result.data.AlternateCatNum;

          //Preparar as propriedades
          let Propriedades = [];
          for (var index = 1; index < 65; index++) {
            var propertyName = "Properties" + index;
            let propertyValue = item[propertyName] === "tYES";
            if (propertyValue) Propriedades.push(index.toString());
          }

          //preparar supplierCollection
          let supplierCollection = [{
            "CardCode": item.Mainsupplier,
            "Substitute": item.SupplierCatalogNo
          }];
          AlternateCatNum.forEach(obj => {
            if (obj.CardCode !== item.Mainsupplier) {
              supplierCollection.push({
                "CardCode": obj.CardCode,
                "Substitute": obj.Substitute
              });
            }
          })


          that.setState({
            loading: false,
            newItem: item,
            numberOfBarCodes: item.ItemBarCodeCollection.length,
            Propriedades,
            supplierCollection,
            showFabricante: item.Mainsupplier === "F0585"/*UNAPOR*/,
            U_rsaMargem: item.U_rsaMargem,
            PrecoCash: item.ItemPrices[0].Price
          })
        })
        .catch(error => {
          this.setState({ saving: false }, () => {
            this.showMessage({
              title: "Error!",
              message: error.response.data.message,
              moreInfo: error.response.data.moreInfo,
              color: "danger"
            });
          });
        })
    }
  }

  componentWillUnmount() {
    $("body").css("position", "initial");
    if (this.serverRequest && this.serverRequest.abort) {
      this.serverRequest.abort();
    }
  }
  toggleModalMessage(refresh) {
    this.setState({
      modalMessage: {}
    });
  }
  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let newItem = this.state.newItem;
    let validationMessages = this.state.validationMessages || {};

    Object.assign(validationMessages, { [fieldName]: "" });
    let newStateValues = { newItem, validationMessages };

    //Correctly save to ServiceLayer properties
    if (fieldName === "Propriedades") {
      Object.assign(newStateValues, { [fieldName]: val });
      let values = val.split(",");

      for (var index = 1; index < 65; index++) {
        var propertyName = "Properties" + index;
        let propertyValue = values.indexOf(index.toString()) > -1 ? "tYES" : "tNO";
        Object.assign(newItem, { [propertyName]: propertyValue });
      }
    } else if (fieldName === "U_SubFamilia1") {
      Object.assign(newItem, { ItemsGroupCode: formatedValue.U_CodigoFamilia }); // grupo de artigo (herdado da familia1) 
      Object.assign(newItem, { Series: formatedValue.DefaultSeries }); // Default Series  
      Object.assign(newItem, { [fieldName]: val });

    } else if (fieldName.indexOf("CodigoBarras_") > -1) {
      let parts = fieldName.split("_"); // CodigoBarras_1_BarCode  ou CodigoBarras_2_FreeText
      let ix = parseInt(parts[1], 10);
      let slField = parts[2];
      let ItemBarCodeCollection = [...this.state.newItem.ItemBarCodeCollection];


      if (slField === "Barcode") {
        //validate if in other items
        this.serverRequest = axios({
          method: "post",
          data: {
            ItemCode: this.state.changeItemCode,
            Barcode: val
          },
          url: `api/inv/oitm/new/isUniqueBarcode`
        })
          .then(result => {

            if (result.data.length > 0) {
              let validationMessages = that.state.validationMessages;
              validationMessages[fieldName] = "warning|Código ja existe no artigo " + result.data[0].ItemCode;

              that.setState({ validationMessages })
            }
          })
          .catch(error => byUs.showError(error, "Erro ao validar dados"));
      }

      let bc = ItemBarCodeCollection.filter(item => {
        return item.AbsEntry === ix + 1;
      });
      if (bc.length > 0) {
        Object.assign(bc[0], { [slField]: val });
      } else {
        ItemBarCodeCollection.push({
          AbsEntry: ix + 1,
          UoMEntry: -1,
          [slField]: val
        });
      }
      if (ix === 0 && slField === "Barcode") {
        Object.assign(newItem, { BarCode: val }); // !!! diferent case in BarCode
      }
      // newStateValues = { ...newStateValues };
      Object.assign(newItem, { ItemBarCodeCollection });

    } else if (fieldName.indexOf("Supplier_") > -1) {
      let parts = fieldName.split("_"); // Supplier_1_CardCode
      let ix = parseInt(parts[1], 10);
      let slField = parts[2];


      let supplierCollection = [...this.state.supplierCollection];
      let item = supplierCollection[ix];

      let validateData = {
        ItemCode: this.state.changeItemCode,
        CardCode: item.CardCode,
        Substitute: item.Substitute
      }

      if (slField === "Substitute")
        validateData.Substitute = val
      else
        validateData.CardCode = val

      //validate if in other items
      this.serverRequest = axios({
        method: "post",
        data: validateData,
        url: `api/inv/oitm/new/isUniqueCatalogNr`
      })
        .then(result => {
          let valFname = fieldName.replace("CardCode", "Substitute")
          let validationMessages = that.state.validationMessages;

          if (result.data.length > 0) {
            validationMessages[valFname] = "warning|Código ja existe no artigo " + result.data[0].ItemCode;
          } else {
            validationMessages[valFname] = "";
          }
          that.setState({ validationMessages })
        })
        .catch(error => byUs.showError(error, "Erro ao validar dados"));

      Object.assign(item, { [slField]: val });

      if (ix === 0 && slField === "CardCode") {
        Object.assign(newStateValues, { showFabricante: val === "F0585"/*UNAPOR*/ });

        Object.assign(newItem, { Mainsupplier: val }); // !!! diferent case in CardCode
      }
      if (ix === 0 && slField === "Substitute") {
        Object.assign(newItem, { SupplierCatalogNo: val }); // !!! diferent case in Substitute
      }

      newStateValues = { ...newStateValues, supplierCollection };
    } else if (fieldName.indexOf("U_rsaMargem") > -1) {
      Object.assign(newStateValues, { [fieldName]: formatedValue });
      Object.assign(newItem, { [fieldName]: val });
    } else if (fieldName.indexOf("PrecoCash") > -1) {
      Object.assign(newStateValues, { [fieldName]: formatedValue });
      let ItemPrices = [...newItem.ItemPrices];
      ItemPrices[0].Price = val;
      Object.assign(newItem, { ItemPrices });
    } else {
      Object.assign(newItem, { [fieldName]: val });
    }

    this.setState(newStateValues);
  }

  showMessage({ title, message, moreInfo, okText, cancelText, onClickOk, onClickCancel, color } = {}) {
    let modalMessage = {
      title,
      message,
      moreInfo,
      okText,
      cancelText,
      onClickOk,
      onClickCancel,
      color
    };
    this.setState({ modalMessage });
  }


  onDeleteDraft(e) {
    var that = this;

    let apagarArtigo = () => {
      //save
      that.setState({ saving: true, modalMessage: {} }, () => {
        this.serverRequest = axios({
          method: "delete",
          headers: { "Content-Type": "application/json" },
          data: JSON.stringify({ ...this.state }),
          url: `api/inv/oitm/item/${this.state.changeItemCode}`
        })
          .then(result => {
            that.props.toggleModal("refresh");
          })
          .catch(error => {
            this.setState({ saving: false }, () => {
              this.showMessage({
                title: "Error!",
                message: error.response.data.message,
                moreInfo: error.response.data.moreInfo,
                color: "danger"
              });
            });
          });
      });
    }

    this.setState(
      {
        saving: false
      },
      () => {
        this.showMessage({
          title: "Apagar?",
          message: "Deseja apagar este rascunho?",
          okText: "Apagar Rascunho",
          cancelText: "Cancelar",
          onClickCancel: that.toggleModalMessage,
          color: "danger",
          onClickOk: apagarArtigo
        });
      }
    );
  }

  onSaveDraft() {
    this.onSave({ saveDraft: true })
  }

  onSaveArtigo() {
    this.onSave({ saveDraft: false })
  }
  onSave({ saveDraft }) {
    var that = this;

    //validate
    let newItem = this.state.newItem;
    let validationMessages = {};
    let haErros = false;

    if (!newItem.ItemName || newItem.ItemName.length < 1 || newItem.ItemName.length > 100) {
      haErros = true;
      Object.assign(validationMessages, { ItemName: "danger|Preencha a Descrição" });
    }

    if (!saveDraft) {
      if (!newItem.U_SubFamilia1) {
        haErros = true;
        Object.assign(validationMessages, { U_SubFamilia1: "danger|Preencha a Familia" });
      }
      if (!newItem.ItemBarCodeCollection || newItem.ItemBarCodeCollection.length < 1 || !newItem.ItemBarCodeCollection[0].Barcode) {
        haErros = true;
        Object.assign(validationMessages, { CodigoBarras_0_Barcode: "danger|Preencha o Código de Barras" });
      }
      if (!newItem.ItemBarCodeCollection || newItem.ItemBarCodeCollection.length < 1 || !newItem.ItemBarCodeCollection[0].FreeText) {
        haErros = true;
        Object.assign(validationMessages, { CodigoBarras_0_FreeText: "danger|Preencha a Grupagem" });
      }
      if (!newItem.PurchaseVATGroup) {
        haErros = true;
        Object.assign(validationMessages, { PurchaseVATGroup: "danger|Preencha o IVA para compras" });
      }
      if (!newItem.SalesVATGroup) {
        haErros = true;
        Object.assign(validationMessages, { SalesVATGroup: "danger|Preencha o IVA para vendas" });
      }
    }
    this.setState({ validationMessages });


    if (!haErros) {
      let criarArtigo = () => {
        //save
        that.setState({ saving: true, saveDraft, modalMessage: {} }, () => {
          this.serverRequest = axios({
            method: "post",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
              newItem: this.state.newItem,
              supplierCollection: this.state.supplierCollection,
              saveDraft: this.state.saveDraft
            }),
            url: "api/inv/oitm/item"
          })
            .then(result => {

              if (this.props.onNewItemCreated) {
                this.props.onNewItemCreated(result.data.ItemCode)
              }
              else {
                this.showMessage({
                  title: "Concluído!",
                  message: "Criado o com o código " + result.data.ItemCode,
                  color: "info",
                  cancelText: "",
                  okText: "Ok",
                  onClickOk: () => {
                    that.toggleModalMessage();

                    //manter a janela aberta em novo artigo
                    that.setState(getInitialState({}));
                  }
                });
              }
            })
            .catch(error => {
              this.setState({ saving: false }, () => {
                this.showMessage({
                  title: "Error!",
                  message: error.response.data.message,
                  moreInfo: error.response.data.moreInfo,
                  color: "danger"
                });
              });
            });
        });
      };

      this.setState(
        {
          saving: false
        },
        () => {
          if (saveDraft) {
            criarArtigo();
          } else {
            this.showMessage({
              title: "Confirmação",
              message: "Confirma a criação deste artigo?",
              okText: "Confirmar",
              cancelText: "Cancelar",
              onClickCancel: that.toggleModalMessage,
              color: "warning",
              onClickOk: criarArtigo
            });
          }
        }
      );
    }
  }

  onClick_AddBarCode(e) {
    let numberOfBarCodes = this.state.numberOfBarCodes;
    if (e.target.innerText === "+") numberOfBarCodes++;
    if (e.target.innerText === "-") numberOfBarCodes--;
    if (numberOfBarCodes < 1) numberOfBarCodes = 1;
    if (numberOfBarCodes > 5) numberOfBarCodes = 5;

    let newItem = this.state.newItem;
    if (e.target.innerText === "-") {
      let ix = e.target.id.split("_")[1]; // expect: CodigoBarras_1_FreeText_rbtn
      let ItemBarCodeCollection = [...newItem.ItemBarCodeCollection];
      ItemBarCodeCollection.splice(ix, 1);
      Object.assign(newItem, { ItemBarCodeCollection });
    }

    this.setState({ newItem, numberOfBarCodes });
  }

  onClick_AddSupplier(e) {
    let supplierCollection = [...this.state.supplierCollection];

    if (e.target.innerText === "-") {
      let ix = e.target.id.split("_")[1]; // expect: Supplier_1_Substitute_rbtn
      supplierCollection.splice(ix, 1);
    } else {
      supplierCollection.push({});
    }

    this.setState({ supplierCollection });
  }

  render() {
    var renderSuppliers = () => {
      let ret = [];
      let { supplierCollection } = this.state;

      for (var index = 0; index < supplierCollection.length; index++) {
        let supplier_field = "Supplier_" + index + "_CardCode";
        let catalogNo_field = "Supplier_" + index + "_Substitute";

        let bc = supplierCollection[index] || {};

        let label2 = "Código de catálogo:"
        let label = "Fornecedor secundário";
        if (index === 0) {
          label = "Fornecedor";
          label2 = "Código de catálogo"
        }

        ret.push(
          <div key={"div1" + supplier_field} className="row">
            <div className="col-7" style={{ paddingRight: "0" }}>
              <ByUsComboBox
                key={supplier_field}
                name={supplier_field}
                label={label + ":"}
                placeholder={label + "..."}
                value={bc.CardCode}
                getOptionsApiRoute="/api/cbo/ocrd/s"
                onChange={this.onFieldChange}
                state={this.state.validationMessages[supplier_field]}
              />
            </div>

            <div className="col" style={{ paddingLeft: "0" }}>
              <ByUsTextBox
                label={label2 + ":"}
                placeholder="Código de catálogo..."
                name={catalogNo_field}
                value={bc.Substitute}
                onChange={this.onFieldChange}
                rightButton={index === 0 ? "+" : "-"}
                onRightButtonClick={this.onClick_AddSupplier}
                state={this.state.validationMessages[catalogNo_field]}
              />
            </div>
          </div>
        );

        if (index === 0 && this.state.showFabricante) {
          ret.push(
            <div key={"div_fabricante"} className="row">
              <div className="col-7" style={{ paddingRight: "0" }}>
                <ByUsComboBox
                  key="Manufacturer"
                  name="Manufacturer"
                  label={"Fabricante:"}
                  placeholder="Fabricante..."
                  createable
                  value={(this.state.newItem.Manufacturer || "").toString()}
                  state={this.state.validationMessages.Manufacturer}
                  getOptionsApiRoute={"/api/cbo/omrc/<CARDCODE>".replace("<CARDCODE>", this.state.newItem.Mainsupplier)}

                  onChange={this.onFieldChange}
                />
              </div>
            </div>
          );
        }
      }

      return ret;
    };
    var renderBarcodes = () => {
      let ret = [];
      for (var index = 0; index < (this.state.numberOfBarCodes || 1); index++) {
        let barcode_field = "CodigoBarras_" + index + "_Barcode";
        let freetext_field = "CodigoBarras_" + index + "_FreeText";
        let bc = this.state.newItem.ItemBarCodeCollection[index] || {};
        ret.push(
          <div key={"div1" + barcode_field} className="row">
            <div className="col-7" style={{ paddingRight: "0" }}>
              <ByUsTextBox
                key={barcode_field}
                label="Código de barras:"
                placeholder="Código de barras..."
                name={barcode_field}
                value={bc.Barcode}
                onChange={this.onFieldChange}
                state={this.state.validationMessages[barcode_field]}
              />
            </div>
            <div className="col" style={{ paddingLeft: "0" }}>
              <ByUsTextBoxNumeric
                valueType="integer"
                label="Grupagem:"
                placeholder="Grupagem..."
                name={freetext_field}
                value={bc.FreeText}
                onChange={this.onFieldChange}
                rightButton={index === 0 ? "+" : "-"}
                onRightButtonClick={this.onClick_AddBarCode}
                state={this.state.validationMessages[freetext_field]}
              />
            </div>

          </div>
        );
      }

      return ret;
    };

    let renderModalMessage = () => {
      if (this.state.modalMessage && this.state.modalMessage.message) {
        return <ByUsModalMessage {...this.state.modalMessage} />;
      }
    };

    let renderLoading = () => {
      if (!this.state.loading) return null
      return (<div className="example-loading example-well h-150 vertical-align text-center">
        <div className="loader vertical-align-middle loader-tadpole" />
      </div>)
    }

    let renderContent = () => {
      let hideClass = "";
      if (this.state.loading) hideClass = "hidden-xxl-down";

      return (
        <div className={"row " + hideClass}>
          <div className="col-lg-6">
            <h5 className="section-title">Info Geral</h5>
            <ByUsComboBox
              label="Família:"
              placeholder="Selecione a família..."
              name="U_SubFamilia1"
              value={this.state.newItem.U_SubFamilia1}
              state={this.state.validationMessages.U_SubFamilia1}
              getOptionsApiRoute="/api/cbo/subfamilia1"
              onChange={this.onFieldChange}
            />

            <ByUsTextBox
              name="ItemName"
              label="Descrição:"
              placeholder="Introduza a descrição..."
              state={this.state.validationMessages.ItemName}
              value={this.state.newItem.ItemName}
              onChange={this.onFieldChange}
            />

            {renderBarcodes()}

            <ByUsComboBox
              label="Propriedades:"
              placeholder="Propriedades..."
              name="Propriedades"
              multi={true}
              value={this.state.Propriedades}
              getOptionsApiRoute="/api/cbo/oitg"
              onChange={this.onFieldChange}
            />

            <ByUsTextBox
              type="textarea"
              name="User_Text"
              label="Observações:"
              placeholder="Observações..."
              value={this.state.newItem.User_Text}
              onChange={this.onFieldChange}
            />

          </div>
          <div className="col-lg-6">

            <h5 className="section-title">Compra</h5>
            <ByUsComboBox
              name="PurchaseVATGroup"
              label="IVA para compras:"
              placeholder="Selecione o IVA para compras..."
              state={this.state.validationMessages.PurchaseVATGroup}
              value={this.state.newItem.PurchaseVATGroup}
              getOptionsApiRoute="/api/cbo/ovtg/i"
              onChange={this.onFieldChange}
            />

            {renderSuppliers()}

            <h5 className="section-title">Venda</h5>
            <ByUsComboBox
              name="SalesVATGroup"
              label="IVA para vendas:"
              placeholder="Selecione o IVA para vendas..."
              state={this.state.validationMessages.SalesVATGroup}
              value={this.state.newItem.SalesVATGroup}
              getOptionsApiRoute="/api/cbo/ovtg/o"
              onChange={this.onFieldChange}
            />
            <div className="row">
              <div className="col-6">
                <ByUsTextBoxNumeric
                  valueType="price"
                  label="Preço Cash:"
                  placeholder="Introduza o preço Cash..."
                  state={this.state.validationMessages.PrecoCash}
                  name="PrecoCash"
                  value={this.state.PrecoCash}
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-6">
                <ByUsTextBoxNumeric
                  valueType="percent"
                  label="Margem Indicativa:"
                  placeholder="margem Indicativa..."
                  name="U_rsaMargem"
                  value={this.state.U_rsaMargem}
                  onChange={this.onFieldChange}
                />
              </div>
            </div>

          </div>
        </div>)
    }

    return (
      <Modal isOpen={this.props.modal} className={"modal-lg modal-success"}>
        <ModalHeader toggle={this.props.toggleModal}>Abertura de novo artigo</ModalHeader>
        <ModalBody className="scrollable">
          {renderLoading()}
          {renderContent()}
        </ModalBody>
        <ModalFooter>
          {(this.state.changeItemCode && this.state.changeItemCode.indexOf('DRAFT') === 0)
            &&
            <Button color="danger" disabled={this.state.saving || this.state.loading} onClick={this.onDeleteDraft}>
              <i className="icon wb-trash active" />
              <span className="hidden-sm-down"> Apagar Rascunho</span>
            </Button>
          }
          <Button color="primary" disabled={this.state.saving || this.state.loading} onClick={this.onSaveDraft}>
            <i className="icon wb-add-file active" />
            <span className="hidden-sm-down"> Gravar Rascunho</span>
          </Button>
          <Button color="success" disabled={this.state.saving || this.state.loading} onClick={this.onSaveArtigo}>
            <i className="icon wb-check active" />
            <span className="hidden-sm-down"> Criar Artigo</span>
          </Button>
        </ModalFooter>
        {renderModalMessage()}
      </Modal>
    );
  }
}

export default ModalCreateArtigo;
