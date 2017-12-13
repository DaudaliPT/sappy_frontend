import React, { Component } from "react";
import { Button } from "reactstrap";
import axios from "axios";
// var $ = window.$;
var sappy = window.sappy;
import { TextBox, TextBoxNumeric, ComboBox, Toggle } from "../../Inputs";
import { hashHistory } from "react-router";

const getInitialState = function(props) {
  let Item = props.Item || {};

  let supplierCollection = props.supplierCollection || [];

  //Preparar as propriedades
  let Propriedades = [];
  for (var index = 1; index < 65; index++) {
    var propertyName = "Properties" + index;
    let propertyValue = Item[propertyName] === "tYES";
    if (propertyValue) Propriedades.push(index.toString());
  }

  let newState = {
    saving: false,
    CardCode: props.CardCode || "",
    loading: false, // props.CardCode && true,
    ReadOnly: props.ReadOnly,
    TinhaFamilia1: Item.U_SubFamilia1 ? false : true,
    validationMessages: {
      // CardName: "danger|Iválido sskljsdkfs"
    },
    Item: Item,
    OldItemData: JSON.parse(JSON.stringify(Item)),
    numberOfBarCodes: Item.ItemBarCodeCollection ? Item.ItemBarCodeCollection.length : 1,
    Propriedades,
    supplierCollection,
    showFabricante: Item.Mainsupplier === "F0585" /*UNAPOR*/,
    U_rsaMargem: Item.U_rsaMargem,
    PrecoCash: Item.ItemPrices && Item.ItemPrices.length > 0 && Item.ItemPrices[0].Price
  };
  return newState;
};

class CmpGeral extends Component {
  constructor(props) {
    super(props);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onClick_AddBarCode = this.onClick_AddBarCode.bind(this);
    this.onClick_AddSupplier = this.onClick_AddSupplier.bind(this);
    this.onDeleteArtigo = this.onDeleteArtigo.bind(this);
    this.onSaveArtigo = this.onSaveArtigo.bind(this);

    this.state = getInitialState(props);
  }

  componentWillReceiveProps(nextProps) {
    let oldItem = this.props.Item || {};
    if (nextProps.Item && oldItem.cardCode !== nextProps.Item.CardCode) this.setState(getInitialState(nextProps));
    if (this.props.ReadOnly !== nextProps.ReadOnly) this.setState({ ReadOnly: nextProps.ReadOnly });
  }

  componentWillUnmount() {
    // $("body").css("position", "initial");
    if (this.serverRequest && this.serverRequest.abort) {
      this.serverRequest.abort();
    }
  }

  // Recebe os valores dos campos MY*
  onFieldChange(changeInfo) {
    let that = this;
    let formatedValue = changeInfo.formatedValue;
    let val = changeInfo.rawValue;
    let fieldName = changeInfo.fieldName;

    let Item = this.state.Item;
    let validationMessages = this.state.validationMessages || {};

    Object.assign(validationMessages, { [fieldName]: "" });
    let newStateValues = { Item, validationMessages };

    //Correctly save to ServiceLayer properties
    if (fieldName === "Propriedades") {
      Object.assign(newStateValues, { [fieldName]: val });
      let values = val.split(",");

      for (var index = 1; index < 65; index++) {
        var propertyName = "Properties" + index;
        let propertyValue = values.indexOf(index.toString()) > -1 ? "tYES" : "tNO";
        Object.assign(Item, { [propertyName]: propertyValue });
      }
    } else if (fieldName.indexOf("Frozen") > -1) {
      Item.Valid = val ? "tNO" : "tYES";
      Item.Frozen = val ? "tYES" : "tNO";
    } else {
      Object.assign(Item, { [fieldName]: val });
    }

    this.setState(newStateValues);
  }

  onDeleteArtigo(e) {
    var that = this;

    let apagarArtigo = () => {
      that.setState({ saving: true }, () => {
        this.serverRequest = axios({
          method: "delete",
          headers: { "Content-Type": "application/json" },
          data: JSON.stringify({ ...this.state }),
          url: `api/pns/item/${this.state.CardCode}`
        })
          .then(result => {
            hashHistory.push("/pns/ocrd");
          })
          .catch(error => {
            this.setState({ saving: false }, sappy.showError(error, "Erro ao apagar"));
          });
      });
    };

    this.setState(
      {
        saving: false
      },
      () => {
        sappy.showDanger({
          title: "Apagar parceiro?",
          moreInfo: `Se confirmar a remoção deste parceiro, ele será removido do sistema.`,
          cancelText: "Cancelar",
          showCancelButton: true,
          confirmText: "Apagar parceiro",
          // eslint-disable-next-line
          onConfirm: apagarArtigo
        });
      }
    );
  }

  onSaveArtigo() {
    var that = this;

    //validate
    let Item = this.state.Item;
    let validationMessages = {};
    let haErros = false;

    if (!Item.CardName || Item.CardName.length < 1 || Item.CardName.length > 100) {
      haErros = true;
      Object.assign(validationMessages, { CardName: "danger" });
    }
    if (!Item.U_SubFamilia1) {
      haErros = true;
      Object.assign(validationMessages, { U_SubFamilia1: "danger" });
    }
    if (!Item.ItemBarCodeCollection || Item.ItemBarCodeCollection.length < 1 || !Item.ItemBarCodeCollection[0].Barcode) {
      haErros = true;
      Object.assign(validationMessages, { CodigoBarras_0_Barcode: "danger" });
    }
    if (!Item.ItemBarCodeCollection || Item.ItemBarCodeCollection.length < 1 || !Item.ItemBarCodeCollection[0].FreeText) {
      haErros = true;
      Object.assign(validationMessages, { CodigoBarras_0_FreeText: "danger" });
    }
    if (!Item.PurchaseVATGroup) {
      haErros = true;
      Object.assign(validationMessages, { PurchaseVATGroup: "danger" });
    }
    if (!Item.SalesVATGroup) {
      haErros = true;
      Object.assign(validationMessages, { SalesVATGroup: "danger" });
    }

    this.setState({ validationMessages });

    if (!haErros) {
      let gravarArtigo = () => {
        // If barcodes where deleted we need to save that
        let oldBC = that.state.OldItemData.ItemBarCodeCollection;
        let curBC = that.state.Item.ItemBarCodeCollection;
        let BarCodesToDelete = [];
        oldBC.forEach(bc => {
          let stillExists = curBC.find(item => item.AbsEntry === bc.AbsEntry);
          if (!stillExists) BarCodesToDelete.push(bc);
        });

        //save
        that.setState({ saving: true }, () => {
          this.serverRequest = axios({
            method: "post",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
              newItem: that.state.Item,
              supplierCollection: that.state.supplierCollection,
              BarCodesToDelete
            }),
            url: "api/pns/item"
          })
            .then(result => {
              if (that.props.onItemSaved) that.props.onItemSaved(); //notify parent

              sappy.showSuccess({
                title: "Alterações gravadas",
                moreInfo: `O parceiro ${result.data.CardCode} foi alterado!`
              });
            })
            .catch(error => {
              this.setState({ saving: false }, sappy.showError(error, "Erro ao gravar"));
            });
        });
      };

      this.setState(
        {
          saving: false
        },
        () => {
          sappy.showQuestion({
            title: "Confirma?",
            moreInfo: `Se confirmar, as alterações ao parceiro serão gravadas no sistema.`,
            cancelText: "Cancelar",
            showCancelButton: true,
            confirmText: "Confirmar",
            onConfirm: gravarArtigo
          });
        }
      );
    }
  }

  onClick_AddBarCode(cmpThis) {
    let numberOfBarCodes = this.state.numberOfBarCodes;
    if (cmpThis.props.rightButton === "+") numberOfBarCodes++;
    if (cmpThis.props.rightButton === "-") numberOfBarCodes--;
    if (numberOfBarCodes < 1) numberOfBarCodes = 1;
    if (numberOfBarCodes > 10) numberOfBarCodes = 10;

    let Item = this.state.Item;
    if (cmpThis.props.rightButton === "-") {
      let ix = cmpThis.props.name.split("_")[1]; // expect: CodigoBarras_1_FreeText
      let ItemBarCodeCollection = [...Item.ItemBarCodeCollection];
      ItemBarCodeCollection.splice(ix, 1);
      Object.assign(Item, { ItemBarCodeCollection });
    }

    this.setState({ Item, numberOfBarCodes });
  }

  onClick_AddSupplier(cmpThis) {
    let supplierCollection = [...this.state.supplierCollection];

    if (cmpThis.props.rightButton === "-") {
      let ix = cmpThis.props.name.split("_")[1]; // expect: Supplier_1_Substitute
      supplierCollection.splice(ix, 1);
    } else {
      supplierCollection.push({});
    }

    this.setState({ supplierCollection });
  }

  render() {
    let Item = this.state.Item || {};
    let ItemBarCodeCollection = Item.ItemBarCodeCollection || [];

    var renderSuppliers = () => {
      let ret = [];
      let { supplierCollection } = this.state;

      for (var index = 0; index < supplierCollection.length; index++) {
        let supplier_field = "Supplier_" + index + "_CardCode";
        let catalogNo_field = "Supplier_" + index + "_Substitute";

        let bc = supplierCollection[index] || {};

        let label2 = "Código de catálogo";
        let label = "Fornecedor";
        if (this.state.showFabricante) label = "Fornecedor/Fabricante";

        ret.push(
          <div key={"div1" + supplier_field} className="row">
            <div className="col-7" style={{ paddingRight: "0" }}>
              <ComboBox
                key={supplier_field}
                name={supplier_field}
                label={index === 0 ? label + ":" : ""}
                disabled={this.state.ReadOnly}
                placeholder={label + "..."}
                value={bc.CardCode}
                getOptionsApiRoute="/api/cbo/ocrd/s"
                onChange={this.onFieldChange}
                state={this.state.validationMessages[supplier_field]}
              />
            </div>

            <div className="col" style={{ paddingLeft: "0" }}>
              <TextBox
                label={index === 0 ? label2 + ":" : ""}
                placeholder={"Código de catálogo..."}
                name={catalogNo_field}
                value={bc.Substitute}
                disabled={this.state.ReadOnly}
                onChange={this.onFieldChange}
                rightButton={this.state.ReadOnly ? "" : index === 0 ? "+" : "-"}
                onRightButtonClick={this.onClick_AddSupplier}
                state={this.state.validationMessages[catalogNo_field]}
              />
            </div>
          </div>
        );

        if (index === 0 && this.state.showFabricante) {
          ret.push(
            <div key={"div_fabricante"} className="row">
              <div className="col-6 offset-1" style={{ paddingRight: "0" }}>
                <ComboBox
                  key="Manufacturer"
                  name="Manufacturer"
                  placeholder="Fabricante..."
                  createable
                  disabled={this.state.ReadOnly}
                  value={Item.Manufacturer.toString()}
                  state={this.state.validationMessages.Manufacturer}
                  getOptionsApiRoute={"/api/cbo/omrc/<CARDCODE>".replace("<CARDCODE>", Item.Mainsupplier)}
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
        let bc = ItemBarCodeCollection[index] || {};
        ret.push(
          <div key={"div1" + barcode_field} className="row">
            <div className="col-7" style={{ paddingRight: "0" }}>
              <TextBox
                key={barcode_field}
                label={index === 0 ? "Código de barras:" : ""}
                disabled={this.state.ReadOnly}
                placeholder={"Código de barras..."}
                name={barcode_field}
                value={bc.Barcode}
                onChange={this.onFieldChange}
                state={this.state.validationMessages[barcode_field]}
              />
            </div>
            <div className="col" style={{ paddingLeft: "0" }}>
              <TextBoxNumeric
                valueType="integer"
                label={index === 0 ? "Grupagem:" : ""}
                placeholder="Grupagem..."
                name={freetext_field}
                value={bc.FreeText}
                disabled={this.state.ReadOnly}
                onChange={this.onFieldChange}
                rightButton={this.state.ReadOnly ? "" : index === 0 ? "+" : "-"}
                onRightButtonClick={this.onClick_AddBarCode}
                state={this.state.validationMessages[freetext_field]}
              />
            </div>
          </div>
        );
      }

      return ret;
    };

    let renderLoading = () => {
      if (!this.state.loading) return null;
      return (
        <div className="example-loading example-well h-150 vertical-align text-center">
          <div className="loader vertical-align-middle loader-tadpole" />
        </div>
      );
    };

    let renderContent = () => {
      let hideClass = "";
      if (this.state.loading) hideClass = "hidden-xxl-down";

      return (
        <div className={"row " + hideClass}>
          <div className="col-lg-6">
            <h5 className="section-title">Info Geral</h5>

            <TextBox
              name="CardName"
              label="Descrição:"
              disabled={this.state.ReadOnly}
              placeholder="Introduza a descrição..."
              state={this.state.validationMessages.CardName}
              value={Item.CardName}
              onChange={this.onFieldChange}
            />

            <ComboBox
              label="Sub-Família:"
              placeholder="Selecione a família..."
              name="U_SubFamilia1"
              disabled={this.state.TinhaFamilia1 ? this.state.ReadOnly : true}
              value={Item.U_SubFamilia1}
              state={this.state.validationMessages.U_SubFamilia1}
              getOptionsApiRoute="/api/cbo/subfamilia1"
              onChange={this.onFieldChange}
            />
            {renderBarcodes()}

            <ComboBox
              label="Propriedades:"
              placeholder="Propriedades..."
              name="Propriedades"
              multi={true}
              disabled={this.state.ReadOnly}
              value={this.state.Propriedades}
              getOptionsApiRoute="/api/cbo/oitg"
              onChange={this.onFieldChange}
            />

            <TextBox type="textarea" name="User_Text" label="Observações:" disabled={this.state.ReadOnly} placeholder="Observações..." value={Item.User_Text || ""} onChange={this.onFieldChange} />
          </div>
          <div className="col-lg-6">
            <h5 className="section-title">Compra</h5>
            <ComboBox
              name="PurchaseVATGroup"
              disabled={this.state.ReadOnly}
              label="IVA para compras:"
              placeholder="Selecione o IVA para compras..."
              state={this.state.validationMessages.PurchaseVATGroup}
              value={Item.PurchaseVATGroup}
              getOptionsApiRoute="/api/cbo/ovtg/i"
              onChange={this.onFieldChange}
            />

            {renderSuppliers()}

            <h5 className="section-title">Venda</h5>
            <ComboBox
              name="SalesVATGroup"
              disabled={this.state.ReadOnly}
              label="IVA para vendas:"
              placeholder="Selecione o IVA para vendas..."
              state={this.state.validationMessages.SalesVATGroup}
              value={Item.SalesVATGroup}
              getOptionsApiRoute="/api/cbo/ovtg/o"
              onChange={this.onFieldChange}
            />
            <div className="row">
              <div className="col-6">
                <TextBoxNumeric
                  valueType="price"
                  disabled={this.state.ReadOnly}
                  label="Preço Cash:"
                  placeholder="Introduza o preço Cash..."
                  state={this.state.validationMessages.PrecoCash}
                  name="PrecoCash"
                  value={this.state.PrecoCash}
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-6">
                <TextBoxNumeric
                  valueType="percent"
                  disabled={this.state.ReadOnly}
                  label="Margem Indicativa:"
                  placeholder="margem Indicativa..."
                  name="U_rsaMargem"
                  value={this.state.U_rsaMargem}
                  onChange={this.onFieldChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-6">
                <Toggle
                  disabled={this.state.ReadOnly}
                  label=""
                  name="Frozen"
                  contentOFF="Activo"
                  contentON="Inactivo"
                  color={Item.Frozen === "tNO" ? "success" : "danger"}
                  value={Item.Frozen !== "tNO"}
                  onChange={this.onFieldChange}
                />
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div>
        <div className="panel">
          {renderLoading()}
          {renderContent()}
        </div>
        <div className="sappy-action-bar animation-slide-left">
          {!this.state.ReadOnly &&
            <Button color="danger" disabled={this.state.saving || this.state.loading} onClick={this.onDeleteArtigo}>
              <i className="icon wb-trash" />
              <span className="hidden-sm-down"> Apagar parceiro </span>
            </Button>}
          {!this.state.ReadOnly &&
            <Button color="success" disabled={this.state.saving || this.state.loading} onClick={this.onSaveArtigo}>
              <i className="icon wb-check" />
              <span className="hidden-sm-down"> Gravar alterações</span>
            </Button>}
        </div>
      </div>
    );
  }
}

export default CmpGeral;
