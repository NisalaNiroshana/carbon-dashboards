import React from 'react';
import GoldenLayout from 'golden-layout';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-dark-theme.css';
import '../public/css/dashboard.css';
import axios from 'axios';

var myLayout = new GoldenLayout();
var registeredWidgets = 0;
var widgets = new Map();
var widgetCount = 0;

class ViewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.renderDashboard = this.renderDashboard.bind(this);
        this.loadWidget = this.loadWidget.bind(this);
        this.findWidget = this.findWidget.bind(this);
        widgets = new Map();
        widgetCount = 0;
        registeredWidgets = 0;
        console.log("Nisala Niroshana Nanaya")
        console.log(this.props.dahboardPage)
    }

    render() {
        this.renderDashboard();
        return null;
    }

    renderDashboard() {
        window.onresize = function () {
            myLayout.updateSize();
        };

        let config = {
            settings: {
                hasHeaders: false,
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                showPopoutIcon: false,
                showMaximiseIcon: false,
                responsive: true,
                isClosable: false,
                responsiveMode: 'always',
                showCloseIcon: false,
            },
            dimensions: {
                minItemWidth: 400,
            },
            isClosable: false,
            content: []
        };


        let widgetList = new Set();
        let instance = axios.create({
            baseURL: 'http://localhost:9090/dashboard',
            timeout: 2000
        });
        let findWidget = this.findWidget;
        let loadWidget = this.loadWidget;
        let setDashboardName = this.props.setDashboardName;
        let dashboardPage = this.props.dashboardPage;
        let setPages = this.props.setPages;
        instance.get(this.props.dashboardId).then(function (response) {
            setDashboardName(response.data.name);
            let dashboardContent = [];
            console.log("IIIIIIIIIIIIIIIIIIIIIIIIII"+dashboardPage)
            let pages;
            if(!dashboardPage){
                dashboardContent.push(JSON.parse(response.data.content)[0].page0);
            } else {
                dashboardContent.push(JSON.parse(response.data.content)[0][dashboardPage]);
            }
            console.log(dashboardContent)
            pages = Object.keys(JSON.parse(response.data.content)[0]);
            setPages(pages);
            findWidget(dashboardContent, widgetList);
            widgetCount = widgetList.size;
            config.content = dashboardContent;
            myLayout.destroy();
            myLayout = new GoldenLayout(config, document.getElementById('view'));
            widgetList.forEach(widget => {
                widgetList.add(widget);
                loadWidget(widget)
            });
        }).catch(function (error) {
            console.log(error)
        });

    }

    loadWidget(widgetID) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "http://localhost:8082/app/public/" + widgetID + ".js";
        head.appendChild(script);
    }

    findWidget(json, widgets) {
        json.forEach(ele => {
            if (!(ele.type == 'component')) {
                ele.title = "";
                this.findWidget(ele.content, widgets)

            } else {
                ele.header = {"show": true};
                ele.isClosable = false;
                ele.componentName = "lm-react-component";
                widgets.add(ele.component);
            }
        });
        return widgets;
    }


}

function registerWidget(widgetId, widgetObj) {
    if (!widgets.get(widgetId)) {
        widgets.set(widgetId, widgetObj);
        myLayout.registerComponent(widgetId, widgets.get(widgetId));
        registeredWidgets++;
        if (registeredWidgets == widgetCount) {
            myLayout.init();
        }
    }
}


global.dashboard = {};
global.dashboard.registerWidget = registerWidget;

export default ViewComponent;