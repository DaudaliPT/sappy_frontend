import React, { Component } from "react";
import Graph from "react-graph-vis";

const graph = {
  nodes: [
    {
      id: "1",
      label: "Cotação 10010",
      color: "#fefefe",
      shape: "icon",
      icon: {
        face: "Font Awesome",
        code: "\uf1ea",
        size: 50,
        color: "red"
      }
    },
    { id: 2, label: "Encomenda 11212", color: "#e09c41" },
    { id: 3, label: "Factura", color: "#e0df41" },
    { id: 4, label: "Node 4", color: "#7be041" },
    { id: 5, label: "Node 5", color: "#41e0c9" }
  ],
  edges: [{ from: "1", to: 2 }, { from: "1", to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 }]
};

const options = {
  physics: true,

  layout: {
    hierarchical: false,
    randomSeed: 2
  },
  edges: {
    color: "#000000",
    smooth: {
      type: "continous",
      forceDirection: "horizontal",
      roundness: 0.6
    }
  }
};

var optionsFA = {
  groups: {
    usergroups: {
      shape: "icon",
      icon: {
        face: "FontAwesome",
        code: "\uf0c0",
        size: 50,
        color: "#57169a"
      }
    },
    users: {
      shape: "icon",
      icon: {
        face: "FontAwesome",
        code: "\uf007",
        size: 50,
        color: "#aa00ff"
      }
    }
  }
};

const events = {
  select: function(event) {
    var { nodes, edges } = event;
    console.log("Selected nodes:");
    console.log(nodes);
    console.log("Selected edges:");
    console.log(edges);
  }
};

class ReactGraphVis extends Component {
  render() {
    let graph = {
      nodes: this.props.nodes,
      edges: this.props.edges
    };
    return <Graph graph={graph} options={options} events={events} style={{ height: "400px" }} />;
  }
}

export default ReactGraphVis;
