import React from 'react';

class Header extends React.Component {
    render() {
        return <div style={{backgroundColor: "#353c48", color: "white", float: "left", width: "100%"}}>
                <h1 className="text-center-xs" style={{padding: 10, margin: 0}}>
                    <i className="icon fw fw-wso2-logo" style={{marginRight: 10}}></i>
                    {this.props.dashboardName}
                </h1>
            </div>;
    }
}

export default Header;