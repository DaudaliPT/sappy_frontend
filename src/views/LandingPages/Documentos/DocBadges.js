import React, { Component } from "react";
import { Badge } from "reactstrap";
import uuid from "uuid/v4";

class DocBadges extends Component {
  render() {
    const renderBadges = () => {
      const badges = this.props.tags.split("|");
      return badges.map((item, ix) => {
        let color = item.split("_")[0];
        let text = item.split("_")[1];
        return <Badge key={uuid()} color={color} pill>{text}</Badge>;
      });
    };
    return <span> {renderBadges()} </span>;
  }
}

export default DocBadges;
