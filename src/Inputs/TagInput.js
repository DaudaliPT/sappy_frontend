import React, { PureComponent } from "react";
// import axios from "axios";

const $ = window.$;
var sappy = window.sappy;

class TagInput extends PureComponent {
  constructor(props) {
    super(props);
    this.name = props.name;
    this.state = {
      tags: props.tags,
      autoCompleteValues: []
    };
  }

  componentDidMount() {
    let that = this;
    // let props = this.props;

    // if (props.getOptionsApiRoute) {
    //   this.serverRequest = axios
    //     .get(props.getOptionsApiRoute)
    //     .then(result => {

    //       that.setState({ autoCompleteValues: result.data })

    //     })
    //     .catch(error => {
    //       var msg = sappy.parseBackendError("Erro ao obter valores:", error);
    //     });
    // }

    setTimeout(() => {
      $("#" + that.name)
        .on("tokenfield:createtoken", function(e) {
          var data = e.attrs.value;

          let found = that.state.autoCompleteValues.filter(item => item.value === data || item.label.toUpperCase().indexOf(data.toUpperCase()) > -1);
          if (found && found.length === 1) {
            e.attrs.value = found[0].value;
            e.attrs.label = found[0].label;
          } else if (found && found.length >= 1) {
            sappy.showToastr({ color: "warning", msg: "Encontrados " + found.length + " registos com '" + data + "'." });
            return false;
          } else {
            sappy.showToastr({ color: "danger", msg: "Nada encontrado com '" + data + "'" });
            return false;
          }
        })
        .on("tokenfield:createdtoken", function(e) {
          let values = $("#" + that.name).tokenfield("getTokens");
          that.props.onChange && that.props.onChange(values);
        })
        .on("tokenfield:removedtoken", function(e) {
          let values = $("#" + that.name).tokenfield("getTokens");
          that.props.onChange && that.props.onChange(values);
        })
        .tokenfield({delimiter:';'})
        .tokenfield("setTokens", that.state.tags);
    }, 0);
  }

  render() {
    let that = this;
    // let { totalInfo } = this.props;
    return (
      <div className="tokenfield" id={that.name}>
        <input type="text" {...this.props.inputProps} />
      </div>
    );
  }
}
TagInput.defaultProps = {
  tags: []
};
export default TagInput;
