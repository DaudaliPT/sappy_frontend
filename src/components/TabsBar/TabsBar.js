import React, { PureComponent } from "react";

class TabsBar extends PureComponent {
  constructor(props) {
    super(props);

    this.handleOnTabClick = this.handleOnTabClick.bind(this);
  }

  handleOnTabClick(e) {
    e.preventDefault();
    let selectedItem = e.target.id;
    this.props.onSelect(selectedItem);
  }

  render() {
    var { items, activeItem } = this.props;
    const renderItems = () => {
      return Object.keys(items).map(key => {
        let classes = (activeItem === key ? "active" : "") + " nav-link";
        return (
          <li key={key} className="nav-item" role="presentation">
            <a className={classes} id={key} data-toggle="tab" role="tab" onClick={this.handleOnTabClick}>
              {key}
            </a>
          </li>
        );
      });
    };

    return (
      <div className="page-nav-tabs hidden-DISABLED-lg-down">
        <ul id="sappy-tabscontent" className="nav nav-tabs nav-tabs-line" role="tablist">
          {renderItems()}
        </ul>
      </div>
    );
  }
}

TabsBar.defaultProps = {
  items: {},
  activeItem: "",
  onSelect: item => { }
};
export default TabsBar;
