import React, { Component } from "react";
import axios from "axios";
import VirtualizedInfiniteLoader from "../VirtualizedInfiniteLoader";
import ByUsSearchBar from "../ByUsSearchBar";
import ByUsTabsBar from "../ByUsTabsBar";
import ByUsNoContent from "../ByUsNoContent";
import uuid from 'uuid';
const byUs = window.byUs;
const $ = window.$;

class ByUsSearchPage extends Component {
  constructor(props) {
    super(props);

    this.findAndGetFirstRows = this.findAndGetFirstRows.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);
    this.handleOnTabSelect = this.handleOnTabSelect.bind(this);
    this.handeOnSideBarSelect = this.handeOnSideBarSelect.bind(this);
    this.handleOnChange_txtSearch = this.handleOnChange_txtSearch.bind(this);
    this.calcPageHeight = this.calcPageHeight.bind(this);

    this.byusModalInfiniteListID = 'byusModalInfiniteList' + uuid();
    this.state = {

      /** holds the text typed by the user */
      searchTags: (props.searchText && [{ value: props.searchText, label: props.searchText }]) || [],

      /*********/
      /** contains the items to put on sidebar, organized by groups */
      hierarquyItems: {},
      /** contains the ids of sidebar items selected to filter data */
      activeSidebarItems: [],

      /*********/
      /** list of items to put on tabs bar */
      tabItems: {},
      /** contains the active selected tab id */
      activeTab: "",

      /*********/
      /** contains the loaded rows for virtalized-list */
      listItems: [],
      rvIsLoading: true,
      /** set when loading first or next rows, so that no more requests are made */
      rvHasNextPage: false,

      /*********/
      /** contains info about loading status, to display on search bar */
      totalInfo: {
        Total: 0,
        Loaded: 0,
        Searching: true
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchText !== this.props.searchText
      || nextProps.searchApiUrl !== this.props.searchApiUrl
      || nextProps.currentModal !== this.props.currentModal
    ) {
      setTimeout(this.findAndGetFirstRows, 1);
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
    setTimeout(this.findAndGetFirstRows, 1);
  }

  calcPageHeight() {
    //Não sei porquê ficava a página ficava cortada ás vezes

    function getScrollParent(element, includeHidden) {
      var style = getComputedStyle(element);
      var excludeStaticParent = style.position === "absolute";
      var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

      if (style.position === "fixed") return document.body;
      // eslint-disable-next-line 
      for (var parent = element; (parent = parent.parentElement);) {
        style = getComputedStyle(parent);
        if (excludeStaticParent && style.position === "static") {
          continue;
        }
        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
      }

      return document.body;
    }

    let $el = $("#" + this.byusModalInfiniteListID);
    if ($el[0]) {

      let $body = $("body");
      let scrollAbleparent = getScrollParent($el[0], false);
      let $scrollAbleparent = $(scrollAbleparent);

      // let $body = $("body");
      if ($scrollAbleparent && $el && $body) {
        let bodyHeight = $body.height();
        let parentHeight = $scrollAbleparent.height();
        let useHeight = 0;
        if (parentHeight > bodyHeight)
          useHeight = bodyHeight
        else
          useHeight = parentHeight


        let minH = useHeight - $el.position().top - 150;
        if (minH < 350) { minH = 350; }
        $el.css("height", minH.toString() + "px");
      }
    }
  }

  componentWillUnmount() {
    // $("body").removeClass("app-forum");
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcPageHeight);
  }

  handleOnTabSelect(item) {
    let that = this;
    this.setState({ activeTab: item }, that.findAndGetFirstRows);
  }

  handeOnSideBarSelect(item) {
    let that = this;
    let { activeSidebarItems } = this.state;

    let i = activeSidebarItems.indexOf(item);
    if (i !== -1) {
      activeSidebarItems.splice(i, 1); //remover o item
    } else {
      activeSidebarItems.push(item); //adicionar
    }

    this.setState({ activeSidebarItems }, that.findAndGetFirstRows);
  }

  handleOnChange_txtSearch(values) {
    var that = this;
    this.setState(
      {
        searchTags: values,
        rvIsLoading: true
      },
      function () {
        that.findAndGetFirstRows();
      }
    );
  }


  findAndGetFirstRows() {
    var that = this;
    if (this.props.searchApiUrl) {
      let { searchTags, activeTab, activeSidebarItems } = this.state;

      that.setState({
        rvIsLoading: true,
        rvHasNextPage: false,
        totalInfo: {
          Total: 0,
          Loaded: 0,
          Searching: true
        }
      });

      if (this.cancelPreviousAxiosRequest) this.cancelPreviousAxiosRequest();
      var CancelToken = axios.CancelToken;

      this.serverRequest = axios
        .get(that.props.searchApiUrl, {
          params: {
            searchTags,
            activeTab,
            activeSidebarItems: JSON.stringify(activeSidebarItems)
          },
          cancelToken: new CancelToken(function executor(c) {
            // An executor function receives a cancel function as a parameter
            that.cancelPreviousAxiosRequest = c;
          })
        })
        .then(function (result) {
          var { activeTab } = that.state;
          var tabItems = result.data.tabItems;
          var listItems = result.data.firstRows;
          var hierarquyItems = result.data.hierarquyItems;
          var rvHasNextPage = listItems.length < result.data.totalRowCount;
          let totalInfo = {
            Total: listItems.length > 0 ? listItems[0].TOTAL_ROWS : 0,
            Loaded: listItems.length
          };
          if (!(activeTab in tabItems)) activeTab = Object.keys(tabItems)[0];
          let ReactVirtualized__List = document.getElementsByClassName("ReactVirtualized__List")[0];
          ReactVirtualized__List.scrollTop = 0;

          that.setState(
            { listItems, tabItems, activeTab, rvHasNextPage, hierarquyItems, totalInfo, rvIsLoading: false },
            that.calcPageHeight
          );
        })
        .catch(function (error) {
          if (!error.__CANCEL__) byUs.showError(error, "Api error")
        });
    }
  }

  loadNextPage = () => {
    var that = this;
    if (that.props.searchApiUrl) {
      let { searchTags, activeTab, activeSidebarItems, listItems } = this.state;
      that.setState({ rvIsLoading: true });

      let params = {
        searchTags,
        activeTab,
        activeSidebarItems: JSON.stringify(activeSidebarItems),
        startIndex: listItems.length,
        maxRecords: 100
      };

      that.serverRequest = axios
        .get(that.props.searchApiUrl + "/more", { params })
        .then(function (result) {
          var nextRows = result.data;
          var listItems = that.state.listItems.concat(nextRows);
          var rvHasNextPage = nextRows.length > 0 && listItems.length < nextRows[0].TOTAL_ROWS;
          let totalInfo = {
            Total: nextRows.length > 0 ? nextRows[0].TOTAL_ROWS : listItems.length,
            Loaded: listItems.length
          };
          that.setState({ listItems, rvHasNextPage, totalInfo, rvIsLoading: false });
        })
        .catch(function (error) {
          if (!error.__CANCEL__) byUs.showError(error, "Api error")

          that.setState({ rvIsLoading: false });
        });
    }
  };

  render() {
    var { activeTab, tabItems, totalInfo } = this.state;
    var { currentModal } = this.props;

    let hasNoContent = (this.state.rvIsLoading === false &&
      this.state.listItems.length === 0 &&
      this.state.searchTags.length === 0 &&
      this.state.activeTab === tabItems[0])

    let hasContent = !hasNoContent

    return (
      // <div className="">
      (
        <div className="animated fadeIn">
          <div className="page bg-white">
            <div className="page-main">
              {!hasContent &&
                <ByUsNoContent message={this.props.noRecordsMessage}></ByUsNoContent>
              }
              {hasContent &&
                <ByUsSearchBar
                  totalInfo={totalInfo}
                  onChange={this.handleOnChange_txtSearch}
                  searchTags={this.state.searchTags}
                  inputProps={{
                    placeholder: this.props.searchPlaceholder,
                  }}
                />
              }
              {hasContent &&
                <ByUsTabsBar items={tabItems} activeItem={activeTab} onSelect={this.handleOnTabSelect} />
              }
              {hasContent &&
                <div className="byusModalInfiniteList" id={this.byusModalInfiniteListID}>
                  {VirtualizedInfiniteLoader({
                    /** Are there more items to load? */
                    hasNextPage: this.state.rvHasNextPage,

                    /** Are we currently loading a page of items? */
                    isNextPageLoading: this.state.rvIsLoading,

                    /** List of items loaded so far */
                    list: this.state.listItems,

                    /** Callback function responsible for loading the next page of items */
                    loadNextPage: this.loadNextPage,

                    /** callback to function responsible for rendering the row */
                    renderRow: this.props.renderRow,
                    rowHeight: this.props.renderRowHeight,

                  })}
                </div>
              }
            </div>
          </div>
          {currentModal}
        </div>
      )
    );
  }
}

ByUsSearchPage.defaultProps = {
  pageTitle: "pageTitle not defined",
  searchPlaceholder: "Procurar...",
  searchApiUrl: "",
  renderHeaders: () => { },
  currentModal: null,
  renderRow: ({ row, index }) => { },
  renderRowHeight: 20,
};

export default ByUsSearchPage;
