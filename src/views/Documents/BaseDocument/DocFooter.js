
import React, { Component } from "react";
import { Button } from "reactstrap";
import ByUsSearchAndChoose from '../../../components/ByUsSearchAndChoose';
const byUs = window.byUs;

class DocFooter extends Component {
  constructor(props) {
    super(props)
    this.state = { currentModal: null }
  }

  render() {
    let docData = this.props.docData || {}
    let editable = docData.DOCNUM > 0 ? false : true;
    let loaded = !this.props.loading;

    let renderActions = () => {
      let actions = this.props.actions;

      return (

        <div id="docFooter-actions" className="animation-DESATIVADA-slide-left"        >
          {actions.map(action => {
            if (!action.visible) return null;
            let btClassName = "btn btn-" + action.color;
            return (
              <button key={"action_" + action.name} type="button" onClick={action.onClick} className={btClassName}>
                <span>
                  <i className={action.icon} aria-hidden="true" />
                  <span className="hidden-sm-down">  {action.name}</span>
                </span>
              </button>
            );
          })}
          <Button color="dark" onClick={this.props.onToggleShowTotals}>
            <span className="hidden-sm-down">Total</span>
            <span id="total-btn-text">
              <strong>
                {"   " + byUs.format.valor(this.props.totals.totalAmount)}
              </strong>
            </span>
            {!this.props.showTotals && <i className="icon wb-dropup" />}
            {this.props.showTotals && <i className="icon wb-dropdown" />}
          </Button>
        </div>

      );
    };
    return (
      <nav id="docFooter" className="site-navbar navbar navbar-default navbar-fixed-bottom" >
        {editable && loaded &&
          <div className="byus-search-bar float-left">
            <ByUsSearchAndChoose
              searchType={this.props.footerSearchType}
              limitSearch={this.props.footerLimitSearch}
              limitSearchCondition={this.props.footerLimitSearchCondition}
              onToogleLimitSearch={this.props.onToogleLimitSearch}
              onReturnSelectItems={this.props.onFooterSearchResult} />
          </div>
        }
        {renderActions()}
      </nav >
    );
  }
}

DocFooter.defaultProps = {
  footerSearchType: "",
  footerLimitSearchCondition: "",
  onFooterSearchResult: selectedItems => { },
  onToogleLimitSearch: () => { },
  totals: {}
}

export default DocFooter;

