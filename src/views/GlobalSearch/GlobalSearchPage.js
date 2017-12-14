import React, { PureComponent } from "react";
import axios from "axios";
import VirtualizedInfiniteLoader from "../../components/VirtualizedInfiniteLoader";
import TabsBar from "../../components/TabsBar";
import NoContent from "../../components/NoContent";
import uuid from "uuid";
const sappy = window.sappy;
const $ = window.$;

class SearchPage extends PureComponent {
  constructor(props) {
    super(props);

    this.findAndGetFirstRows = this.findAndGetFirstRows.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);
    this.handleOnTabSelect = this.handleOnTabSelect.bind(this);
    this.calcPageHeight = this.calcPageHeight.bind(this);

    this.byusModalInfiniteListID = "byusModalInfiniteList" + uuid();
    this.byusModalTabsBarID = "byusModalTabsBar" + uuid();
    this.state = {
      /** holds the text typed by the user */
      // searchTags: (props.searchText && [{ value: props.searchText, label: props.searchText }]) || [],

      /** list of items to put on tabs bar */
      tabItems: {},
      activeTab: "",
      /** contains the loaded rows for virtalized-list */
      listItems: [],

      rvIsLoading: true,
      /** set when loading first or next rows, so that no more requests are made */
      rvHasNextPage: false,

      /** contains info about loading status, to display on search bar */
      totalInfo: {
        Total: 0,
        Loaded: 0,
        Searching: true
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchTags !== this.props.searchTags || nextProps.searchApiUrl !== this.props.searchApiUrl) {
      setTimeout(() => {
        this.findAndGetFirstRows();
      }, 1);
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.calcPageHeight);

    this.calcPageHeight();

    setTimeout(() => {
      this.findAndGetFirstRows();
    }, 1);
  }

  calcPageHeight() {
    function getScrollParent(element, includeHidden) {
      var style = getComputedStyle(element);
      var excludeStaticParent = style.position === "absolute";
      var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

      if (style.position === "fixed") return document.body;
      // eslint-disable-next-line
      for (var parent = element; (parent = parent.parentElement); ) {
        style = getComputedStyle(parent);
        if (excludeStaticParent && style.position === "static") {
          continue;
        }
        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
      }

      return document.body;
    }

    let $elTab = $("#" + this.byusModalTabsBarID);
    let $elList = $("#" + this.byusModalInfiniteListID);
    if ($elList[0] && $elTab[0]) {
      if (this.props.height) {
        let useHeight = this.props.height;
        let minH = useHeight - $elTab.height();
        $elList.css("height", minH.toString() + "px");
      } else {
        let $body = $("body");
        let scrollAbleparent = getScrollParent($elList[0], false);
        let $scrollAbleparent = $(scrollAbleparent);

        if ($scrollAbleparent && $body) {
          let bodyHeight = $body.height();
          let parentHeight = $scrollAbleparent.height();
          let useHeight = 0;
          if (parentHeight < bodyHeight) useHeight = bodyHeight;
          else useHeight = parentHeight;

          let minH = useHeight - ($elList.position().top - $elTab.height()) * 2 - (120 + $elTab.height());
          if (minH < 300) {
            minH = 300;
          }
          $elList.css("height", minH.toString() + "px");
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    window.removeEventListener("resize", this.calcPageHeight);
  }

  handleOnTabSelect(item) {
    let that = this;
    this.setState({ activeTab: item }, that.findAndGetFirstRows);
  }

  findAndGetFirstRows() {
    var that = this;
    if (this.props.searchApiUrl) {
      let { searchTags } = this.props;
      let { activeTab } = this.state;

      that.setState(
        {
          rvIsLoading: true,
          rvHasNextPage: false,
          totalInfo: {
            Total: 0,
            Loaded: 0,
            Searching: true
          }
        },
        () => that.props.onTabStatusUpdate(that.state.totalInfo)
      );

      if (this.cancelPreviousAxiosRequest) this.cancelPreviousAxiosRequest();
      var CancelToken = axios.CancelToken;

      this.serverRequest = axios({
        method: this.props.searchApiMethod || "get",
        url: that.props.searchApiUrl,
        data: that.props.searchApiData,
        params: {
          searchTags,
          noQuerys: true,
          activeTab
        },
        cancelToken: new CancelToken(function executor(c) {
          // An executor function receives a cancel function as a parameter
          that.cancelPreviousAxiosRequest = c;
        })
      })
        .then(function(result) {
          var { activeTab } = that.state;
          var tabItems = result.data.tabItems || [];
          var listItems = result.data.firstRows;
          var rvHasNextPage = listItems.length < result.data.totalRowCount;
          let totalInfo = {
            Total: listItems.length > 0 ? listItems[0].TOTAL_ROWS : 0,
            Loaded: listItems.length
          };
          if (!(activeTab in tabItems)) activeTab = Object.keys(tabItems)[0];

          let ReactVirtualized__List = document.getElementsByClassName("ReactVirtualized__List")[0];
          if (ReactVirtualized__List) ReactVirtualized__List.scrollTop = 0;

          that.setState({ listItems, tabItems, activeTab, rvHasNextPage, totalInfo, rvIsLoading: false }, () => {
            that.calcPageHeight();
            that.props.onRefresh && that.props.onRefresh();
            that.props.onTabStatusUpdate(that.state.totalInfo);
          });
        })
        .catch(function(error) {
          if (error.__CANCEL__) return;
          sappy.showError(error, "Api error");
        });
    }
  }

  loadNextPage = () => {
    var that = this;
    if (that.props.searchApiUrl) {
      let { searchTags } = this.props;
      let { activeTab, listItems } = this.state;
      that.setState({ rvIsLoading: true });

      let params = {
        searchTags,
        noQuerys: true,
        activeTab,
        startIndex: listItems.length,
        maxRecords: 100
      };

      that.serverRequest = axios
        .get(that.props.searchApiUrl + "/more", { params })
        .then(function(result) {
          var nextRows = result.data;
          var listItems = that.state.listItems.concat(nextRows);
          var rvHasNextPage = nextRows.length > 0 && listItems.length < nextRows[0].TOTAL_ROWS;
          let totalInfo = {
            Total: nextRows.length > 0 ? nextRows[0].TOTAL_ROWS : listItems.length,
            Loaded: listItems.length
          };
          that.setState({ listItems, rvHasNextPage, totalInfo, rvIsLoading: false }, () => that.props.onTabStatusUpdate(that.state.totalInfo));
        })
        .catch(function(error) {
          if (!error.__CANCEL__) sappy.showError(error, "Api error");

          that.setState({ rvIsLoading: false });
        });
    }
  };

  render() {
    let { searchTags } = this.props;
    var { activeTab, tabItems, totalInfo, listItems, rvIsLoading } = this.state;

    let hasNoContent = rvIsLoading === false && listItems.length === 0 && searchTags.length === 0 && activeTab === Object.keys(tabItems)[0];

    let hasContent = !hasNoContent || !this.props.noRecordsMessage;

    return (
      <div>
        {!hasContent && <NoContent message={this.props.noRecordsMessage} />}

        {hasContent &&
          <div className="byusModalTabsBar" id={this.byusModalTabsBarID}>
            <TabsBar items={tabItems} activeItem={activeTab} onSelect={this.handleOnTabSelect} />
          </div>}
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
              rowHeight: this.props.renderRowHeight
            })}
          </div>}
      </div>
    );
  }
}

SearchPage.defaultProps = {
  searchPlaceholder: "Procurar...",
  searchApiUrl: "",
  onTabStatusUpdate: newState => {},
  renderRow: ({ row, index }) => {},
  renderRowHeight: 20
};

export default SearchPage;
