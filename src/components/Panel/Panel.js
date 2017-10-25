import React, { Component } from "react";
import { Button } from "reactstrap";
import uuid from "uuid";
import "./Panel.css";

class Panel extends Component {
  constructor(props) {
    super(props);
    this.toggleHeader = this.toggleHeader.bind(this);
    this.state = {
      expanded: true
    };
  }

  toggleHeader() {
    if (this.props.allowCollapse === false) return;

    if (this.props.onToogleExpand) return this.props.onToogleExpand();

    let expanded = !this.state.expanded;
    this.setState({ expanded });
  }

  render() {
    let expanded = this.props.onToogleExpand
      ? this.props.expanded
      : this.state.expanded;

    let expandIcon = expanded ? "wb-minus" : "wb-plus";
    let hiddenClass = expanded ? "" : "hidden-xxl-down";
    let notHiddenClass = expanded ? "hidden-xxl-down" : "";
    let title = this.props.title;
    let subtitle = this.props.subtitle;
    let allowCollapse = this.props.allowCollapse;

    let renderActions = () => {
      let DOMactions = [];

      this.props.actions.forEach(action => {
        if (!action.visible) return;

        DOMactions.push(
          <div key={action.name} className="action">
            {action.content && action.content}
            {!action.content &&
              <Button
                outline
                color={action.color || "secondary"}
                className={"btn-sm btn-flat"}
                onClick={action.onClick}
                disabled={action.disabled ? true : false}
              >
                <i className={"icon " + action.icon} />
                <span className="hidden-sm-down">
                  {" "}{action.text}
                </span>
              </Button>}
          </div>
        );
      });
      return DOMactions;
    };

    return (
      <div
        id={this.props.name || uuid()}
        className={"sappy-panel " + (!expanded ? "collapsed" : "expanded")}
      >
        {(title || subtitle || allowCollapse) &&
          <div className="title">
            {title &&
              <h4 className="text" onClick={this.toggleHeader}>
                {" "}{title}{" "}
              </h4>}
            {subtitle &&
              <h5 className="text" onClick={this.toggleHeader}>
                {" "}{subtitle}{" "}
              </h5>}
            <span className={"moreinfo " + notHiddenClass}>
              {this.props.colapsedInfo}
            </span>
            <div className="actions">
              {renderActions()}

              {allowCollapse &&
                <Button
                  outline
                  className="btn-sm btn-flat"
                  onClick={this.toggleHeader}
                >
                  <i className={"icon " + expandIcon} />
                </Button>}
            </div>
          </div>}
        <div className={"pbody " + hiddenClass}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

Panel.defaultProps = {
  onToogleExpand: null,
  expanded: true,
  title: "",
  colapsedInfo: "",
  allowCollapse: true,
  actions: []
};

export default Panel;
