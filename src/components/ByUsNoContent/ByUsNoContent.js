import React, { Component } from "react";

class ByUsNoContent extends Component {

  render() {

    return (
      <div style={{ height: "200px", display: "flex" }}>
        <div style={{ margin: "auto", color: "lightgrey" }}>
          <p className="font-size-30 text-center">{this.props.message || "Sem registos"}</p>
        </div>
      </div >
    );
  }
}

export default ByUsNoContent;
