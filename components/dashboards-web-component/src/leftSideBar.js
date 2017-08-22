import React from 'react';
import {Link} from 'react-router-dom';

class LeftSideBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.pages) {
            this.props.pagesList = this.props.pages.map(page => {
                return <li><Link to={this.props.dashboardId + "/" + page}>{page}</Link></li>;
            });
        }
        return <div className="sidebar-wrapper sidebar-nav toggled hidden-xs" style={{width: 260, height: "100%"}}>
            <div className="product-logo" style={{textAlign: "center", fontSize: 50}}>
                <i className="icon fw fw-wso2-logo"></i>
            </div>
            <div className="product-name" style={{textAlign: "center", fontSize: 25}}>
                Test
            </div>
            <div>
                <ul className="nav nav-pills nav-stacked menu-customize pages">
                    {this.props.pagesList}
                </ul>
            </div>
        </div>;
    }
}

export default LeftSideBar;