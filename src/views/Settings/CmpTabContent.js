import React, { Component } from "react";
import SearchPage from "../../components/SearchPage";
import axios from "axios";
import { Badge } from "reactstrap";
import { ButtonGetPdf } from "../../Inputs";
import uuid from "uuid/v4";

import { TextBox, TextBoxNumeric, Date, ComboBox, Notas } from "../../Inputs";
// import { Badge } from "reactstrap";
// import uuid from "uuid/v4";
const sappy = window.sappy;
const $ = window.$;

class CmpTabContent extends Component {
    render() {
        let settings = this.props.settings || {};

        let renderSettings = (sets) => {

            let keys = Object.keys(sets);
            return keys.map(key => {
                let setting = sets[key]
                return <div key={key} className="setting">
                    <div className="setting-name"> {setting.name}</div>
                    <div className="setting-comments"> {setting.comments}</div>
                    <div className="setting-input">
                        <ComboBox
                            name={setting.id}
                            label=""
                            getOptionsApiRoute={setting.source}
                            value={setting.rawValue}
                            onChange={this.props.saveSetting}
                        />
                    </div>
                </div>
            })
        }

        let renderSettingTitles = (sets) => {
            let keys = Object.keys(sets);
            return keys.map(key => {
                let setting = sets[key]
                return <div key={key} className="setting-title">
                    <h4> {setting.name}</h4>
                    {renderSettings(setting.settings || {})}
                </div>
            })
        }




        return (
            <div>
                {renderSettingTitles(settings)}
                <div style={{ minHeight: "200px" }}></div>
            </div>)

    }
}

export default CmpTabContent;
