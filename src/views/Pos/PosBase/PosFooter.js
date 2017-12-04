import React, { Component } from "react";
import { Button } from "reactstrap";
import SearchAndChoose from "../../../components/SearchAndChoose";
const sappy = window.sappy;

class PosFooter extends Component {
  render() {
    let docData = this.props.docData || {};
    let allowAddLines = docData.ID > 0 ? true : false;
    let loaded = !this.props.loading;

    let renderActions = () => {
      let actions = this.props.actions;

      return (
        <div id="posFooter-actions">
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
                      {action.name}
                    </span>
                  </span>
                </button>
              );
            })}
            <Button color="dark" onClick={this.props.onToggleShowTotals}>
              <span className="hidden-sm-down">Total</span>
              <span id="total-btn-text">
                <strong>
                  {"   " + sappy.format.amount(this.props.totals.totalAmount)}
                </strong>
              </span>
              {!this.props.showTotals && <i className="icon wb-dropup" />}
              {this.props.showTotals && <i className="icon wb-dropdown" />}
            </Button>
          </div>
        </div>
      );
    };
    return (
      <nav id="posFooter" className="site-navbar navbar navbar-default navbar-fixed-bottom">
        {allowAddLines &&
          loaded &&
          <div className="sappy-search-bar float-left">
            <SearchAndChoose
              toObjtype={docData.OBJTYPE}
              searchType={this.props.footerSearchType}
              useSearchLimit={this.props.footerLimitSearch}
              useBaseDoclines={this.props.footerUseBaseDoclines}
              searchLimitCondition={this.props.footerSearchLimitCondition}
              baseDocLinesCondition={this.props.footerBaseDocLinesCondition}
              showCatNum={this.props.footerSearchShowCatNum}
              onToogleUseSearchLimit={this.props.onToogleUseSearchLimit}
              onToogleUseBaseDoclines={this.props.onToogleUseBaseDoclines}
              onReturnSelectItems={this.props.onFooterSearchResult}
            />
          </div>}
        {renderActions()}
      </nav>
    );
  }
}

PosFooter.defaultProps = {
  footerSearchType: "",
  footerSearchLimitCondition: "",
  footerBaseDocLinesCondition: "",
  footerSearchShowCatNum: false,
  onFooterSearchResult: selectedItems => {},
  onToogleUseSearchLimit: () => {},
  onToogleUseBaseDoclines: () => {},
  totals: {}
};

export default PosFooter;
