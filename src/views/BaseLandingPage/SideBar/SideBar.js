import React, { Component } from "react";
const $ = window.$;

class SideBar extends Component {
  constructor(props) {
    super(props);

    this.handleToglePageAside = this.handleToglePageAside.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleToglePageAside(e) {
    $(".page-aside").toggleClass("open");
  }

  handleOnClick(e) {
    e.preventDefault();
    var thisA = $(e.target).closest("a")[0];
    let currentItem = thisA.id;
    this.props.onSelect(currentItem);
  }

  render() {
    const renderSubitems = (groupKey, items) => {
      return Object.keys(items).map(key => {
        let item = items[key];
        if (item || groupKey === "Filtros" || key.indexOf("?") > -1) {
          let id = groupKey + "|" + key;
          return (
            <a key={key} className={"list-group-item" + (this.props.activeSidebarItems.indexOf(id) !== -1 ? " active" : "")} id={id} onClick={this.handleOnClick}>
              <div className="row list-group-item-content">
                <div className="col-12 pr-0 ">
                  {key}
                  <span className="badge badge-pill badge-default float-right">
                    {item}
                  </span>
                </div>
              </div>
            </a>
          );
        } else return null;
      });
    };

    const renderCollapsibleGroups = () => {
      return Object.keys(this.props.items).map((groupKey, ix) => {
        let item = this.props.items[groupKey];
        if (Object.keys(item).length === 0) return null;
        return (
          <div key={groupKey} className="panel">
            <div className="panel-heading" id={groupKey} role="tab">
              <a
                className={"panel-title" + (ix < 2 ? "" : " collapsed")}
                data-toggle="collapse"
                href={"#collapse_" + groupKey}
                data-parent="#acordion"
                aria-expanded={ix < 2 ? "true" : "false"}
                aria-controls="collapse_"
              >
                {groupKey}
              </a>
            </div>
            <div className={"panel-collapse collapse" + (ix < 2 ? " show" : "")} id={"collapse_" + groupKey} aria-labelledby={groupKey} role="tabpanel">
              <div className="panel-body">
                {renderSubitems(groupKey, item)}
              </div>
            </div>
          </div>
        );
      });
    };

    return (
      <div className="page-aside">
        <div className="page-aside-switch" onClick={this.handleToglePageAside}>
          <i className="icon wb-chevron-left" aria-hidden="true" />
          <i className="icon wb-chevron-right" aria-hidden="true" />
        </div>
        <div id="page-aside-scroll" className="page-aside-inner page-aside-scroll" style={{ overflow: "auto", height: "100%" }}>
          <div data-role="container">
            <div data-role="content">
              <div className="panel-group" id="acordion" aria-multiselectable="true" role="tablist">
                {renderCollapsibleGroups()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SideBar.defaultProps = {
  titulo: "Grupos",
  items: {},
  activeSidebarItems: [],
  onSelect: item => {}
};
export default SideBar;
