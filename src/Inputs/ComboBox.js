import React, { Component } from "react";
import { FormGroup, FormFeedback } from "reactstrap";
import { Select, Creatable } from "react-select";
import SelectVirtualized from "react-virtualized-select";
import createFilterOptions from "react-select-fast-filter-options";
import axios from "axios";
var sappy = window.sappy;
// var $ = window.$;

class ComboBox extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.loadProps = this.loadProps.bind(this);

    this.state = {
      options: props.options,
      filterOptions: createFilterOptions({ options: props.options }),
      loadingError: "",
      isLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.getOptionsApiRoute !== this.props.getOptionsApiRoute
      || ((nextProps.options || []).length !== (this.props.options || []).length)) {
      this.loadProps(nextProps)
    }
  }

  componentDidMount() {
    this.loadProps(this.props)
  }

  loadProps(props) {
    let that = this
    if (this.props.options) {
      this.setState({
        options: props.options,
        filterOptions: createFilterOptions({ options: props.options }),
        loadingError: "",
        isLoading: false
      });

    }
    if (this.props.getOptionsApiRoute) {
      that.setState({
        options: [],
        filterOptions: createFilterOptions({ options: [] }),
        loadingError: "",
        isLoading: true
      });

      this.serverRequest = axios
        .get(props.getOptionsApiRoute)
        .then(result => {
          that.setState({
            options: result.data,
            isLoading: false,
            filterOptions: createFilterOptions({ options: result.data })
          });

        })
        .catch(error => {
          var msg = sappy.parseBackendError("Erro ao obter valores:", error);
          that.setState({ isLoading: false, loadingError: msg });
        });
    }
  }
  componentWillUnmount() {
    if (this.serverRequest && this.serverRequest.abort) this.serverRequest.abort();
  }

  handleChange(newValue) {
    let changeInfo = {
      fieldName: this.props.name
    };

    if (this.props.multi === true) {
      changeInfo = {
        ...changeInfo,
        rawValue: newValue,
        formatedValue: newValue
      };
    } else {
      if (!newValue) newValue = { value: null, label: "" };

      changeInfo = {
        ...changeInfo,
        rawValue: newValue.value,
        formatedValue: newValue
      };
    }

    this.props.onChange(changeInfo);
  }

  render() {
    var { options, filterOptions, isLoading } = this.state;
    var { name, clearable, createable, multi, disabled, searchable, value } = this.props;

    var renderHelpText = () => {
      if (this.props.helpText) {
        return <span className="text-help">{this.props.helpText}</span>;
      }
    };


    let stateColor, stateMsg;
    if (this.state.loadingError) {
      stateColor = "danger";
      stateMsg = this.state.loadingError;
    } else if (this.props.state) {
      stateColor = this.props.state.split('|')[0];
      stateMsg = this.props.state.split('|')[1];
    }

    return (
      <FormGroup color={stateColor} className={this.props.label ? "" : "no-label"} data-tip={this.props.label} title={stateMsg}>
        {/*{renderLabel()}*/}
        <SelectVirtualized
          filterOptions={filterOptions}
          name={name}
          clearable={clearable}
          disabled={disabled}
          multi={multi}
          onChange={this.handleChange}
          optionHeight={28}
          options={options}
          placeholder={isLoading ? "[A carregar lista...]" : this.props.placeholder}
          ref={name}
          optionRenderer={NameOptionRenderer}
          selectComponent={createable ? Creatable : Select}
          simpleValue={multi === true}
          searchable={searchable}
          value={value}
        />

        {stateMsg && <FormFeedback>{stateMsg}</FormFeedback>}

        {renderHelpText()}
      </FormGroup>
    );
  }
}

ComboBox.defaultProps = {
  name: "ComboBox",
  clearable: true,
  disabled: false,
  multi: false,
  createable: false,
  placeholder: "Pesquise ou selecione...",
  searchable: true,
  onChange: (newValue, name, newValueText) => {
    console.log(newValue, name, newValueText);
  },
  value: "",
  options: []
};

export default ComboBox;

function NameOptionRenderer({
  focusedOption,
  focusedOptionIndex,
  focusOption,
  key,
  labelKey,
  option,
  optionIndex,
  options,
  selectValue,
  style,
  valueArray
}) {
  const classNames = [];

  if (option.type && option.type === "group") {
    classNames.push("sappy-option-group");

    return (
      <div className={classNames.join(" ")} key={key} style={style}>
        {option.label}
      </div>
    );
  } else {
    classNames.push("sappy-option");
    if (option === focusedOption) {
      classNames.push("sappy-option-focused");
    }
    if (valueArray && valueArray.indexOf(option) >= 0) {
      classNames.push("sappy-option-selected");
    }

    return (
      <div
        className={classNames.join(" ")}
        key={key}
        onClick={() => selectValue(option)}
        onMouseOver={() => focusOption(option)}
        style={style}
      >
        {option.label}
      </div>
    );
  }
}
