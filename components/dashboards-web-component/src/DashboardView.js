import React from 'react';
import Header from './header';
import ViewComponent from './viewComponent';
import LeftSideBar from './leftSideBar';

class DashboardView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageId:this.props.match.params.pageId
        };
        this.setDashboardName = this.setDashboardName.bind(this);
        this.setPages = this.setPages.bind(this);
        console.log(this.state.pageId+"         ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;")
    }

    setDashboardName(dashboardName) {
        if (!this.state.dashboardName) {
            this.setState({dashboardName: dashboardName});
        }
    }

    setPages(pages){
        console.log("LLL"+this.props.match.params.pageId)
        console.log(pages)
        if (!this.state.pages) {
            this.setState({pages: pages});
        }
       // this.setState({pageId:this.props.match.params.pageId})
    }

    render() {
        console.log("LSLSLSLSLSLSLSLS "+this.props.match.params.pageId);
        return <section>
            <Header dashboardName={this.state.dashboardName}></Header>
            <ViewComponent dashboardId={this.props.match.params.id} setDashboardName={this.setDashboardName}
                           dashboardPage={this.props.match.params.pageId} setPages={this.setPages}></ViewComponent>
        </section>;
    }
}

export default DashboardView;