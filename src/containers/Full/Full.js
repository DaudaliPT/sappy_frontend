import React, { Component } from "react";
import MenuBar from "../../components/MenuBar";

class Full extends Component {
  render() {
    return (
      <div className="app">
        <MenuBar {...this.props} />
        <div className="app-body">
          <main className="main">
            <div className="container-fluid">
              {this.props.children}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Full;
