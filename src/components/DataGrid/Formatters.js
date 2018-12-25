import React, { Component } from "react";
import uuid from "uuid/v4";
import { Badge } from "reactstrap";
const sappy = window.sappy;

class DefaultFormater extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value;
  }

  render() {
    let { column, dependentValues, rowIdx, value } = this.props;
    let { type, hover, onLinkClick } = column;
    let divID = column.name + rowIdx;
    let onMouseLeave;
    let onMouseEnter;

    if (hover && hover.render && dependentValues) {
      onMouseLeave = e => sappy.hidePopover();

      onMouseEnter = e => {
        let api = hover.api || "";
        Object.keys(dependentValues).forEach(c => (api = api.replace("<" + c + ">", dependentValues[c])));

        sappy.showPopover({
          target: divID,
          api,
          renderContext: { dependentValues, rowIdx, column },
          render: hover.render,
          placement: hover.placement
        });
      };
    }

    let getCellStyle = this.props.column.getCellStyle;
    let classes = "";
    if (getCellStyle && typeof getCellStyle === "function") {
      classes = getCellStyle(this.props);
    }

    let formatedValue;

    if (type === "quantity") formatedValue = value === null ? null : sappy.format.quantity(sappy.getNum(value));
    else if (type === "price") formatedValue = value === null ? null : sappy.format.price(sappy.getNum(value));
    else if (type === "amount") formatedValue = value === null ? null : sappy.format.amount(sappy.getNum(value));
    else if (type === "integer") formatedValue = value === null ? null : sappy.format.integer(sappy.getNum(value));
    else if (type === "date") formatedValue = value === null ? null : sappy.format.date(sappy.unformat.date(value));
    else formatedValue = value;
    let style = {};
    if ("quantity,price,amount,integer".indexOf(type) > -1) style.textAlign = "right";

    return (
      <div id={divID} className={classes} style={style} title={hover ? "" : value} onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter}>
        {onLinkClick && value && <i className="icon fa-arrow-circle-right" aria-hidden="true" onClick={e => onLinkClick(this.props)} />}
        {onLinkClick && value && " "}
        {formatedValue}
      </div>
    );
  }
}

class CheckboxFormatter extends Component {
  render() {
    let checked = this.props.value != null ? this.props.value : false;
    let checkboxName = "checkbox" + this.props.rowIdx;
    let disabled = this.props.column.cellClass === "locked-col"; //por que editable é colocado a false para não permiteir escrever na textbox da coluna

    return (
      <div className="react-grid-checkbox-container checkbox-align">
        <input className="react-grid-checkbox" type="checkbox" name={checkboxName} checked={checked} disabled={disabled} />
        <label htmlFor={checkboxName} className="react-grid-checkbox-label" />
      </div>
    );
  }
}

class BonusFormatter extends Component {
  render() {
    let value = sappy.getNum(this.props.value);
    let showAPswitch = value !== 0; //value.indexOf('BONUS') > -1;
    if (!showAPswitch) return null;

    let checkedAPswitch = this.props.dependentValues["BONUS_NAP"];
    let color = checkedAPswitch ? "warning" : "success";
    let ON = value + " NAP";
    let OFF = value; // + " AP";
    return (
      <div className="switch large">
        <input type="checkbox" checked={checkedAPswitch} />
        <span className={"slider sm round " + color}>
          {checkedAPswitch ? ON : OFF}
        </span>
      </div>
    );
  }
}

class PkposFormatter extends Component {
  render() {
    let props = this.props;
    let value = sappy.getNum(props.value);

    let checkedAPswitch = value > 1;
    let color = checkedAPswitch ? "success" : "danger";

    let dependentValues = this.props.dependentValues || {};
    let QTPK_ORIGINAL = sappy.getNum(dependentValues.QTPK_ORIGINAL);

    if (value !== 1 && value !== QTPK_ORIGINAL) {
      color = "purple";
    }

    let ON = "PK";
    let OFF = "UN";
    return (
      <div style={{ textAlign: "right" }}>
        <button className={"btn btn-sm btn-" + color + " float-left font-size-10"} style={{ lineHeight: "1.4rem", width: "25px" }} onClick={e => props.column.btnClick(e, props)}>
          {checkedAPswitch ? ON : OFF}
        </button>
        {value}
      </div>
    );
  }
}

class DiscountFormatter extends Component {
  render() {
    let value = this.props.value || "";
    let showAPswitch = value.indexOf("BONUS") > -1;
    let checkedAPswitch = this.props.dependentValues["BONUS_NAP"];
    if (!showAPswitch) {
      return (
        <div title={this.props.value}>
          {this.props.value}
        </div>
      );
    }

    let color = checkedAPswitch ? "warning" : "success";
    let ON = "100% NAP";
    let OFF = "100% AP";
    return (
      <div className="switch large">
        <input type="checkbox" checked={checkedAPswitch} />
        <span className={"slider sm round " + color}>
          {checkedAPswitch ? ON : OFF}
        </span>
      </div>
    );
  }
}

class SwitchFormatter extends Component {
  render() {
    let checked = this.props.value != null ? this.props.value : false;
    let condition = this.props.column.condition;
    if (condition) {
      let condVal = this.props.dependentValues[condition];
      if (!condVal) return null;
    }

    let color = this.props.column.color || "success";
    let ON = this.props.column.valueON || "ON";
    let OFF = this.props.column.valueOFF || "OFF";
    return (
      <div className="switch">
        <input type="checkbox" checked={checked} />
        <span className={"slider sm round " + color}>
          {checked ? ON : OFF}
        </span>
      </div>
    );
  }
}

class FlagFormatter extends Component {
  render() {
    let checked = this.props.value != null ? this.props.value : false;
    let ON = this.props.column.valueON || "icon ion-ios-flag";
    let OFF = this.props.column.valueOFF || "icon ion-ios-flag-outline";
    let color = this.props.column.color || "success";

    let classNames = "";
    if (checked) {
      classNames = color + " " + ON;
    } else {
      classNames = "inactive " + OFF;
    }

    return (
      <div className="flag">
        <i className={classNames} aria-hidden="true" />
      </div>
    );
  }
}

class MoreFormatter extends Component {
  render() {
    let { column, dependentValues, rowIdx, value, valueON, valueOFF, color } = this.props;
    let { hover } = column;
    let divID = column.key + rowIdx;
    let onMouseLeave;
    let onMouseEnter;
    let checked = value != null ? value : false;
    valueON = valueON || "icon pe-comment";
    valueOFF = valueOFF || "icon pe-comment";
    color = color || "success";

    if (hover && hover.render && dependentValues) {
      onMouseLeave = e => sappy.hidePopover();

      onMouseEnter = e => {
        let api = hover.api || "";
        Object.keys(dependentValues).forEach(c => (api = api.replace("<" + c + ">", dependentValues[c])));

        sappy.showPopover({
          target: divID,
          api,
          renderContext: { dependentValues, rowIdx, column },
          render: hover.render,
          placement: hover.placement
        });
      };
    }

    let getCellStyle = this.props.column.getCellStyle;
    let classes = "flag";
    if (getCellStyle && typeof getCellStyle === "function") {
      classes += " " + getCellStyle(this.props);
    }

    let iClasses = "";
    if (checked) {
      iClasses += " " + color + " " + valueON;
    } else {
      iClasses += " inactive " + valueOFF;
    }
    let style = {};

    return (
      <div id={divID} className={classes} style={style} title={hover ? "" : value} onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter}>
        <i className={iClasses} aria-hidden="true" />
      </div>
    );
  }
}

class VatFormatter extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value;
  }
  render() {
    let value = this.props.value;
    let row = this.props.dependentValues || {};
    return (
      <div title={value}>
        {value}
        <small>
          {" (" + sappy.getNum(row.TAXRATE) + "%)"}
        </small>
      </div>
    );
  }
}

class VatPercentFormatter extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value;
  }
  render() {
    let value = this.props.value;
    let row = this.props.dependentValues || {};
    return (
      <div title={value}>
        {sappy.getNum(row.TAXRATE) + "%"}
      </div>
    );
  }
}

class TagsFormatter extends Component {
  render() {
    let key = this.props.column.key;

    let { column, rowIdx, value } = this.props;
    let dependentValues = this.props.dependentValues || {};
    let countValue = dependentValues[key + "_COUNT"];
    let alertValue = dependentValues[key + "_ALERT"];
    let tagsValue = dependentValues[key + "_TAGS"] || "";
    let secondLine = dependentValues[key + "_2NDLINE"] || "";

    let { hover } = column;
    let divID = column.name + rowIdx;
    let onMouseLeave;
    let onMouseEnter;

    const renderFirstLine = () => {


      if (secondLine) {
        return (
          <span key={uuid()}
            style={{
              position: "relative",
              top: "-5px"
            }}
          >
            {value}
            <span
              style={{
                top: "16px",
                left: "0px",
                color: "rgba(140, 140, 140, 0.6)",
                position: "absolute",
                fontSize: ".5rem",
                fontWeight: "500"
              }}
            >
              {secondLine}
            </span>
          </span>
        );
      }
      return value
    };

    const renderCount = () => {
      if (countValue > 1) {
        return (
          <span
            key={uuid()}
            style={{
              paddingLeft: "5px",
              color: "rgba(236, 140, 50, 0.8)",
              position: "relative",
              top: "-5px",
              fontSize: ".8rem",
              fontWeight: "500"
            }}
          >
            (x{countValue})
          </span>
        );
      }
      return null;
    };

    const renderAlert = () => {
      if (alertValue) {
        return (
          <span
            key={uuid()}
            style={{
              paddingLeft: "5px",
              color: "rgba(236, 140, 50, 0.9)",
              fontSize: "1.3rem"
            }}
            title={alertValue}
          >
            <i className="icon fa-warning" />
          </span>
        );
      }
      return null;
    };

    const renderMoreInfo = () => {
      if (hover && hover.render && dependentValues) {
        onMouseLeave = e => sappy.hidePopover();

        onMouseEnter = e => {
          let api = hover.api || "";
          Object.keys(dependentValues).forEach(c => (api = api.replace("<" + c + ">", dependentValues[c])));

          sappy.showPopover({
            target: divID,
            api,
            renderContext: { dependentValues, rowIdx, column },
            render: hover.render,
            placement: hover.placement
          });
        };

        return (
          <div
            key={uuid()}
            id={divID}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            style={{
              display: "inline",
              paddingLeft: "5px",
              color: "rgba(100, 100, 100, 0.2)",
              fontSize: "1.3rem"
            }}
          >
            <i className="icon pe-info" />
            {/* <i className="icon ion-ios-information-circle-outline" /> */}
          </div>
        );
      }
      return null;
    };

    const renderBadges = () => {
      const badges = tagsValue.split("|");
      if (badges.map) {
        return badges.map((item, ix) => {
          if (item === "MP") {
            return (
              <Badge key={uuid()} color="primary" pill className="float-right">
                {item}
              </Badge>
            );
          } else if (item === "PV") {
            return (
              <Badge key={uuid()} color="success" pill className="float-right">
                {item}
              </Badge>
            );
          } else {
            return (
              <Badge key={uuid()} color="danger" pill className="float-right">
                {item}
              </Badge>
            );
          }
        });
      }
    };

    return (
      <div>
        {renderFirstLine()}
        {renderCount()}
        {renderAlert()}
        {renderMoreInfo()}
        {renderBadges()}
      </div >
    );
  }
}

let Formatters = {
  Bonus: BonusFormatter,
  Check: CheckboxFormatter,
  Default: DefaultFormater,
  Discount: DiscountFormatter,
  Flag: FlagFormatter,
  More: MoreFormatter,
  Pkpos: PkposFormatter,
  Switch: SwitchFormatter,
  Tags: TagsFormatter,
  Vat: VatFormatter,
  VatPercent: VatPercentFormatter
};
export default Formatters;
