import React, { Component } from "react";
import axios from "axios";

const sappy = window.sappy;
import ModalOitm from "./ModalOitm";
import OitmPOS from "./OitmPOS";
import BaseDoc from "./BaseDoc";

class SearchAndChoose extends Component {
  constructor(props) {
    super(props);

    this.handleModalSearchClose = this.handleModalSearchClose.bind(this);
    this.handleOnChange_txtSearch = this.handleOnChange_txtSearch.bind(this);
    this.handleOnKeyDown_txtSearch = this.handleOnKeyDown_txtSearch.bind(this);
    this.openSearchModal = this.openSearchModal.bind(this);
    this.handleBarcodeRead = this.handleBarcodeRead.bind(this);
    this.setBarCodeListener = this.setBarCodeListener.bind(this);
    this.getSearchApiUrl = this.getSearchApiUrl.bind(this);

    this.state = {
      searchText: "",
      currentModal: null
    };
  }

  componentDidMount() {
    this.setBarCodeListener();
  }

  componentWillUnmount() {
    sappy.barcodes.onRead(null);
  }

  componentDidUpdate(prevProps, prevState) {
    this.setBarCodeListener();
  }

  setBarCodeListener() {
    let barcodeApiUrl = "";
    let condition = this.props.searchLimitCondition;

    if (this.props.useBaseDoclines) {
      barcodeApiUrl = BaseDoc.barcodeApiUrl;
      condition = this.props.baseDocLinesCondition;
    } else if (this.props.searchType === "oitm") barcodeApiUrl = ModalOitm.barcodeApiUrl;
    else if (this.props.searchType === "oitmpos") barcodeApiUrl = OitmPOS.barcodeApiUrl;
    else sappy.showError(this.props.searchType, "Tipo de pesquisa desconhecido");

    sappy.barcodes.onRead(this.handleBarcodeRead, barcodeApiUrl, condition);
    return barcodeApiUrl;
  }

  getSearchApiUrl() {
    let searchApiUrl = "";
    if (this.props.useBaseDoclines) searchApiUrl = BaseDoc.searchApiUrl;
    else if (this.props.searchType === "oitm") searchApiUrl = ModalOitm.searchApiUrl;
    else if (this.props.searchType === "oitmpos") searchApiUrl = OitmPOS.searchApiUrl;
    else sappy.showError(this.props.searchType, "Tipo de pesquisa desconhecido");

    return searchApiUrl;
  }

  handleBarcodeRead({ barcodes, selectedItems, hasMany } = {}) {
    if (hasMany) {
      this.setState({ searchText: barcodes[0] }, this.performSearch);
    } else {
      this.setState({ searchText: "" });
      this.props.onReturnSelectItems({
        barcodes,
        selectedItems,
        callback: sappy.barcodes.notifyBarcodesProcessed
      });
    }
  }

  handleModalSearchClose(selectedItems) {
    this.setState({ currentModal: null });
    this.props.onReturnSelectItems({ selectedItems });
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
    if (this.props.useBaseDoclines) {
      currentModal = (
        <BaseDoc
          toggleModal={this.handleModalSearchClose}
          useSearchLimit={this.props.useBaseDoclines}
          showCatNum={this.props.showCatNum}
          searchLimitCondition={this.props.baseDocLinesCondition}
          searchText={this.state.searchText}
        />
      );
    } else if (this.props.searchType === "oitm")
      currentModal = (
        <ModalOitm
          toggleModal={this.handleModalSearchClose}
          useSearchLimit={this.props.useSearchLimit}
          showCatNum={this.props.showCatNum}
          searchLimitCondition={this.props.searchLimitCondition}
          searchText={this.state.searchText}
        />
      );
    else if (this.props.searchType === "oitmpos")
      currentModal = (
        <OitmPOS
          toggleModal={this.handleModalSearchClose}
          useSearchLimit={this.props.useSearchLimit}
          showCatNum={this.props.showCatNum}
          searchLimitCondition={this.props.searchLimitCondition}
          searchText={this.state.searchText}
        />
      );
    else sappy.showError(this.props.searchType, "Tipo de pesquisa desconhecido");

    this.setState({ currentModal, searchText: "" });
  }

  performSearch() {
    let that = this;
    let searchApiUrl = this.getSearchApiUrl();

    if (searchApiUrl) {
      let searchLimitCondition = "";

      if (this.props.useBaseDoclines) {
        searchLimitCondition = this.props.baseDocLinesCondition;
      } else if (this.props.useSearchLimit && this.props.searchLimitCondition) searchLimitCondition = this.props.searchLimitCondition;

      if (this.cancelPreviousAxiosRequest) this.cancelPreviousAxiosRequest();
      var CancelToken = axios.CancelToken;
      let { searchText } = this.state;
      this.serverRequest = axios
        .get(searchApiUrl, {
          params: {
            searchTags: [{ value: searchText }],
            searchLimitCondition
          },
          cancelToken: new CancelToken(function executor(c) {
            that.cancelPreviousAxiosRequest = c;
          })
        })
        .then(result => {
          var listItems = result.data.firstRows;
          let found = listItems.length > 0 ? listItems[0].TOTAL_ROWS : 0;

          if (found === 1) {
            let selectedItems;
            if (this.props.useBaseDoclines) selectedItems = [listItems[0].ObjType + "#" + listItems[0].DocEntry + "#" + listItems[0].LineNum];
            else selectedItems = [listItems[0].ItemCode];

            this.props.onReturnSelectItems({ selectedItems });
            that.setState({ searchText: "" });
          } else if (found > 1) {
            that.openSearchModal();
          } else {
            that.setState({ searchText: "" });
            sappy.showWarning({
              title: "Nada encontrado",
              moreInfo: "Não foi possivel encontrar ao procurar por '" + searchText + "'"
            });
          }
        })
        .catch(function(error) {
          if (!error.__CANCEL__) sappy.showError(error, "Api error");
          that.setState({ searchText: "" });
        });
    }
  }

  render() {
    let that = this;
    return (
      <form action="#" role="search" onSubmit={e => e.preventDefault()}>
        {this.state.currentModal}
        <div className="input-search input-search-dark">
          <i className="input-search-icon wb-plus" aria-hidden="true" />

          <input className="form-control w-full" autoComplete="off" value={this.state.searchText} onChange={this.handleOnChange_txtSearch} onKeyDown={this.handleOnKeyDown_txtSearch} />

          <button className="input-search-btn vertical-align-middle">
            {this.props.baseDocLinesCondition &&
              <i className={"icon " + (this.props.useBaseDoclines ? "fa-external-link active" : "fa-external-link inactive")} aria-hidden="true" onMouseDown={that.props.onToogleUseBaseDoclines} />}

            {this.props.searchLimitCondition &&
              <i className={"icon " + (this.props.useSearchLimit ? "ion-ios-funnel active" : "ion-ios-funnel-outline inactive")} aria-hidden="true" onMouseDown={that.props.onToogleUseSearchLimit} />}

            <i className="icon wb-menu" aria-hidden="true" onMouseDown={that.openSearchModal} />
          </button>
        </div>
      </form>
    );
  }
}

SearchAndChoose.defaultProps = {
  searchType: "",
  onReturnSelectItems: selectedItems => {},
  showCatNum: false,

  useBaseDoclines: false,
  baseDocLinesCondition: "",
  onToogleUseBaseDoclines: () => {},

  useSearchLimit: false,
  searchLimitCondition: "",
  onToogleUseSearchLimit: () => {}
};
export default SearchAndChoose;
