import React, { Component } from "react";
// import { Button } from "reactstrap";
import SearchAndChoose from "../../components/SearchAndChoose";
// const sappy = window.sappy;

class DocFooter extends Component {
  render() {
    let allowAddLines = this.props.editable;
    let loaded = !this.props.loading;

    let renderActions = () => {
      let actions = this.props.actions;

      return (
        <div id="docFooter-actions">
          <div className="left" />
          <div className="right">
            {actions.map(action => {
              if (!action.visible) return null;
              let btClassName = "btn btn-" + action.color;
              return (
                <button key={"action_" + action.name} type="button" onClick={action.onClick} className={btClassName}>
                  <span>
                    <i className={action.icon} aria-hidden="true" />
                    <span className="hidden-sm-down">
                      {" "}{action.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    };
    return (
      <nav id="docFooter" className="site-navbar navbar navbar-default navbar-fixed-bottom">
        {allowAddLines &&
          loaded &&
          <div className="sappy-search-bar float-left">
            <SearchAndChoose
              searchType={this.props.footerSearchType}
              limitSearch={this.props.footerLimitSearch}
              limitSearchCondition={this.props.footerLimitSearchCondition}
              showCatNum={this.props.footerSearchShowCatNum}
              onToogleLimitSearch={this.props.onToogleLimitSearch}
              onReturnSelectItems={this.props.onFooterSearchResult}
            />
          </div>}
        {renderActions()}
      </nav>
    );
  }
}

DocFooter.defaultProps = {
  footerSearchType: "",
  footerLimitSearchCondition: "",
  footerSearchShowCatNum: false,
  onFooterSearchResult: selectedItems => {},
  onToogleLimitSearch: () => {},
  totals: {}
};

export default DocFooter;
