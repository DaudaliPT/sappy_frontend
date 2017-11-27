import React, { Component } from "react";
// const sappy = window.sappy;
// const $ = window.$;

const { Menu } = require("react-data-grid/packages/react-data-grid-addons/dist/react-data-grid-addons");

export default class ContextMenu extends Component {
  render() {
    let menus = this.props.menus || [];

    const renderMenus = list => {
      return list.map(menu => {
        if (menu.submenus)
          return (
            <Menu.SubMenu key={menu.text} title={menu.text}>
              {renderMenus(menu.submenus)}
            </Menu.SubMenu>
          );
        let m = (
          <Menu.MenuItem key={menu.text} data={{ rowIdx: this.props.rowIdx, idx: this.props.idx }} onClick={menu.onClick}>
            {menu.text}
          </Menu.MenuItem>
        );
        return m;
      });
    };

    return (
      <Menu.ContextMenu>
        {renderMenus(menus)}
      </Menu.ContextMenu>
    );
  }
}
