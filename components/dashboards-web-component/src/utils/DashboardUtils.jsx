/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

export default class DashboardUtils {
    getDashboardByPageId(pageId, dashboardContent, landingPage) {
        let dashboardPageContent = [];
        if (dashboardContent[0]) {
            if (pageId) {
                let pages = pageId.split("/");
                let parentPage = dashboardContent;
                let selectedPage;
                pages.forEach(page => {
                    selectedPage = this.findPageByID(page, parentPage);
                    parentPage = selectedPage ? selectedPage.pages : [];
                });
                dashboardPageContent.push(selectedPage ? selectedPage.content[0] : "");
            } else {
                dashboardPageContent.push(this.findPageFromDashboardJSon(landingPage, dashboardContent).content[0]);
            }
        }
        return dashboardPageContent;
    }

    findPageFromDashboardJSon(pageId, pagesList) {
        let selectedPage;
        for (let page of pagesList) {
            if (page.id === pageId) {
                selectedPage = page;
                break;
            }
            else if (page.pages) {
                selectedPage = this.findPageFromDashboardJSon(pageId, page.pages)
            }
        }
        return selectedPage;
    }

    findPageByID(pageId, pagesList) {
        let selectedPage;
        pagesList.find(page => {
            if (page.id === pageId) {
                selectedPage = page;
            }
        });
        return selectedPage;
    }

    sanitizeInput(input) {
        return input.replace(/[^a-z0-9-\s]/gim, "");
    };

    static findDashboardPageById(dashboard, pageId) {
        if (!dashboard || !dashboard.pages) {
            return {};
        }
        let page = this._findPageByIdRecursively(dashboard.pages, pageId);
        return page || undefined;
    }

    static _findPageByIdRecursively(pages, id) {
        pages = pages || [];
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].id == id) {
                return pages[i];
            } else {
                var p;
                if (pages[i].hasOwnProperty('pages')) {
                    p = this._findPageByIdRecursively(pages[i].pages, id);
                }
                if (p) {
                    return p;
                }
            }
        }
    }

    static generateguid () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

    static getWidgetProps(dashboardContent,widgetID){
        let widgetProps = {};
        console.log(dashboardContent)
        for(let i = 0 ; i < dashboardContent.length ; i++){
            console.log(":::::::::::::::::::::::::::::::")
            if(dashboardContent.type == 'component' && widgetID == dashboardContent.props.id){
                return dashboardContent.props;
            } else {
                console.log(dashboardContent)
                this.getWidgetProps(dashboardContent.content,widgetID);
            }

        }
        // dashboardContent.map(component => {
        //     console.log(":::::::::::::::::::::::::::::::")
        //     if(component.type == 'component' && widgetID == component.props.id){
        //         widgetProps = component.props;
        //     } else {
        //         this.getWidgetProps(component.content,widgetID);
        //     }
        // });
        //
        // console.log("AAAAAAAA")
        // console.log(widgetProps)
        // console.log("BBBBBBBB")
        // return widgetProps;
    }
}