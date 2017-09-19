import React from "react";

const HeaderAlignRight = ({ column }) => {
    return <div style={{ textAlign: "right" }}> {column.name} </div>;
};

export default HeaderAlignRight