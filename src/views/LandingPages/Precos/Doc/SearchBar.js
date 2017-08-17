import React, { Component } from "react";

class SearchBar extends Component {
  render() {
    return (
      <form
        action="#"
        role="search"
        onSubmit={e => {
          e.preventDefault();
        }}
      >

        <div className="input-search input-search-dark">
          <i className="input-search-icon wb-plus" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            className="form-control w-full"
            id="txtSearch"
            autoComplete="off"
            ref="txtSearch"
            {...this.props.inputProps}
          />

          <button
            className="input-search-btn vertical-align-middle"
            onMouseDown={e => {
              /** o onClick funcionava com o Enter */
              e.preventDefault();
              this.props.onClickClear();
            }}
          >

            <i className="icon wb-menu" aria-hidden="true" />

          </button>

        </div>


      </form>
    );
  }
}
SearchBar.defaultProps = {
  totalInfo: {
    Total: 0,
    Loaded: 0,
    Searching: false
  },
  inputProps: {
    placeholder: "Procurar...",
    onChange: () => { },
    value: ""
  },
  onClickClear: item => { }
};
export default SearchBar;
