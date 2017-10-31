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
        {onLinkClick && <i className="icon fa-arrow-circle-right" aria-hidden="true" onClick={e => onLinkClick(this.props)} />}
        {onLinkClick && " "}
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
          {checkedAPswitch ? ON : OFF}{" "}
        </span>
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
          {checkedAPswitch ? ON : OFF}{" "}
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
          {checked ? ON : OFF}{" "}
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

    let value = this.props.value;
    let dependentValues = this.props.dependentValues || {};
    let countValue = dependentValues[key + "_COUNT"];
    let alertValue = dependentValues[key + "_ALERT"];
    let tagsValue = dependentValues[key + "_TAGS"] || "";

    const renderCount = () => {
      if (countValue > 1) {
        return (
          <span
            key={uuid()}
            style={{
              paddingLeft: "5px",
              color: "rgba(236, 140, 50, 0.5)",
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
        {value}
        {renderCount()}
        {renderAlert()}
        {renderBadges()}
      </div>
    );
  }
}

let Formatters = {
  Default: DefaultFormater,
  Vat: VatFormatter,
  VatPercent: VatPercentFormatter,
  Tags: TagsFormatter,
  Check: CheckboxFormatter,
  Switch: SwitchFormatter,
  Flag: FlagFormatter,
  Discount: DiscountFormatter,
  Bonus: BonusFormatter
};
export default Formatters;
