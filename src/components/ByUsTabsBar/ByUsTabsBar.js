import React, { PureComponent } from "react";

class ByUsTabsBar extends PureComponent {
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
      <div className="page-nav-tabs hidden-lg-down">
        <ul id="byus-tabscontent" className="nav nav-tabs nav-tabs-line" role="tablist">
          {renderItems()}
        </ul>
      </div>
    );
  }
}

ByUsTabsBar.defaultProps = {
  items: {},
  activeItem: "",
  onSelect: item => { }
};
export default ByUsTabsBar;
