import React, { Component } from "react";
import axios from "axios";
import VirtualizedInfiniteLoader from "../../components/VirtualizedInfiniteLoader";

import SearchBar from "../../components/SearchBar";
import SideBar from "./SideBar";
import TabsBar from "../../components/TabsBar";

const sappy = window.sappy;
const $ = window.$;

class BaseLandingPage extends Component {
  constructor(props) {
    super(props);

    this.findAndGetFirstRows = this.findAndGetFirstRows.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);
    this.handleOnTabSelect = this.handleOnTabSelect.bind(this);
    this.handeOnSideBarSelect = this.handeOnSideBarSelect.bind(this);
    this.handleOnChange_txtSearch = this.handleOnChange_txtSearch.bind(this);

    this.state = {
      /** holds the text typed by the user */
      searchTags: [],

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

  componentWillMount() {
    // $("body").addClass("app-forum");
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();
    setTimeout(this.findAndGetFirstRows, 1);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.refresh) this.findAndGetFirstRows()

  }
  calcPageHeight() {
    //Não sei porquê ficava a página ficava cortada ás vezes
    let $body = $("body");
    let $el = $("#byusInfiniteList");
    if ($body && $el) {
      let minH = $body.height() - $el.position().top - 20;
      $el.css("min-height", minH.toString() + "px");
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
        searchTags: values
      },
      function () {
        that.findAndGetFirstRows();
      }
    );
  }


  findAndGetFirstRows() {
    var that = this

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
          if (ReactVirtualized__List) ReactVirtualized__List.scrollTop = 0;

          that.setState(
            { listItems, tabItems, activeTab, rvHasNextPage, hierarquyItems, totalInfo, rvIsLoading: false },
            that.calcPageHeight
          );
        })
        .catch(function (error) {
          if (!error.__CANCEL__) sappy.showError(error, "Api error")
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
          if (!error.__CANCEL__) sappy.showError(error, "Api error")

          that.setState({ rvIsLoading: false });
        });
    }
  };

  render() {
    var { activeTab, tabItems, totalInfo, hierarquyItems, activeSidebarItems } = this.state;
    var { currentModal, currentPopover } = this.props;
    var that = this;

    let renderActions = () => {
      let actions = [...that.props.actions];

      let visibleActions = actions.filter(a => !a.hasOwnProperty("visible") || a.visible)
      if (visibleActions.length === 0) return null

      let mainAction = visibleActions.shift(1);
      if (!mainAction) return;

      var renderSubActions = () => {

        if (visibleActions.length > 0) {
          return (
            <div key={"action-buttons"} className="sappy-action-buttons animation-scale-up">
              {visibleActions.map(action => {
                let btClassName = "btn btn-floating btn-" + action.color;

                return (
                  <div key={"action_" + action.name}>
                    <button type="button" onClick={action.onClick} className={btClassName}>
                      <i className={"animation-scale " + action.icon} aria-hidden="true" />
                    </button>

                    <span className="sappy-action-fab-tip">{action.name}</span>
                  </div>
                );
              })}
            </div>
          );
        }
      };

      let btClassName = "sappy-action-button btn btn-floating btn-" + mainAction.color;
      return (
        <div key={"action_" + mainAction.name} className="sappy-action">
          <button type="button" onClick={mainAction.onClick} className={btClassName}>
            <i className={mainAction.icon} aria-hidden="true" />
          </button>
          {renderSubActions()}
        </div>
      );
    };

    return (
      // <div className="">
      (
        <div className="page bg-white-disabled">

          {/*<!-- Forum Sidebar -->*/}
          <SideBar
            totalInfo={totalInfo}
            activeSidebarItems={activeSidebarItems}
            items={hierarquyItems}
            onSelect={this.handeOnSideBarSelect}
          />

          {/*<!-- Forum Content -->*/}
          <div className="page-main">

            {/*<!-- Forum Content Header -->*/}
            <div className="page-header">
              <h1 className="page-title">{this.props.pageTitle}</h1>

              <SearchBar
                totalInfo={totalInfo}
                onChange={this.handleOnChange_txtSearch}
                searchTags={this.state.searchTags}
                inputProps={{
                  placeholder: this.props.searchPlaceholder,
                }}
              />
            </div>

            {/*<!-- Forum Nav -->*/}
            <TabsBar items={tabItems} activeItem={activeTab} onSelect={this.handleOnTabSelect} />

            {/*<!-- Forum Content -->*/}

            <div id="byusInfiniteList">
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
                renderRow: ({ row, index }) => this.props.renderRow({ row, index, onRowClick: this.props.onRowClick }),
                rowHeight: this.props.renderRowHeight,

              })}
            </div>
          </div>
          {renderActions()}
          {currentModal}
          {currentPopover}
        </div>
      )
    );
  }
}

BaseLandingPage.defaultProps = {
  pageTitle: "pageTitle not defined",
  searchPlaceholder: "Procurar...",
  searchApiUrl: "",
  renderHeaders: () => { },
  currentModal: null,
  currentPopover: null,
  renderRow: ({ row, index, onRowClick }) => { },
  onRowClick: ({ row, index }) => { },
  renderRowHeight: 20,
  actions: {}
};

export default BaseLandingPage;
