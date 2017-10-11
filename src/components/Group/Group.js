
import React, { Component } from "react";
import { Button } from "reactstrap";
import "./Group.css"
class Group extends Component {
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
      <div className="sappy-group">
        <div className="title">
          {/* <h3 className="text" onClick={this.toggleHeader}>{title}</h3> */}
          {<h3 className="text" >{title}</h3>}
          <span className={"moreinfo " + notHiddenClass}>
            {this.props.colapsedInfo}
          </span>
        </div>
        <div className={"body " + hiddenClass}>
          {this.props.children}
        </div>

      </div>
    );
  }
}

Group.defaultProps = {
  title: "",
  colapsedInfo: "",
}

export default Group;
