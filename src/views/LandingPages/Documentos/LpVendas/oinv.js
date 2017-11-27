import React, { Component } from "react";
const sappy = window.sappy;
import LpDocumentos from "../LpDocumentos";
import { ButtonGetPdf } from "../../../../Inputs";
import DocBadges from "../../../../components/DocBadges";

class oinv extends Component {
  render() {
    // let that = this;

    let docProps = {
      docTableName: "oinv",
      pageTitle: "Faturas a Clientes",
      renderRowHeight: 50,
      renderRow: ({ row, index, onRowClick }) => {
        let rowId = "row_" + row.DocEntry + "#" + (row.DocNum || 0);
        let rowStyleClass = "";
        // if (selected) rowStyleClass += " sappy-selected-row";
        if (row.DRAFT === "Y" || row.DRAFT === "X") rowStyleClass += " vlist-row-warning";

        return (
          <div key={rowId} className={"byusVirtualRow vertical-align " + rowStyleClass} onClick={e => onRowClick({ row, index })}>
            <div className="container vertical-align-middle">
              {/*very large displays*/}
              <div className="hidden-xl-down">
                <div className="row">
                  <div className="col-11">
                    <div className="row">
                      <div className="col-3">
                        {sappy.format.datetime2(row.DOC_DATETIME)}
                        <span className="float-right">
                          {" "}{row.DocNum}
                        </span>
                        <span className="float-right font-size-10">
                          {" "}{row.NumAtCard}
                        </span>
                      </div>
                      <div className="col-7">
                        {" "}{row.CardCode + " - " + row.CardName} <DocBadges tags={row.ITEM_TAGS} />{" "}
                      </div>
                      <div className="col-2 lastcol">
                        <span className="float-right">
                          <strong>
                            {row.FORMATED_DOCTOTAL}{" "}
                          </strong>
                          {" " + sappy.format.date(row.DocDueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-1 lastcol">
                    {" "}<ButtonGetPdf DocEntry={row.DocEntry} ObjectID={row.ObjType} />{" "}
                  </div>
                </div>
              </div>

              {/*normal displays*/}
              <div className="hidden-xs-down hidden-xxl-up">
                <div className="row">
                  <div className="col-11">
                    <div className="row">
                      <div className="col text-nowrap">
                        {" "}{row.CardCode + " - " + row.CardName}{" "}
                      </div>
                    </div>
                    <div className="row secondrow">
                      <div className="col-2 text-nowrap firstcol">
                        {" "}{sappy.format.datetime2(row.DOC_DATETIME)}{" "}
                      </div>
                      <div className="col-8 text-nowrap">
                        {" "}{row.DocNum} <DocBadges tags={row.ITEM_TAGS} />{" "}
                      </div>
                      <div className="col-2 text-nowrap lastcol">
                        {" "}<span className="float-right"> {row.FORMATED_DOCTOTAL} </span>{" "}
                      </div>
                    </div>
                  </div>
                  <div className="col-1 lastcol">
                    {" "}<ButtonGetPdf DocEntry={row.DocEntry} ObjectID={row.ObjType} />{" "}
                  </div>
                </div>
              </div>

              {/*mobile*/}
              <div className="hidden-sm-up">
                <div className="row font-size-12">
                  <div className="col text-nowrap">
                    {" "}{row.CardCode + " - " + row.CardName}{" "}
                  </div>
                </div>
                <div className="row secondrow font-size-10">
                  <div className="col-2 text-nowrap firstcol">
                    {" "}{sappy.format.date(row.DOC_DATETIME)}{" "}
                  </div>
                  <div className="col-8 text-nowrap">
                    {" "}{row.DocNum} <DocBadges tags={row.ITEM_TAGS} />{" "}
                  </div>
                  <div className="col-2 text-nowrap lastcol">
                    {" "}<span className="float-right"> {row.FORMATED_DOCTOTAL} </span>{" "}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    };
    return <LpDocumentos {...docProps} />;
  }
}

export default oinv;
