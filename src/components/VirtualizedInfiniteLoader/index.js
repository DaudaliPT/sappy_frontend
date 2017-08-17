import React from "react";
import { InfiniteLoader, AutoSizer, List } from "react-virtualized";

export default function VirtualizedInfiniteLoader({
  hasNextPage /** Are there more items to load? */,
  isNextPageLoading /** Are we currently loading a page of items? */,
  list /** List of items loaded so far */,
  loadNextPage /** Callback function responsible for loading the next page of items */,
  renderRow /** callback function({row,index}) to render row */,
  // renderLoadingRow /** callback function to render the rown whenis loading (ie, no data is avaiable) */,
  rowHeight
}) {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const rowCount = hasNextPage ? list.length + 1 : list.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreRows = isNextPageLoading ? () => { } : loadNextPage;

  // Every row is loaded except for our loading indicator row.
  const isRowLoaded = ({ index }) => {
    return !hasNextPage || index < list.length;
  };

  const renderLoadingRow = ({ index }) => {
    return (
      <div className="byusVirtualRow vertical-align ">
        <div className="container vertical-align-middle text-center">
          <div className="col-12">
            {"Loading row " + (index + 1) + "..."}
          </div>
        </div>
      </div>
    );
  };

  // Render a list item or a loading indicator.
  const rowRenderer = ({ index, key, style }) => {
    let content;

    if (!isRowLoaded({ index })) {
      content = renderLoadingRow({ index });
    } else {
      content = renderRow({ row: list[index], index });
    }

    return (
      <div key={key} style={style} className="byusVirtualRowContainer">
        {content}
      </div>
    );
  };

  return (
    <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={rowCount}>
      {({ onRowsRendered, registerChild }) => (
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              rowCount={rowCount}
              rowHeight={rowHeight}
              width={width}
              ref={registerChild}
              onRowsRendered={onRowsRendered}
              rowRenderer={rowRenderer}
            />
          )}
        </AutoSizer>
      )}
    </InfiniteLoader>
  );
}
