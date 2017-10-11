
import React, { Component } from "react";
import { Button } from "reactstrap";
import "./Panel.css"

class Panel extends Component {
  constructor(props) {
    super(props)
    this.toggleHeader = this.toggleHeader.bind(this)

    this.state = { expanded: props.hasOwnProperty("expanded") ? props.expanded : true }
  }

  toggleHeader() {
    if (this.props.allowCollapse === false) return
    let expanded = !this.state.expanded
    this.setState({ expanded })
  }

  render() {


    let expandIcon = this.state.expanded ? "wb-minus" : "wb-plus";
    let hiddenClass = this.state.expanded ? "" : "hidden-xxl-down";
    let notHiddenClass = this.state.expanded ? "hidden-xxl-down" : "";
    let title = this.props.title;


    let renderActions = () => {
      let DOMactions = [];

      this.props.actions.forEach(action => {
        if (!action.visible) return


        DOMactions.push(<div key={action.name} className="action">
          {action.content && action.content}
          {!action.content &&
            <Button outline color={action.color || "secondary"} className={"btn-sm btn-flat"} onClick={action.onClick} disabled={action.disabled ? true : false}>
              <i className={"icon " + action.icon} />
              <span className="hidden-sm-down"> {action.text}</span>
            </Button>
          }
        </div>)
      });
      return DOMactions;
    }

    return (
      <div className="sappy-panel">
        <div className="title">
          <h3 className="text" onClick={this.toggleHeader}>{title}</h3>
          <span className={"moreinfo " + notHiddenClass}>
            {this.props.colapsedInfo}
          </span>
          <div className="actions">

            {renderActions()}

            {this.props.allowCollapse &&
              <Button outline className="btn-sm btn-flat" onClick={this.toggleHeader}>
                <i className={"icon " + expandIcon} />
              </Button>
            }
          </div>
        </div>
        <div className={"body " + hiddenClass}>
          {this.props.children}
        </div>

      </div>
    );
  }
}

Panel.defaultProps = {
  title: "",
  colapsedInfo: "",
  allowCollapse: true,
  actions: []
}

export default Panel;
