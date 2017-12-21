import React, { Component } from "react";
var $ = window.$;

import CmpPorPagar from "./CmpPorPagar";
import CmpUltPagamentos from "./CmpUltPagamentos";

class Pagamentos extends Component {
  constructor(props) {
    super(props);
    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.calcPageHeight = this.calcPageHeight.bind(this);

    this.state = {
      ReadOnly: true,
      loading: true,
      activeTab: "Por Pagar"
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcPageHeight);
  }

  calcPageHeight() {
    let $el = $(".main-body");

    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el && $el.position) {
      let minH = $scrollAbleparent.height() - $el.position().top - 130;
      $el.css("height", minH.toString() + "px");

      this.setState({ height: minH });
    }
  }

  handleOnTabClick(e) {
    e.preventDefault();
    let tab = e.target.id;
    this.setState({ activeTab: tab });
  }

  render() {
    return (
      <div className="page">
        <div className="page-header container-fluid">
          <div className="row">
            <div className="col-md-9    px-md-15 px-0">
              <p className="page-title">
                Pagamentos - {this.state.activeTab}
              </p>
            </div>
            <div className="col-md-3    px-md-15 px-0">
              <div className="sappy-action-bar animaDISABELDtion-slide-left" />
            </div>
          </div>
        </div>
        <div className="page-content container-fluid">
          <div className="row">
            <div className="col-xl-2 col-md-3    px-md-15 px-0">
              {/* <!-- Panel --> */}
              <div className="panel">
                <div className="panel-body ">
                  <div className="list-group faq-list" role="tablist">
                    <a className="list-group-item list-group-item-action active" data-toggle="tab" role="tab" id="Por Pagar" onClick={this.handleOnTabClick}>
                      Por Pagar
                    </a>
                    <a className="list-group-item list-group-item-action" data-toggle="tab" role="tab" id="Ultimos Pagamentos" onClick={this.handleOnTabClick}>
                      Últ. Pagamentos
                    </a>
                  </div>
                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
            <div className="col-xl-10 col-md-9     px-md-15 px-0">
              {/* <!-- Panel --> */}
              <div className="panel form-panel">
                <div className="panel-body main-body">
                  {this.state.activeTab === "Por Pagar" && <CmpPorPagar height={this.state.height} />}
                  {this.state.activeTab === "Ultimos Pagamentos" && <CmpUltPagamentos height={this.state.height} />}
                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Pagamentos;
