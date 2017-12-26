import React, { PureComponent } from "react";
import axios from "axios";
// import VirtualizedInfiniteLoader from "../VirtualizedInfiniteLoader";
import DataGrid from "../DataGrid";
import SearchBar from "../SearchBar";
import TabsBar from "../TabsBar";
import NoContent from "../NoContent";
import uuid from "uuid";
const sappy = window.sappy;
// const $ = window.$;

class SearchPage2 extends PureComponent {
  constructor(props) {
    super(props);

    this.findAndGetFirstRows = this.findAndGetFirstRows.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);
    this.handleOnTabSelect = this.handleOnTabSelect.bind(this);
    this.handleOnChange_txtSearch = this.handleOnChange_txtSearch.bind(this);
    this.handleRowUpdate = this.handleRowUpdate.bind(this);
    // this.calcPageHeight = this.calcPageHeight.bind(this);
    this.handleToogleLimitSearch = this.handleToogleLimitSearch.bind(this);
    this.getGrid = this.getGrid.bind(this);

    this.gridUuid = "grid" + uuid();
    this.byusModalTabsBarID = "byusModalTabsBar" + uuid();
    this.state = {
      /** holds the text typed by the user */
      searchTags: (props.searchText && [{ value: props.searchText, label: props.searchText }]) || [],

      useSearchLimit: props.useSearchLimit || false,
      tabItems: {},
      activeTab: "",
      listItems: [],
      totalInfo: {
        Total: 0,
        Loaded: 0,
        Searching: true
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchText !== this.props.searchText || nextProps.searchApiUrl !== this.props.searchApiUrl || nextProps.currentModal !== this.props.currentModal) {
      setTimeout(() => {
        this.findAndGetFirstRows();
        if (this.resfreshInterval) clearInterval(this.resfreshInterval);
        if (this.props.autoRefreshTime) this.resfreshInterval = setInterval(this.findAndGetFirstRows, this.props.autoRefreshTime);
      }, 1);
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.findAndGetFirstRows();
      if (this.resfreshInterval) clearInterval(this.resfreshInterval);
      if (this.props.autoRefreshTime) this.resfreshInterval = setInterval(this.findAndGetFirstRows, this.props.autoRefreshTime);
    }, 1);
  }

  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
    if (this.resfreshInterval) clearInterval(this.resfreshInterval);
  }

  handleOnTabSelect(item) {
    let that = this;
    this.setState({ activeTab: item }, that.findAndGetFirstRows);
  }

  handleToogleLimitSearch() {
    let that = this;
    this.setState({ useSearchLimit: !that.state.useSearchLimit }, that.findAndGetFirstRows);
  }
  getGrid() {
    return this.grid || {};
  }

  handleOnChange_txtSearch(values) {
    var that = this;
    this.setState(
      {
        searchTags: values
      },
      function() {
        that.findAndGetFirstRows();
      }
    );
  }

  handleRowUpdate(currentRow, updated, callback) {
    if (this.props.onValidateUpdate) this.props.onValidateUpdate(currentRow, updated, callback);

    let listItems = [...this.state.listItems];
    let rowKey = currentRow[this.props.rowKey];

    listItems.forEach((row, ix) => {
      if (row[this.props.rowKey] === rowKey) {
        listItems[ix] = { ...row, ...updated };
        // console.log(listItems[ix]);
        return;
      }
    });

    // console.log(updated);
    this.setState({ listItems });
  }

  findAndGetFirstRows() {
    var that = this;
    if (this.props.searchApiUrl) {
      let { searchTags, activeTab } = this.state;

      that.setState({
        totalInfo: {
          Total: 0,
          Loaded: 0,
          Searching: true
        }
      });

      if (this.cancelPreviousAxiosRequest) this.cancelPreviousAxiosRequest();
      var CancelToken = axios.CancelToken;

      let searchLimitCondition = "";
      if (this.state.useSearchLimit && this.props.searchLimitCondition) searchLimitCondition = this.props.searchLimitCondition;

      this.serverRequest = axios
        .get(that.props.searchApiUrl, {
          params: {
            searchTags,
            searchLimitCondition,
            activeTab
          },
          cancelToken: new CancelToken(function executor(c) {
            // An executor function receives a cancel function as a parameter
            that.cancelPreviousAxiosRequest = c;
          })
        })
        .then(function(result) {
          var { activeTab } = that.state;
          var tabItems = result.data.tabItems;
          var listItems = result.data.firstRows;
          let totalInfo = {
            Total: listItems.length > 0 ? listItems[0].TOTAL_ROWS : 0,
            Loaded: listItems.length
          };
          if (!(activeTab in tabItems)) activeTab = Object.keys(tabItems)[0];

          that.setState({ listItems, tabItems, activeTab, totalInfo }, e => {
            // that.calcPageHeight()
            that.props.onRefresh && that.props.onRefresh();
          });
        })
        .catch(function(error) {
          if (!error.__CANCEL__) sappy.showError(error, "Api error");
        });
    }
  }

  loadNextPage = () => {
    var that = this;
    if (that.props.searchApiUrl) {
      let { searchTags, activeTab, listItems } = this.state;

      let searchLimitCondition = "";
      if (this.state.useSearchLimit && this.props.searchLimitCondition) searchLimitCondition = this.props.searchLimitCondition;

      let params = {
        searchTags,
        searchLimitCondition,
        activeTab,
        startIndex: listItems.length,
        maxRecords: 100
      };

      that.serverRequest = axios
        .get(that.props.searchApiUrl + "/more", { params })
        .then(function(result) {
          var nextRows = result.data;
          var listItems = that.state.listItems.concat(nextRows);
          let totalInfo = {
            Total: nextRows.length > 0 ? nextRows[0].TOTAL_ROWS : listItems.length,
            Loaded: listItems.length
          };
          that.setState({ listItems, totalInfo });
        })
        .catch(function(error) {
          if (!error.__CANCEL__) sappy.showError(error, "Api error");
        });
    }
  };

  render() {
    var { activeTab, tabItems, totalInfo } = this.state;
    var { currentModal } = this.props;

    let hasNoContent = this.state.listItems.length === 0 && this.state.searchTags.length === 0 && this.state.activeTab === Object.keys(tabItems)[0];

    let hasContent = !hasNoContent || !this.props.noRecordsMessage;

    return (
      <div>
        {!hasContent && <NoContent message={this.props.noRecordsMessage} />}
        {hasContent &&
          <SearchBar
            totalInfo={totalInfo}
            onChange={this.handleOnChange_txtSearch}
            searchTags={this.state.searchTags}
            useSearchLimit={this.state.useSearchLimit}
            searchLimitCondition={this.props.searchLimitCondition}
            onToogleUseSearchLimit={this.handleToogleLimitSearch}
            inputProps={{
              placeholder: this.props.searchPlaceholder
            }}
          />}
        {hasContent &&
          <div className="byusModalTabsBar" id={this.byusModalTabsBarID}>
            <TabsBar items={tabItems} activeItem={activeTab} onSelect={this.handleOnTabSelect} />
          </div>}
        {hasContent &&
          <DataGrid
            id={this.gridUuid}
            ref={node => (this.grid = node)}
            height={this.props.height - 100}
            fields={this.props.fields}
            rowKey={this.props.rowKey}
            groupBy={this.props.groupBy}
            onRowSelectionChange={this.props.onRowSelectionChange}
            onRowUpdate={this.handleRowUpdate}
            selectedKeys={this.props.selectedKeys}
            rows={this.state.listItems}
          />}
        {currentModal}
      </div>
    );
  }
}

SearchPage2.defaultProps = {
  searchPlaceholder: "Procurar...",
  searchApiUrl: "",
  renderHeaders: () => {},
  currentModal: null,
  renderRow: ({ row, index }) => {},
  autoRefreshTime: 0,
  renderRowHeight: 20,
  useSearchLimit: false,
  searchLimitCondition: ""
};

export default SearchPage2;
