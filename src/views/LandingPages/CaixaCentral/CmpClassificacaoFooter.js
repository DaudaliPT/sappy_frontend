import React, { Component } from "react";
const $ = window.$;
const sappy = window.sappy;
class CmpClassificacaoFooter extends Component {
  constructor(props) {
    super(props)

    this.state = { currentModal: null }
  }

  componentDidUpdate() {
    let $el = $('#flash')
    if ($el.length > 0 && $el[0]) {
      $el.toolbar({
        content: '#flash-toolbar-options',
        style: 'dark',
        event: 'click',
        hideOnClick: true,
        adjustment: 20
      });
    }
  }


  render() {
    // let docData = this.props.docData || {}
    // let editable = docData.DOCNUM > 0 ? false : true;
    // let loaded = !this.props.loading;

    let renderActions = () => {
      let actions = this.props.actions;

      let renderActionButton = (a) => {
        let btClassName = "btn btn-" + a.color;
        if (a.name === "flash") btClassName += " btn-round btn-outline btn-icon"
        return (
          <button id={a.name} key={a.name} type="button" onClick={a.onClick} className={btClassName} title={a.title}>
            <span>
              <i className={a.icon} aria-hidden="true" />
              <span className="hidden-sm-down">  {a.content ? a.content : a.name}</span>
            </span>
            {a.toolbarOptions}
          </button>

        );
      }

      return (

        <div id="docFooter-actions">
          <div className="left">
            {actions.filter(a => a.visible && a.showAtLeft).map(renderActionButton)}
          </div>
          <div className="right">
            {actions.filter(a => a.visible && !a.showAtLeft).map(renderActionButton)}
          </div>
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
  actions: [],
  selectedPN: ""
}

export default CmpClassificacaoFooter;

