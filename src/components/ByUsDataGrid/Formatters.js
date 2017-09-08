import React, { Component } from "react";
import uuid from "uuid/v4";
import { Badge } from "reactstrap";
const byUs = window.byUs;

class DefaultFormater extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.value !== this.props.value;
    }
    render() {
        let { column, dependentValues, rowIdx, value } = this.props;
        let { type, hover, onLinkClick } = column
        let divID = column.name + rowIdx;
        let onMouseLeave;
        let onMouseEnter;

        if (hover) onMouseLeave = e => byUs.hidePopover();
        if (hover && dependentValues) onMouseEnter = e => {
            let api = hover.api;
            Object.keys(dependentValues).forEach(c => api = api.replace("<" + c + ">", dependentValues[c]));

            byUs.showPopover({
                target: divID,
                api,
                renderContext: { dependentValues, rowIdx, column },
                render: hover.render,
                placement: hover.placement
            });
        }

        let formatedValue;

        if (type === "quantity") formatedValue = byUs.format.quantity(byUs.getNum(value))
        else if (type === "price") formatedValue = byUs.format.price(byUs.getNum(value))
        else if (type === "amount") formatedValue = byUs.format.amount(byUs.getNum(value))
        else if (type === "integer") formatedValue = byUs.format.integer(byUs.getNum(value))
        else formatedValue = value;
        let style = {};
        if ("quantity,price,amount,integer".indexOf(type) > -1) style.textAlign = "right";

        return (
            <div id={divID}
                style={style}
                title={hover ? '' : value}
                onMouseLeave={onMouseLeave}
                onMouseEnter={onMouseEnter}>
                {onLinkClick && <i className="icon fa-arrow-circle-right" aria-hidden="true" onClick={e => onLinkClick(this.props)} />}
                {onLinkClick && " "}
                {formatedValue}
            </div >);
    }
}


class CheckboxFormatter extends Component {
    render() {
        let checked = this.props.value != null ? this.props.value : false;
        let checkboxName = "checkbox" + this.props.rowIdx;
        let disabled = this.props.column.cellClass === "locked-col"; //por que editable é colocado a false para não permiteir escrever na textbox da coluna

        return (
            <div className="react-grid-checkbox-container checkbox-align" >
                <input className="react-grid-checkbox" type="checkbox" name={checkboxName} checked={checked} disabled={disabled} />
                <label htmlFor={checkboxName} className="react-grid-checkbox-label" />
            </div>
        );
    }
}


class BonusFormatter extends Component {
    render() {
        let value = byUs.getNum(this.props.value);
        let showAPswitch = value !== 0;//value.indexOf('BONUS') > -1;
        if (!showAPswitch) return null


        let checkedAPswitch = this.props.dependentValues["BONUS_NAP"];
        let color = checkedAPswitch ? "warning" : "success";
        let ON = value + " NAP";
        let OFF = value; // + " AP";
        return (
            <div className="switch large">
                <input type="checkbox" checked={checkedAPswitch} />
                <span className={"slider sm round " + color}>{checkedAPswitch ? ON : OFF} </span>
            </div>
        );
    }
}

class DiscountFormatter extends Component {
    render() {
        let value = this.props.value || '';
        let showAPswitch = value.indexOf('BONUS') > -1;
        let checkedAPswitch = this.props.dependentValues["BONUS_NAP"];
        if (!showAPswitch) {
            return (
                <div title={this.props.value} >
                    {this.props.value}
                </div >)
        }

        let color = checkedAPswitch ? "warning" : "success";
        let ON = "100% NAP";
        let OFF = "100% AP";
        return (
            <div className="switch large">
                <input type="checkbox" checked={checkedAPswitch} />
                <span className={"slider sm round " + color}>{checkedAPswitch ? ON : OFF} </span>
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
                <span className={"slider sm round " + color}>{checked ? ON : OFF} </span>
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
            classNames = color + " " + ON
        } else {
            classNames = "inactive " + OFF
        }

        return (
            <div className="flag">
                <i className={classNames} aria-hidden="true" />
            </div >
        );
    }
}

class VatFormatter extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.value !== this.props.value;
    }
    render() {
        let value = this.props.value;
        let row = this.props.dependentValues;
        return (
            <div title={value} >
                {value}
                <small>{" (" + byUs.getNum(row.TAXRATE) + '%)'}</small>
            </div >);
    }
}


class TagsFormatter extends Component {
    render() {
        let tagsValue = this.props.value;

        if (this.props.dependentValues.hasOwnProperty(this.props.column.key + "_WITH_TAGS")) {
            tagsValue = this.props.dependentValues[this.props.column.key + "_WITH_TAGS"]
        }

        const badges = tagsValue.split("|");

        const renderBadges = () => {
            if (badges.map) {
                return badges.map((item, ix) => {
                    if (ix === 0) {
                        return item;
                    } else if (item === "MP") {
                        return <Badge key={uuid()} color="primary" pill>{item}</Badge>;
                    } else if (item === "PV") {
                        return <Badge key={uuid()} color="success" pill>{item}</Badge>;
                    } else {
                        return <Badge key={uuid()} color="danger" pill>{item}</Badge>;
                    }
                });
            }
        };

        return (
            <div>
                {renderBadges()}
            </div>
        );
    }
}


let Formatters = {
    Default: DefaultFormater,
    Vat: VatFormatter,
    Tags: TagsFormatter,
    Check: CheckboxFormatter,
    Switch: SwitchFormatter,
    Flag: FlagFormatter,
    Discount: DiscountFormatter,
    Bonus: BonusFormatter
}
export default Formatters;