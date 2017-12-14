import React, { Component } from "react";
import { Button } from "reactstrap";
import uuid from "uuid";
import "./Panel.css";
import DocBadges from "../DocBadges";

import Menu from "../ReactMenu";
var MenuTrigger = Menu.MenuTrigger;
var MenuOptions = Menu.MenuOptions;
var MenuOption = Menu.MenuOption;

class Panel extends Component {
  constructor(props) {
    super(props);
    this.toggleHeader = this.toggleHeader.bind(this);
    this.state = {
      expanded: true
    };
  }

  toggleHeader() {
    if (this.props.allowCollapse === false) return;

    if (this.props.onToogleExpand) return this.props.onToogleExpand();

    let expanded = !this.state.expanded;
    this.setState({ expanded });
  }

  render() {
    let expanded = this.props.onToogleExpand ? this.props.expanded : this.state.expanded;

    let expandIcon = expanded ? "fa-angle-up" : "fa-angle-down";
    let hiddenClass = expanded ? "" : "hidden-xxl-down";
    let notHiddenClass = expanded ? "hidden-xxl-down" : "";
    let title = this.props.title;
    let tags = this.props.tags;
    let subtitle = this.props.subtitle;
    let allowCollapse = this.props.allowCollapse;

    let renderActions = () => {
      let DOMelements = [];

      this.props.actions.forEach(action => {
        if (!action.visible) return;

        DOMelements.push(
          <div key={action.name} id={action.name} className="action">
            {action.content && action.content}
            {!action.content &&
              <Button outline color={action.color || "secondary"} className={"btn-sm btn-flat"} onClick={action.onClick} disabled={action.disabled ? true : false}>
                <i className={"icon " + action.icon} />
                <span className="hidden-sm-down">
                  {action.text}
                </span>
              </Button>}
          </div>
        );
      });
      return DOMelements;
    };

    let renderMenu = () => {
      let DOMmenus = [];

      this.props.menus.forEach(menu => {
        if (!menu.visible) return;

        if (menu.content)
          return DOMmenus.push(
            <MenuOption key={"menu_" + menu.name} onSelect={menu.onClick}>
              <i className={"icon " + menu.icon} />
              <span className="menutext">
                {menu.name}
              </span>
              {menu.content}
            </MenuOption>
          );

        DOMmenus.push(
          <MenuOption key={"menu_" + menu.name} onSelect={menu.onClick}>
            <i className={"icon " + menu.icon} />
            <span className="menutext">
              {menu.name}
            </span>
          </MenuOption>
        );
      });
      if (DOMmenus.length === 0) return null;
      return (
        <Menu className="action " preferredHorizontal="left">
          <MenuTrigger>
            <Button outline className="btn-sm btn-flat">
              <i className={"icon fa-navicon"} />
            </Button>
          </MenuTrigger>
          <MenuOptions>
            {DOMmenus}
          </MenuOptions>
        </Menu>
      );
    };

    return (
      <div id={this.props.name || uuid()} className={"sappy-panel " + (!expanded ? "collapsed" : "expanded")}>
        {(title || subtitle || allowCollapse) &&
          <div className="title">
            {title &&
              <h4 className="text" onClick={this.toggleHeader}>
                {title}
              </h4>}

            <DocBadges tags={tags} />

            {subtitle &&
              <h5 className="text" onClick={this.toggleHeader}>
                {subtitle}
              </h5>}
            <span className={"moreinfo " + notHiddenClass}>
              {this.props.colapsedInfo}
            </span>
            <div className="actions">
              {renderActions()}
              {renderMenu()}
              {allowCollapse &&
                <Button outline className="btn-sm btn-flat" onClick={this.toggleHeader}>
                  <i className={"icon " + expandIcon} />
                </Button>}
            </div>
          </div>}
        <div className={"pbody " + hiddenClass}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

Panel.defaultProps = {
  onToogleExpand: null,
  expanded: true,
  title: "",
  colapsedInfo: "",
  allowCollapse: true,
  actions: [],
  menus: []
};

export default Panel;
