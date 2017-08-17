import React, { Component } from "react";
import uuid from 'uuid';
const $ = window.$;

class ByUsSearchBar extends Component {
  constructor(props) {
    super(props);

    this.txtName = "txtSearchTokenfield" + uuid();
    this.state = {
      searchTags: props.searchTags
    };
  }

  componentDidMount() {
    let that = this;

    setTimeout(() => {
      $('#' + that.txtName)
        .on('tokenfield:createdtoken', function (e) {
          let values = $('#' + that.txtName).tokenfield('getTokens');
          that.props.onChange(values);
        })
        .on('tokenfield:removedtoken', function (e) {
          let values = $('#' + that.txtName).tokenfield('getTokens');
          that.props.onChange(values);
        })
        .tokenfield()
        .tokenfield('setTokens', that.state.searchTags);

    }, 0)

    setTimeout(() => {
      $(".token-input").focus()
    }, 1000)
  }

  render() {
    let that = this
    let { totalInfo } = this.props;
    return (
      <form
        className="mt-20"
        action="#"
        role="search"
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <div className="input-search" >
          <i className="input-search-icon wb-search" aria-hidden="true" />
          <div className="tokenfield" id={that.txtName}  >
            <input type="text" className="form-control w-full" tabIndex="1" ref="txtSearch" {...this.props.inputProps} />
          </div>


          <button className="input-search-btn vertical-align-middle"          >
            <small>{totalInfo.Searching ? "(A pesquisar...)   " : totalInfo.Loaded + "/" + totalInfo.Total + "   "}</small>

            {this.props.limitSearchCondition &&
              <i className={"icon " + (this.props.limitSearch ? "ion-ios-funnel active" : "ion-ios-funnel-outline inactive")} aria-hidden="true"
                onMouseDown={that.props.onToogleLimitSearch} />
            }
            <i className="icon wb-close" aria-hidden="true" onMouseDown={e => {
              /** o onClick funcionava com o Enter */
              e.preventDefault();
              $('#' + that.txtName).tokenfield('setTokens', []);
              this.props.onChange([]);
            }} />

          </button>
        </div>
      </form>
    );
  }
}
ByUsSearchBar.defaultProps = {
  totalInfo: {
    Total: 0,
    Loaded: 0,
    Searching: true
  },
  onChange: () => { },
  searchTags: [],
  inputProps: {
    placeholder: "Procurar..."
  },
  onClickClear: item => { },

  limitSearch: false,
  limitSearchCondition: "",
  onToogleLimitSearch: () => { }
};
export default ByUsSearchBar;
