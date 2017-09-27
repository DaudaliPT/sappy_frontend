import React, { Component } from "react";
import axios from 'axios';
var $ = window.$;
var sappy = window.sappy;
import CmpTabContent from "./CmpTabContent";

class Settings extends Component {
  constructor(props) {
    super(props);
    this.handleOnTabClick = this.handleOnTabClick.bind(this);
    this.saveSetting = this.saveSetting.bind(this);
    this.calcPageHeight = this.calcPageHeight.bind(this);

    this.state = {
      ReadOnly: true,
      loading: true,
      settings: {},
      activeTab: "GERAL",
      activeTabName: "Geral"
    }
  }

  componentDidMount() {
    let that = this
    window.addEventListener("resize", this.calcPageHeight);

    axios
      .get(`/api/settings`)
      .then(result => {
        that.setState({ settings: result.data })
      })
      .catch(function (error) {
        if (!error.__CANCEL__) sappy.showError(error, "Api error")
      });

    this.calcPageHeight();
  }

  saveSetting(changeInfo) {
    let that = this
    axios
      .patch(`/api/settings`, changeInfo)
      .then(result => {
        that.setState({ settings: result.data })
      })
      .catch(function (error) {
        if (!error.__CANCEL__) sappy.showError(error, "Api error")
      });

  }
  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcPageHeight);
  }

  calcPageHeight() {
    let $el = $(".main-body");

    let $scrollAbleparent = $("body");
    if ($scrollAbleparent && $el && $el.position) {
      let minH = $scrollAbleparent.height() - $el.position().top - 80;
      $el.css("height", minH.toString() + "px");

      this.setState({ height: minH })
    }
  }

  handleOnTabClick(e) {
    e.preventDefault();
    let tab = e.target.id;
    this.setState({
      activeTab: tab,
      activeTabName: this.state.settings[tab].name
    });
  }

  render() {
    let settings = this.state.settings
    let activeTab = this.state.activeTab
    let activeTabName = this.state.activeTabName
    let tabs = Object.keys(settings);
    let activeTabSettings = (settings[activeTab] || {}).settings || {}

    let renderTabs = () => {
      return tabs.map(tabId => {
        let tab = settings[tabId]
        return <a key={tabId}
          className={"list-group-item list-group-item-action" + (activeTab === tabId ? " active" : "")}
          data-toggle="tab"
          role="tab"
          id={tabId}
          onClick={this.handleOnTabClick}>{tab.name}</a>
      })
    }

    return (
      <div className="page">
        <div className="page-header container-fluid">
          <div className="row">
            <div className="col-md-9    px-md-15 px-0">
              <p className="page-title">
                {this.props.userName
                  ? "Definições de " + this.props.userName
                  : "Definições Gerais"}
                {" - " + activeTabName}
              </p>
            </div>
            <div className="col-md-3    px-md-15 px-0">
              <div className="sappy-action-bar animaDISABELDtion-slide-left">

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
                    {renderTabs()}
                  </div>
                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
            <div className="col-xl-10 col-md-9     px-md-15 px-0">
              {/* <!-- Panel --> */}
              <div className="panel form-panel">
                <div className="panel-body main-body">
                  < CmpTabContent height={this.state.height} settingsTab={activeTab} settings={activeTabSettings} saveSetting={this.saveSetting} />
                </div>
              </div>
              {/* <!-- End Panel --> */}
            </div>
          </div>
        </div>
      </div >)
  }
}

export default Settings;
