import React from 'react';

class NavigationBar extends React.Component {

    render() {
        return (
            <div>
                <div className="breadcrumb-wrapper">
                    <ol className="breadcrumb">
                        <li className="active"><i className="icon fw fw-home"></i> Dashboards</li>
                    </ol>
                </div>

                <div className="navbar-wrapper">
                    <nav className="navbar navbar-default affix-top">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle">
                                    <span className="sr-only">Toggle navigation</span>
                                </button>
                                <a className="navbar-menu-toggle">
                            <span className="icon fw-stack">
                                <i className="fw fw-down fw-stack-1x"></i>
                            </span>
                                </a>
                            </div>
                            <div className="navbar-collapse collapse">
                                <ul className="nav navbar-nav collapse-nav-sub">
                                    <li>
                                        <a href="create-dashboard">
                                <span className="fw-stack">
                                    <i className="fw fw-circle-outline fw-stack-2x"></i>
                                    <i className="fw fw-add fw-stack-1x"></i>
                                </span> Create Dashboard
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        );
    }
}

export default NavigationBar;