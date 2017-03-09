/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
    "use strict";
    var dashboard = dashboardMetadata.dashboard;
    var metadata = dashboardMetadata.metadata;
    var widgetInfo = {};
    var blockCount = 0;

    /**
     * Initialize the dashboard viewer.
     * */
    var init = function () {
        renderBlocks(dashboard);
        initGadgetList();
    };

    /**
     * Render gadget blocks by reading the dashboard json.
     * @param dashboard {Object} dashboard json object
     * */
    var renderBlocks = function (dashboard) {
        var i = "";
        for (i in dashboard.blocks) {
            var dashboardBlock = dashboard.blocks[i];
            UUFClient.renderFragment(Constants.WIDGET_CONTAINER_FRAGMENT_NAME, dashboardBlock,
                "gridContent", Constants.APPEND_MODE, renderBlockCallback);
        }

    };

    /**
     * This is the callback which is triggered after generating the widgetList.
     * @type {{onSuccess: gadgetListCallback.onSuccess, onFailure: gadgetListCallback.onFailure}}
     */
    var widgetListCallback = {
        onSuccess: function () {
        },
        onFailure: function (message, e) {
        }
    };

    /**
     * This is the callback which is triggered after rendering blocks.
     * @type {{onSuccess: renderBlockCallback.onSuccess, onFailure: renderBlockCallback.onFailure}}
     */
    var renderBlockCallback = {
        onSuccess: function () {
            blockCount++;
            if (blockCount === dashboard.blocks.length) {
                initGridstack();
                renderWidgets(dashboard);
            }
        },
        onFailure: function () {
            blockCount++;
            if (blockCount === dashboard.blocks.length) {
                initGridstack();
                renderWidgets(dashboard);
            }
        }
    };

    /**
     * This method will initialize the widget component box's events and widget list's events.
     */
    var initGridstack = function () {
        $('.grid-stack').gridstack({
            width: 12,
            cellHeight: 50,
            verticalMargin: 30,
            disableResize: false,
            disableDrag: false
        }).on('dragstop', function () {
            updateLayout();
            saveDashboard();
        }).on('resizestart', function (e, ui) {
            // hide the component content on start resizing the component
            var container = $(ui.element).find('.ues-component');
            if (container) {
                container.find('.ues-component-body').hide();
            }
        }).on('resizestop', function (e, ui) {
            // re-render component on stop resizing the component
            var container = $(ui.element).find('.ues-component');
            if (container) {
                var gsItem = container.closest('.grid-stack-item');
                var node = gsItem.data('_gridstack_node');
                var blockId = gsItem.attr('data-id');
                var gsHeight = node ? node.height : parseInt(gsItem.attr('data-gs-height'));
                var height = (gsHeight * 150) + ((gsHeight - 1) * 30);
                container.closest('.ues-component-box').attr('data-height', height);
                container.find('.ues-component-body').show();
                if (dashboard.widgets[blockId]) {
                    renderWidgetByBlock(blockId);
                }
                container.find('.ues-component-body').show();
            }
            updateLayout();
            saveDashboard();
        });

        $('.gadgets-grid').on('click', '.ues-component-box .ues-trash-handle', function () {
            var that = $(this);
            var componentBox = that.closest('.ues-component-box');
            $('.grid-stack').data('gridstack').remove_widget(componentBox.parent());
            removeWidgetFromDashboardJSON(componentBox.attr("id"));
            updateLayout();
            saveDashboard();
        });

        Sortable.create(document.getElementById("gadgetList"), {
            group: {
                name: 'tile__list',
                pull: 'clone',
                put: false
            },
            animation: 150,
            sort: true
        });

        var grid = $(".grid-stack-item");
        for (var i = 0; i < grid.length; i++) {
            Sortable.create(grid[i], {
                group: {
                    name: 'tile__list',
                    pull: false
                },
                animation: 150,
                onAdd: function (evt) {
                    evt.item.remove();
                    var blockID = evt.to.getAttribute("data-id");
                    var widgetID = evt.item.getAttribute("data-id");
                    renderWidgetByURL(blockID, Constants.FRAGMENT_URL + widgetID);
                    addWidgetToDashboardJSON(blockID, widgetID);
                    updateLayout();
                    saveDashboard();
                }
            });
        }
    };

    /**
     * update dashboard json Object by adding newly added widget.
     * @param blockID
     * @param widgetID
     */
    var addWidgetToDashboardJSON = function (blockID, widgetID) {
        dashboard.widgets[blockID] = widgetInfo[widgetID];
        dashboard.widgets[blockID].url = Constants.FRAGMENT_URL + widgetID;
    };

    /**
     * update dashboard json Object by adding newly added widget.
     * @param blockID
     * @param widgetID
     */
    var removeWidgetFromDashboardJSON = function (blockID) {
        delete dashboard.widgets[blockID];
    };

    /**
     * retrieve the gadget list by invoking the available api.
     */
    var initGadgetList = function () {
        var method = Constants.HTTP_GET;
        var url = Constants.WIDGET_METAINFO_GET_URL;
        $.ajax({
            url: url,
            method: method,
            async: true,
            success: function (widgetList) {
                generateWidgetInfoJSON(widgetList[0]);
                var widgetJSONLength = widgetList[0].length;
                for (var i = 0; i < widgetJSONLength; i++) {
                    UUFClient.renderFragment(Constants.WIDGET_LIST_CONTAINER_FRAGMENT_NAME, widgetList[0][i],
                        "left-panel", Constants.APPEND_MODE, widgetListCallback);
                }
            }
        });
    };

    /**
     * generate widgetInfo json object using retrieved data.
     * @param widgetList
     */
    var generateWidgetInfoJSON = function (widgetList) {
        for (var i = 0; i < widgetList.length; i++) {
            widgetInfo[widgetList[i].id] = widgetList[i];
        }
    };


    /**
     * Render Widgets in to blocks by reading the dashboard json.
     * */
    var renderWidgets = function (dashboard) {
        var i = "";
        for (i in dashboard.blocks) {
            if (dashboard.widgets[dashboard.blocks[i].id]) {
                renderWidgetByBlock(dashboard.blocks[i].id);
            }
        }
    };

    /**
     * Render Widget into a given block by reading the dashboard json.
     * */
    var renderWidgetByBlock = function (blockId) {
        widget.renderer.render(blockId, dashboard.widgets[blockId].url, false);
    };

    /**
     * Render Widget into a given block by reading the dashboard json.
     * */
    var renderWidgetByURL = function (blockId, widgetURL) {
        widget.renderer.render(blockId, widgetURL, false);
    };


    /**
     * Update the layout after modification.
     *
     */
    var updateLayout = function () {
        // extract the layout from the designer and save it
        var res = _.map($('.grid-stack .grid-stack-item:visible'), function (el) {
            el = $(el);
            var node = el.data('_gridstack_node');
            if (node) {
                return {
                    id: el.attr('data-id'),
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height
                };
            }
        });

        var serializedGrid = [];
        for (var i = 0; i < res.length; i++) {
            if (res[i]) {
                serializedGrid.push(res[i]);
            }
        }
        dashboard.blocks = serializedGrid;
    };

    /**
     * Saves the dashboard content.
     *
     */
    var saveDashboard = function () {
        var method = Constants.HTTP_PUT;
        var url = Constants.DASHBOARD_METADATA_UPDATE_URL;
        dashboard.url = dashboard.id;
        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(metaDataPayloadGeneration()),
            async: false,
            contentType: Constants.APPLICATION_JSON
        });
        //TODO: Implement notification message to display ajax call success/failure
    };

    /**
     * generate the metadata payload to invoke rest apis.
     * @returns metadata payload
     */
    var metaDataPayloadGeneration = function () {
        var metaDataPayload = {};
        if (!metadata) {
            metaDataPayload.url = dashboard.id;
            metaDataPayload.name = dashboard.name;
            metaDataPayload.version = dashboard.version;
            metaDataPayload.description = dashboard.description;
            metaDataPayload.isShared = dashboard.isShared;
            //TODO: Need to finalize with a parentID for original dashboards . Currently put -1 as parentID ,if it is not personalized
            metaDataPayload.parentId = "-1";
        } else {
            metaDataPayload = metadata;
            metaDataPayload.parentId = metadata.id;
        }
        //TODO: Need to update the hardcoded values with logged in user
        metaDataPayload.owner = "admin";
        metaDataPayload.lastUpdatedBy = "admin";
        metaDataPayload.lastUpdatedTime = new Date().getTime();
        metaDataPayload.content = JSON.stringify(dashboard);
        return metaDataPayload;
    };

    init();
}());