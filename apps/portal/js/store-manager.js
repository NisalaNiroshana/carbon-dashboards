/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
var getAsset, getAssets, addAsset, deleteAsset, getDashboardsFromRegistry;

(function () {
    var log = new Log();

    var carbon = require('carbon');
    var utils = require('/modules/utils.js');
    var moduleDashboards = require('/modules/dashboards.js');
    var config = require('/configs/designer.json');
    var DEFAULT_STORE_TYPE = 'fs';
    var LEGACY_STORE_TYPE = 'store';


    var STORE_EXTENSIONS_LOCATION = '/extensions/stores/';
    var DEFAULT_THUMBNAIL = 'local://images/gadgetIcon.png';

    var registryPath = function (id) {
        var path = '/_system/config/ues/dashboards';
        return id ? path + '/' + id : path;
    };

    var storeExtension = function (storeType) {
        return STORE_EXTENSIONS_LOCATION + storeType + '/index.js';
    };

    getDashboardsFromRegistry = function (start, count, registry) {
        if (!registry) {
            var server = new carbon.server.Server();
            registry = new carbon.registry.Registry(server, {
                system: true
            });
        }
        return registry.content(registryPath(), {
            start: start,
            count: count
        });
    };

    /**
     * Check whether a view is allowed for the current user
     * according to his/her list of roles
     * @param viewRoles Allowed roles list for the view
     * @param userRolesList Particular user`s roles
     * @returns {boolean} View is allowed or not
     */
    var isAllowedView = function (viewRoles, userRolesList) {
        for (var i = 0; i < userRolesList.length; i++) {
            var tempUserRole = userRolesList[i];
            for (var j = 0; j < viewRoles.length; j++) {
                if (viewRoles[j] === String(tempUserRole)) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Returns the list of allowed views for the current user
     * @param dashboard Current Dashboard
     * @param userRoles roles of the current user
     * @returns {Boolean} true if there is a allowed view
     */
    var getUserAllowedViews = function (dashboard, userRoles) {
        var pages = dashboard.pages;
        for (var j = 0; j < pages.length; j++) {
            var views = Object.keys(JSON.parse(JSON.stringify(pages[j].views.content)));
            var allowedViews = [];
            for (var i = 0; i < views.length; i++) {
                var viewRoles = pages[j].views.content[views[i]].roles;
                if (isAllowedView(viewRoles, userRoles)) {
                    return true;
                }
            }
        }
        return false;
    };

    var findDashboards = function (ctx, type, query, start, count) {
        if (!ctx.username) {
            return [];
        }
        var server = new carbon.server.Server();
        var registry = new carbon.registry.Registry(server, {
            system: true
        });
        var um = new carbon.user.UserManager(server, ctx.tenantId);
        var userRoles = um.getRoleListOfUser(ctx.username);

        var dashboards = getDashboardsFromRegistry(start, count, registry);
        var superTenantDashboards = null;
        var superTenantRegistry = null;

        if (ctx.tenantId !== carbon.server.superTenant.tenantId) {
            utils.startTenantFlow(carbon.server.superTenant.tenantId);
            superTenantRegistry = new carbon.registry.Registry(server, {
                system: true,
                tenantId: carbon.server.superTenant.tenantId
            });
            superTenantDashboards = getDashboardsFromRegistry(start, count, superTenantRegistry);
            utils.endTenantFlow();
        }

        if (!dashboards && !superTenantDashboards) {
            return [];
        }

        var userDashboards = [];
        var allDashboards = [];

        if (dashboards) {
            dashboards.forEach(function (dashboard) {
                var contentDashboardJSON = JSON.parse(registry.content(dashboard));
                if (dashboard == registryPath(contentDashboardJSON.id)) {
                    if (!(contentDashboardJSON.permissions).hasOwnProperty("owners")) {
                        contentDashboardJSON.permissions.owners = contentDashboardJSON.permissions.editors;
                    }
                    allDashboards.push(contentDashboardJSON);
                }
            });
        }
        if (superTenantDashboards) {
            utils.startTenantFlow(carbon.server.superTenant.tenantId);
            superTenantDashboards.forEach(function (dashboard) {
                var parsedDashboards = moduleDashboards.getConvertedDashboardContent(superTenantRegistry, dashboard);
                if (parsedDashboards.shareDashboard) {
                    if (!(parsedDashboards.permissions).hasOwnProperty("owners")) {
                        parsedDashboards.permissions.owners = parsedDashboards.permissions.editors;
                    }
                    allDashboards.push(parsedDashboards);
                }
            });
            utils.endTenantFlow();
        }
        if (allDashboards) {
            allDashboards.forEach(function (dashboard) {
                var permissions = dashboard.permissions,
                    data = {
                        id: dashboard.id,
                        title: dashboard.title,
                        description: dashboard.description,
                        pagesAvailable: getUserAllowedViews(dashboard, userRoles),
                        editable: !(dashboard.shareDashboard && ctx.tenantId !== carbon.server.superTenant.tenantId),
                        shared: (dashboard.shareDashboard && ctx.tenantId !== carbon.server.superTenant.tenantId),
                        owner: true
                    };
                if (utils.allowed(userRoles, permissions.owners)) {
                    userDashboards.push(data);
                    return;
                }
                if (utils.allowed(userRoles, permissions.editors)) {
                    data.owner = false;
                    userDashboards.push(data);
                    return;
                }
                if (utils.allowed(userRoles, permissions.viewers)) {
                    data.editable = false;
                    data.owner = false;
                    userDashboards.push(data);
                }
            });
        }
        return userDashboards;
    };

    /**
     * To provide backward compatibility for gadgets
     * @param url
     * @param storeType
     * @returns corrected url
     */
    var fixLegacyURL = function (url, storeType) {
        if (url) {
            var index = url.indexOf('://');
            var currentStore = url.substring(0, index);
            if (currentStore === LEGACY_STORE_TYPE) {
                return url.replace(LEGACY_STORE_TYPE, DEFAULT_STORE_TYPE);
            }
        } else {
            log.error('url is not defined in asset.json file');
        }
        return storeType.concat('://' + url);
    };
    
    /**
     * Find an asset based on the type and asset id
     * @param type
     * @param id
     * @returns {*}
     */
    getAsset = function (type, id) {
        var storeTypes = config.store.types;
        for (var i = 0; i < storeTypes.length; i++) {
            var specificStore = require(storeExtension(storeTypes[i]));
            var asset = specificStore.getAsset(type, id);
            if (asset) {
                break;
            }
        }
        return asset;
    };

    /**
     * Fetch assets from all the plugged in stores and aggregate
     * @param type
     * @param query
     * @param start
     * @param count
     * @returns {Array}
     */
    getAssets = function (type, query, start, count, storeType) {
        var ctx = utils.currentContext();
        if (type === 'dashboard') {
            return findDashboards(ctx, type, query, start, count);
        }
        var server = new carbon.server.Server();
        var um = new carbon.user.UserManager(server, ctx.tenantId);
        var userRoles = um.getRoleListOfUser(ctx.username);
        var allAssets = [];
        var storeTypes = config.store.types;
        for (var i = 0; i < storeTypes.length; i++) {
            if ((storeType && storeTypes[i] === storeType) || !storeType) {
                var specificStore = require(storeExtension(storeTypes[i]));
                var assets = specificStore.getAssets(type, query);
                if (assets) {
                    for (var j = 0; j < assets.length; j++) {
                        var allowedRoles = assets[j].allowedRoles;
                        if (allowedRoles && !utils.allowed(userRoles, allowedRoles)) {
                            assets.splice(j, 1);
                        } else {
                            if (assets[j].thumbnail) {
                                assets[j].thumbnail = fixLegacyURL(assets[j].thumbnail, storeTypes[i]);
                            } else {
                                log.warn('Thumbnail url is missing in ' + assets[j].title);
                                assets[j].thumbnail = DEFAULT_THUMBNAIL;
                            }
                            if (type === 'gadget' && assets[j].data && assets[j].data.url) {
                                assets[j].data.url = fixLegacyURL(assets[j].data.url, storeTypes[i]);
                            } else if (type === 'layout' && assets[j].url) {
                                assets[j].url = fixLegacyURL(assets[j].url, storeTypes[i]);
                            } else {
                                log.warn('Url is not defined for ' + assets[j].title);
                            }
                        }
                    }
                    allAssets = assets.concat(allAssets);
                }
            }
        }
        var end = start + count;
        end = end > allAssets.length ? allAssets.length : end;
        allAssets = allAssets.slice(start, end);
        return allAssets;
    };

    /**
     * To add a asset to a relevant store
     * @param {String} type Type of the asset to be added
     * @param {String} id Id of the asset to be added
     * @param {File} assertFile File which contains the asset
     * @param {String} storeType Store type to add the asset
     * @returns {*}
     */
    addAsset = function (type, id, assertFile, storeType) {
        var storeTypes = config.store.types;
        var storeTypesLength = config.store.types.length;
        for (var i = 0; i < storeTypesLength; i++) {
            if (storeType === storeTypes[i]) {
                var specificStore = require(storeExtension(storeTypes[i]));
                return specificStore.addAsset(type, id, assertFile);
            }
        }
    };

    /**
     * To delete a asset
     * @param {String} type Type of the asset to be deleted
     * @param {String} id ID of the asset
     * @param {String} storeType Store type asset belongs to
     */
    deleteAsset = function (type, id, storeType) {
        var storeTypes = config.store.types;
        var storeTypesLength = config.store.types.length;
        for (var i = 0; i < storeTypesLength; i++) {
            if (storeType === storeTypes[i]) {
                var specificStore = require(storeExtension(storeTypes[i]));
                return specificStore.deleteAsset(type, id);
            }
        }
    };
}());