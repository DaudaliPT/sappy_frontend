import React, { Component } from "react";
var $ = window.$;

import CmpClassificacao from "./CmpClassificacao";
import CmpUnderConstruction from "./CmpUnderConstruction";


class CaixaCentral extends Component {
  constructor(props) {
    super(props);

    this.toggleModalMessage = this.toggleModalMessage.bind(this);
    this.handleOnTabClick = this.handleOnTabClick.bind(this);

    this.state = {
      ReadOnly: true,
      loading: true,
      activeTab: "tabClassificacao"
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
  }

  calcPageHeight() {
    let $el = $(".main-body");

    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el) {
      let minH = $scrollAbleparent.height() - $el.position().top - 130;
      $el.css("height", minH.toString() + "px");
    }
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcPageHeight);
  }

  toggleModalMessage(refresh) {
    this.setState({
      modalMessage: {}
    });
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
                Caixa Central
              </p>
            </div>
            <div className="col-md-3    px-md-15 px-0">
              <div className="byus-action-bar animaDISABELDtion-slide-left">

              </div>
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
                    <a className="list-group-item list-group-item-action active" data-toggle="tab" role="tab"
                      id="tabClassificacao" onClick={this.handleOnTabClick}>Classificação </a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabPendentes" onClick={this.handleOnTabClick}>Pendentes</a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabDistribuicao" onClick={this.handleOnTabClick}>Distribuição</a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabDespesas" onClick={this.handleOnTabClick}>Despesas</a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabDepositos" onClick={this.handleOnTabClick}>Depósitos</a>
                    <a className="list-group-item" data-toggle="tab" role="tab"
                      id="tabResumo" onClick={this.handleOnTabClick}>Resumo</a>
                  </div>
                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
            <div className="col-xl-10 col-md-9     px-md-15 px-0">
              {/* <!-- Panel --> */}
              <div className="panel form-panel">
                <div className="panel-body main-body">
                  {/* <div className="tab-content"> */}
                  {this.state.activeTab === "tabClassificacao" &&
                    <div className=" tab-pane animaDISABELDtion-fade active" >
                      <CmpClassificacao
                        ReadOnly={this.state.ReadOnly}>
                      </CmpClassificacao>
                    </div>
                  }
                  {/* {this.state.activeTab === "tabPendentes" &&
                    <div className=" animaDISABELDtion-fade">
                      <CmpUnderConstruction ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  } */}
                  {/* {this.state.activeTab === "tabDistribuicao" &&
                    <div className=" animatDISABELDion-fade">
                      <CmpUnderConstruction ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  } */}
                  {/* {this.state.activeTab === "tabDespesas" &&
                    <div className=" animaDISABELDtion-fade" >
                      <CmpUnderConstruction ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  } */}
                  {/* {this.state.activeTab === "tabDepositos" &&
                    <div className=" animatDISABELDion-fade" >
                      <CmpUnderConstruction ItemCode={this.props.params.itemcode} ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  } */}

                  {/* {this.state.activeTab === "tabResumo" &&
                    <div className=" animatDISABELDion-fade" >
                      <CmpUnderConstruction ReadOnly={this.state.ReadOnly}></CmpUnderConstruction>
                    </div>
                  } */}

                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
          </div>
        </div>
      </div >)
  }
}

export default CaixaCentral;
