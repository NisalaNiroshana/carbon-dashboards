import React from 'react';
import DashboardView from './DashboardView';
import Header from './header';
import ReactDOM from 'react-dom';
import axios from 'axios';
import NavigationBar from './navigationBar';

import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch
} from 'react-router-dom';

class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            dashboard: ""
        };
        this.getDashboards = this.getDashboards.bind(this);
    }

    componentDidMount() {
        document.getElementById('view').innerHTML = "";
        this.getDashboards();
    }

    getDashboards() {
        let instance = axios.create({
            baseURL: 'http://localhost:9090/dashboard',
            timeout: 2000
        });
        let s = this;
        instance.get('/').then(function (response) {
            let dashboardList;
            dashboardList = response.data.map(dashboard => {
                console.log(dashboard);
                return (
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3" style={{marginTop: 15}}>
                        <div style={{"background-color": "#aab6cb"}}>
                            <div className="add-padding-2x add-padding-top-5x">
                                <div>
                                    <div className="media-left add-padding-right-4x add-padding-left-2x">
                                        <i className="fw fw-dashboard media-object-5x" style={{fontSize: 80}}></i>
                                    </div>
                                    <div className="media-body">
                                        <h4 className="media-heading add-margin-top-1x">{dashboard.name}</h4>
                                        <p>{dashboard.description}</p>
                                    </div>
                                </div>
                                <div style={{marginTop: 5}}>
                                    <Link to={"dashboard/" + dashboard.url} style={{marginRight: 10}}>
                                        <span className="fw-stack" style={{marginRight: 5}}>
                                            <i className="fw fw-circle-outline fw-stack-2x"></i>
                                            <i className="fw fw-view fw-stack-1x"></i>
                                        </span>
                                        View
                                    </Link>
                                    <a href="" style={{opacity: .6, pointerEvents: "none", marginRight: 10}}>
                                        <span className="fw-stack" style={{marginRight: 5}}>
                                            <i className="fw fw-circle-outline fw-stack-2x"></i>
                                            <i className="fw fw-edit fw-stack-1x"></i>
                                        </span>
                                        Design
                                    </a>
                                    <a href="" style={{opacity: .6, pointerEvents: "none", marginRight: 10}}>
                                        <span className="fw-stack" style={{marginRight: 5}}>
                                            <i className="fw fw-circle-outline fw-stack-2x"></i>
                                            <i className="fw fw-settings fw-stack-1x"></i>
                                        </span>
                                        Settings
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            });
            s.setState({dashboard: dashboardList});
        }).catch(function (error) {
            console.log(error)
        });
    }

    render() {
        return <div>
            <Header dashboardName="Portal"/>
            <NavigationBar/>
            <div>
                {this.state.dashboard}

            </div>
        </div>;
    }
}

class Home2 extends React.Component {
    render() {
        return <div>
            <Switch>
                <Route exact path='/portal' component={Home}/>
                <Route path='*/dashboard/:id/:pageId' component={DashboardView}/>
                <Route path='*/dashboard/:id' component={DashboardView}/>
                <Route path='/img/:id' component={Header}/>
            </Switch>
        </div>;
    }
}

ReactDOM.render(<Router history={true}><Home2 /></Router>, document.getElementById('content'));