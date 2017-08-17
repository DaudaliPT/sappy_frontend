import React, { Component } from "react";
import safeJsonStringify from "safe-json-stringify";
import axios from "axios";

const byUs = window.byUs;
import ModalOitm from './ModalOitm';

class ByUsSearchAndChoose extends Component {
  constructor(props) {
    super(props)

    this.handleModalSearchClose = this.handleModalSearchClose.bind(this)
    this.handleOnChange_txtSearch = this.handleOnChange_txtSearch.bind(this)
    this.handleOnKeyDown_txtSearch = this.handleOnKeyDown_txtSearch.bind(this)
    this.openSearchModal = this.openSearchModal.bind(this)

    this.state = {
      searchText: "",
      currentModal: null
    }
  }

  handleModalSearchClose(selectedItems) {
    this.setState({ currentModal: null });
    this.props.onReturnSelectItems(selectedItems);
  }
  handleOnChange_txtSearch(e) {
    e.preventDefault();

    this.setState({ searchText: e.target.value });
  }

  handleOnKeyDown_txtSearch(e) {
    if (e.keyCode === 13 || e.keyCode === 9) {
      //Tentar adicionar
      this.performSearch();
    }
  }

  openSearchModal() {
    let currentModal = null;
    if (this.props.searchType === "oitm")
      currentModal = <ModalOitm
        toggleModal={this.handleModalSearchClose}
        limitSearch={this.props.limitSearch}
        limitSearchCondition={this.props.limitSearchCondition}
        onToogleLimitSearch={this.props.onToogleLimitSearch}
        searchText={this.state.searchText} />

    else byUs.showError(this.props.searchType, "Tipo de pesquisa desconhecido")

    this.setState({ currentModal, searchText: "" });
  }

  performSearch() {
    let that = this;
    let searchApiUrl = ""
    if (this.props.searchType === "oitm") searchApiUrl = ModalOitm.searchApiUrl;
    else byUs.showError(this.props.searchType, "Tipo de pesquisa desconhecido")

    if (searchApiUrl) {

      let limitSearchCondition = "";
      if (this.props.limitSearch && this.props.limitSearchCondition) limitSearchCondition = this.props.limitSearchCondition;

      if (this.cancelPreviousAxiosRequest) this.cancelPreviousAxiosRequest();
      var CancelToken = axios.CancelToken;
      let { searchText } = this.state;
      this.serverRequest = axios
        .get(searchApiUrl, {
          params: {
            searchTags: [{ value: searchText }],
            limitSearchCondition
          },
          cancelToken: new CancelToken(function executor(c) {
            that.cancelPreviousAxiosRequest = c;
          })
        })
        .then(result => {
          var listItems = result.data.firstRows;
          let found = listItems.length > 0 ? listItems[0].TOTAL_ROWS : 0;

          if (found === 1) {
            let selectedItems = [listItems[0].ItemCode];
            this.props.onReturnSelectItems(selectedItems);
            that.setState({ searchText: "" })
          } else if (found > 1) {
            that.openSearchModal();
          } else {
            that.setState({ searchText: "" })
            byUs.showError("Não encontrado")
          }
        })
        .catch(function (error) {
          if (!error.__CANCEL__) byUs.showError(error, "Api error")
          that.setState({ searchText: "" })
        });
    }
  }

  render() {
    let that = this
    return (
      <form action="#" role="search" onSubmit={e => e.preventDefault()} >
        {this.state.currentModal}
        <div className="input-search input-search-dark">
          <i className="input-search-icon wb-plus" aria-hidden="true" />

          <input className="form-control w-full"
            autoComplete="off" value={this.state.searchText}
            onChange={this.handleOnChange_txtSearch}
            onKeyDown={this.handleOnKeyDown_txtSearch} >
          </input>


          <button className="input-search-btn vertical-align-middle" >
            {this.props.limitSearchCondition &&
              <i className={"icon " + (this.props.limitSearch ? "ion-ios-funnel active" : "ion-ios-funnel-outline inactive")} aria-hidden="true"
                onMouseDown={that.props.onToogleLimitSearch} />
            }
            <i className="icon wb-menu" aria-hidden="true" onMouseDown={that.openSearchModal} />
          </button>

        </div>
      </form >
    );
  }
}

ByUsSearchAndChoose.defaultProps = {
  searchType: "",
  onReturnSelectItems: selectedItems => { },
  limitSearch: false,
  limitSearchCondition: "",
  onToogleLimitSearch: () => { }
};
export default ByUsSearchAndChoose;
