import React, { Component } from "react";
import { Button } from "reactstrap";
import axios from "axios";
// var $ = window.$;
var sappy = window.sappy;
import { TextBox, ComboBox, Toggle } from "../../Inputs";
import { hashHistory } from "react-router";

const getInitialState = function(props) {
  let Item = props.Item || {};

  let supplierCollection = props.supplierCollection || [];
  let BPAddresses = props.BPAddresses || [];

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
    BPAddresses,
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
    this.onClick_AddAddress = this.onClick_AddAddress.bind(this);
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
    // let that = this;
    // let formatedValue = changeInfo.formatedValue;
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
    } else if (fieldName.indexOf("ADDRESS_") > -1) {
      let parts = fieldName.split("_"); // ADDRESS_1_CODES
      let ix = parseInt(parts[1], 10);
      let slField = parts[2];

      let BPAddresses = [...this.state.BPAddresses];
      let item = BPAddresses[ix];

      Object.assign(item, { [slField]: val });

      newStateValues = { ...newStateValues };
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
              BPAddresses: that.state.BPAddresses,

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

  onClick_AddAddress(cmpThis) {
    let BPAddresses = [...this.state.BPAddresses];

    if (cmpThis.props.rightButton === "-") {
      let ix = cmpThis.props.name.split("_")[1]; // expect: Supplier_1_Substitute
      BPAddresses.splice(ix, 1);
    } else {
      BPAddresses.push({});
    }

    this.setState({ BPAddresses });
  }

  render() {
    let Item = this.state.Item || {};
    // let ItemBarCodeCollection = Item.ItemBarCodeCollection || [];

    var renderAdresses = () => {
      let ret = [];
      let { BPAddresses } = this.state;

      for (var index = 0; index < BPAddresses.length; index++) {
        let ALLTYPES_field = "ADDRESS_" + index + "_ALLTYPES";
        let CODES_field = "ADDRESS_" + index + "_CODES";
        let Street_field = "ADDRESS_" + index + "_Street";
        let Block_field = "ADDRESS_" + index + "_Block";
        // let Country_field = "ADDRESS_" + index + "_Country";
        let ZipCode_field = "ADDRESS_" + index + "_ZipCode";
        let City_field = "ADDRESS_" + index + "_City";

        let bc = BPAddresses[index] || {};

        ret.push(
          <div key={"div1" + CODES_field} className="row">
            <div className="col-6 pr-0">
              <ComboBox
                label="Morada para"
                disabled={this.state.ReadOnly}
                placeholder="Selecione o tipo..."
                value={bc.ALLTYPES}
                name={ALLTYPES_field}
                state={this.state.validationMessages[ALLTYPES_field]}
                options={[{ value: "S,B", label: "Entrega e Faturação" }, { value: "S", label: "Entrega" }, { value: "B", label: "Faturação" }]}
                onChange={this.onFieldChange}
              />
            </div>
            <div className="col-6 pl-0">
              <TextBox
                label="Código"
                placeholder={"Código..."}
                value={bc.CODES}
                name={CODES_field}
                state={this.state.validationMessages[CODES_field]}
                disabled={this.state.ReadOnly}
                onChange={this.onFieldChange}
                rightButton={this.state.ReadOnly ? "" : index === 0 ? "" : "-"}
                onRightButtonClick={this.onClick_AddAddress}
              />
            </div>
            <div className="col-12">
              <TextBox placeholder={"Rua..."} value={bc.Street} name={Street_field} state={this.state.validationMessages[Street_field]} disabled={this.state.ReadOnly} onChange={this.onFieldChange} />
            </div>
            <div className="col-8 pr-0">
              <TextBox placeholder={"Zona..."} value={bc.Block} name={Block_field} state={this.state.validationMessages[Block_field]} disabled={this.state.ReadOnly} onChange={this.onFieldChange} />
            </div>
            <div className="col-4 pl-0">
              <ComboBox name="PurchaseVATGroup" disabled={this.state.ReadOnly} placeholder="Pais..." value={bc.Country} getOptionsApiRoute="/api/cbo/ocry" onChange={this.onFieldChange} />
            </div>
            <div className="col-4 pr-0">
              <TextBox
                placeholder={"Localidade..."}
                value={bc.ZipCode}
                name={ZipCode_field}
                state={this.state.validationMessages[ZipCode_field]}
                disabled={this.state.ReadOnly}
                onChange={this.onFieldChange}
              />
            </div>
            <div className="col-8 pl-0 ">
              <TextBox
                placeholder={"Localidade..."}
                value={bc.City}
                name={City_field}
                state={this.state.validationMessages[City_field]}
                disabled={this.state.ReadOnly}
                onChange={this.onFieldChange}
                rightButton={this.state.ReadOnly ? "" : index + 1 === BPAddresses.length ? "+" : ""}
                onRightButtonClick={this.onClick_AddAddress}
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
              label="Nome:"
              disabled={this.state.ReadOnly}
              placeholder="Introduza o nome..."
              state={this.state.validationMessages.CardName}
              value={Item.CardName}
              onChange={this.onFieldChange}
            />
            <div className="row">
              <div className="col-6 pr-0">
                <TextBox
                  name="LicTradNum"
                  label="Nr.Contribuinte:"
                  disabled={this.state.ReadOnly}
                  placeholder="Contribuinte..."
                  state={this.state.validationMessages.LicTradNum}
                  value={Item.LicTradNum}
                  onChange={this.onFieldChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-4 pr-0">
                <TextBox
                  name="Phone1"
                  label="Telefone:"
                  disabled={this.state.ReadOnly}
                  placeholder="Telefone..."
                  state={this.state.validationMessages.Phone1}
                  value={Item.Phone1}
                  onChange={this.onFieldChange}
                />
              </div>
              <div className="col-4 pl-0 pr-0">
                <TextBox name="Fax" label="Fax:" disabled={this.state.ReadOnly} placeholder="Fax..." state={this.state.validationMessages.Fax} value={Item.Fax} onChange={this.onFieldChange} />
              </div>
              <div className="col-4 pl-0 ">
                <TextBox
                  name="Cellular"
                  label="Telemóvel:"
                  disabled={this.state.ReadOnly}
                  placeholder="Telemóvel..."
                  state={this.state.validationMessages.Cellular}
                  value={Item.Cellular}
                  onChange={this.onFieldChange}
                />
              </div>
            </div>
            <TextBox
              name="E_Mail"
              label="Email:"
              disabled={this.state.ReadOnly}
              placeholder="Email..."
              state={this.state.validationMessages.E_Mail}
              value={Item.E_Mail}
              onChange={this.onFieldChange}
            />

            <ComboBox
              label="Propriedades:"
              placeholder="Propriedades..."
              name="Propriedades"
              multi={true}
              disabled={this.state.ReadOnly}
              value={this.state.Propriedades}
              getOptionsApiRoute="/api/cbo/ocqg"
              onChange={this.onFieldChange}
            />
            <TextBox type="textarea" name="Free_Text" label="Observações:" disabled={this.state.ReadOnly} placeholder="Observações..." value={Item.Free_Text || ""} onChange={this.onFieldChange} />
          </div>
          <div className="col-lg-6">
            <h5 className="section-title" style={{ marginBottom: "0px" }}>
              Moradas
            </h5>

            {renderAdresses()}

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
