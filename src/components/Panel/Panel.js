
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
    let expanded = !this.state.expanded
    this.setState({ expanded })
  }

  render() {


    let expandIcon = this.state.expanded ? "wb-minus" : "wb-plus";
    let hiddenClass = this.state.expanded ? "" : "hidden-xxl-down";
    let notHiddenClass = this.state.expanded ? "hidden-xxl-down" : "";

    let editIcon = this.props.editable ? "wb-close" : "wb-edit";
    let title = this.props.title;

    return (
      <div className="sappy-panel">
        <div className="title">
          <h3 className="text" onClick={this.toggleHeader}>{title}</h3>
          <span className={"moreinfo " + notHiddenClass}>
            {this.props.colapsedInfo}
          </span>
          <div className="actions">

            {/* {this.props.docData.DOCNUM &&
              <div className="action">
                <Button outline className="btn-sm btn-flat" onClick={this.props.toggleEditable}>
                  <i className={"icon " + editIcon} />
                  <span className="hidden-sm-down"> Alterar</span>
                </Button>
              </div>} */}

            <Button outline className="btn-sm btn-flat" onClick={this.toggleHeader}>
              <i className={"icon " + expandIcon} />
            </Button>
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
  title: "Panel title",
  colapsedInfo: "(more info...)",
}

export default Panel;
