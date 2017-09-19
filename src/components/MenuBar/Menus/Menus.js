import React, { Component } from "react";
import { Link } from "react-router";

export class SubMenu extends Component {
  render() {
    var { menu } = this.props;

    var renderSubMenus = () => {
      return (
        <ul className="site-menu-sub">
          {menu.menus.map(menu => {
            if (menu.dontCreateMenu) return null
            return <SubMenu key={"menu_" + menu.fullName} menu={menu} />;
          })}
        </ul>
      );
    };
    if (menu.menus && menu.menus.length > 0) {
      return (
        <li key={"menu_" + menu.fullName} className="site-menu-item has-sub">
          <a href={menu.href}>
            <span className="site-menu-title">{menu.text}</span>
            <span className="site-menu-arrow" />
          </a>
          {renderSubMenus()}
        </li>
      );
    } else {
      if (menu.href)
        return (
          <li key={"menu_" + menu.fullName} className="site-menu-item">
            <a href={menu.href} target={menu.target}>
              <i className="icon-tag" />
              <span className="site-menu-title">{" " + menu.text}</span>
            </a>
          </li>
        );
      else
        return (
          <li key={"menu_" + menu.fullName} className="site-menu-item">
            <Link to={menu.to}>
              <i className="icon-tag" />
              <span className="site-menu-title">{" " + menu.text}</span>
            </Link>
          </li>
        );
    }
  }
}

export class RootMenu extends Component {
  render() {
    var { menu } = this.props;

    var renderSubMenus = () => {
      return (
        <ul className="site-menubar-light site-menu-sub">
          {menu.menus.map(menu => {
            if (menu.dontCreateMenu) return null
            return <SubMenu key={"subMenu" + menu.fullName} menu={menu} />;
          })}
        </ul>
      );
    };

    if (menu.menus && menu.menus.length > 0) {
      return (
        <li key={"menu_" + menu.fullName} className="sappy-topmenu site-menu-item has-sub">
          <a>
            <span className="site-menu-title">
              <i className={"site-menu-icon " + menu.icon || ""} aria-hidden="true" />
              <span className="hidden-md-up">{menu.text}</span>
              <span className="hidden-lg-down">{menu.text}</span>
            </span>
            <span className="site-menu-arrow" />
          </a>
          {renderSubMenus()}
        </li>
      );
    } else {
      return (
        <li key={"menu_" + menu.fullName} className="sappy-topmenu site-menu-item ">
          <Link to={menu.to}>
            <span className="site-menu-title">
              <i className={"site-menu-icon " + menu.icon || ""} />
              <span className="hidden-md-up">{menu.text}</span>
              <span className="hidden-lg-down">{menu.text}</span>
            </span>
          </Link>
        </li>
      );
    }
  }
}

export default RootMenu;
