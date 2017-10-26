import React, { Component } from "react";

class Pos extends Component {
  render() {
    return (
      <div className="pos">
        {/* <div id="bg">
          <img src="img/posbackground.jpeg" alt="" />
        </div> */}
        <div className="pos-content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Pos;
