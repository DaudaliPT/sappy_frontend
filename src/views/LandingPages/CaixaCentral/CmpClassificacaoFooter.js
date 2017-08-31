
import React, { Component } from "react";
class CmpClassificacaoFooter extends Component {
  constructor(props) {
    super(props)
    this.state = { currentModal: null }
  }

  render() {
    // let docData = this.props.docData || {}
    // let editable = docData.DOCNUM > 0 ? false : true;
    // let loaded = !this.props.loading;

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
                  <span className="hidden-sm-down">  {action.content ? action.content : action.name}</span>
                </span>
              </button>
            );
          })}
        </div>

      );
    };
    return (
      <nav id="docFooter" className="site-navbar navbar navbar-default navbar-fixed-bottom" >
        {renderActions()}
      </nav >
    );
  }
}

CmpClassificacaoFooter.defaultProps = {
  actions: []
}

export default CmpClassificacaoFooter;

