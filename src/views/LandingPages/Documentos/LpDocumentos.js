import React, { Component } from "react";
import { hashHistory } from "react-router";
import axios from "axios";
import safeJsonStringify from "safe-json-stringify";
const byUs = window.byUs;
import BaseLandingPage from "../BaseLandingPage";

class LpDocumentos extends Component {
  constructor(props) {
    super(props)
    this.handleRowClick = this.handleRowClick.bind(this);

    this.state = {
      showActions: false
    }
  }
  componentDidMount() {
    axios
      .get(`/api/docs/${this.props.docTableName}/report`)
      .then(function (result) {
        byUs.defaultLayoutCode = result.data.LayoutCode;
      })
      .catch(function (error) {
        if (!error.__CANCEL__) byUs.showError(error, "Api error")
      });
  }

  handleRowClick({ row, index }) {
    if (row.DRAFT === 'X') {
      hashHistory.push({
        pathname: hashHistory.getCurrentLocation().pathname + "/doc",
        state: { id: row.DocEntry }
      });
    } else if (row.DRAFT === 'Y') {

      byUs.showWarning({ msg: "Ainda não implementada a visualização/edição de rascunhos nativos SAP" })
    } else {
      hashHistory.push({
        pathname: hashHistory.getCurrentLocation().pathname + "/doc",
        state: { DocEntry: row.DocEntry }
      });
    }
  }

  render() {
    const renderActions = () => {
      let { selectedItems } = this.state;
      let actions = [];

      let currUrl = hashHistory.getCurrentLocation().pathname;


      actions.push({
        name: "Novo",
        color: "success",
        icon: "icon wb-plus",
        onClick: e => {
          // exemplo: "/cmp/opch" + "/doc"
          hashHistory.push(hashHistory.getCurrentLocation().pathname + "/doc");
        }
      })

      return actions;
    };

    return (
      <BaseLandingPage
        {...this.props}
        searchPlaceholder="Procurar..."
        searchApiUrl={`api/docs/${this.props.docTableName}`}
        actions={renderActions()}
        onRowClick={this.handleRowClick}
      />
    );
  }
}

export default LpDocumentos;
