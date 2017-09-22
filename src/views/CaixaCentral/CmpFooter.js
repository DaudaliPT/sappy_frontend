import React, { Component } from "react";
class CmpFooter extends Component {

  render() {
    let renderFixedActions = () => {
      let fixedActions = [...this.props.fixedActions];
      let mainAction = fixedActions.shift(1);
      if (!mainAction) return;

      var renderSubActions = () => {
        if (fixedActions.length > 0) {
          return (
            <div key={"action-buttons"} className="sappy-action-buttons animation-scale-up">
              {fixedActions.map(action => {
                let btClassName = "btn btn-floating btn-" + action.color;

                return (
                  <div key={"action_" + action.name}>
                    <button type="button" onClick={action.onClick} className={btClassName}>
                      <i className={"animation-scale " + action.icon} aria-hidden="true" />
                    </button>

                    <span className="sappy-action-fab-tip">{action.name}</span>
                  </div>
                );
              })}
            </div>
          );
        }
      };

      let btClassName = "sappy-action-button btn btn-floating btn-" + mainAction.color;
      return (
        <div key={"action_" + mainAction.name} className="sappy-action">
          <button type="button" onClick={mainAction.onClick} className={btClassName}>
            <i className={mainAction.icon} aria-hidden="true" />
          </button>
          {renderSubActions()}
        </div>
      );
    };
    let renderActions = () => {
      let actions = this.props.actions;

      let renderActionButton = (a) => {
        let btClassName = "btn btn-" + a.color;
        if (a.name === "flash") btClassName += " btn-round btn-outline btn-icon"
        return (
          <button id={a.name} key={a.name} type="button"
            onClick={a.onClick}
            className={btClassName} title={a.title}>
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
        {renderFixedActions()}
      </nav >
    );
  }
}
export default CmpFooter;

