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
var getAsset;
var getAssets;
var addAsset;
var deleteAsset;
var getAssetFilePath;
var isDeletable;
var isDownloadable;

(function () {
    var log = new Log();

    var dir = '/store/';
    var GADGET_ATTRIBUTES = 'attributes';
    var GADGET_ID = 'overview_id';
    var GADGET_VERSION = 'overview_version';

    var utils = require('/modules/utils.js');
    var config = require('/extensions/stores/es/config.json');
    var constants = require('/modules/constants.js');
    var deletable = true;
    var downloadable = true;

    var assetsDir = function (ctx, type) {
        var carbon = require('carbon');
        var config = require('/modules/config.js').getConfigFile();
        var domain = config.shareStore ? carbon.server.superTenant.domain : ctx.domain;
        return dir + domain + '/' + constants.ES_STORE + '/' + type + '/';
    };

    var obtainAuthorizedHeaderForAPICall = function () {
        var password = config.authConfiguration.password;
        if (config.authConfiguration.isSecureVaultEnabled) {
            password = resolvePassword(password);
        }
        var authenticate = post(config.authenticationApi, {
            "password": password,
            "username": config.authConfiguration.username
        }, {}, 'json');
        return {
            'Cookie': "JSESSIONID=" + authenticate.data.data.sessionId + ";",
            'Accept': 'application/json'
        };
    };

    var getPublishedAssets = function () {
        var headers = obtainAuthorizedHeaderForAPICall();
        var assets = parse((get(config.publishedAssetApi, headers, 'application/json')).data).data;
        var publishedAssets = [];
        for (var i = 0; i < assets.length; i++) {
            var asset_id = (assets[i][GADGET_ATTRIBUTES][GADGET_ID] + config.dirNameDelimiter
            + assets[i][GADGET_ATTRIBUTES][GADGET_VERSION]).replace(/ /g, config.dirNameDelimiter);
            publishedAssets.push(asset_id);
        }
        return publishedAssets;
    };

    getAsset = function (type, id) {
        if (type === 'layout') {
            return;
        }
        var ctx = utils.currentContext();
        var parent = assetsDir(ctx, type);
        var file = new File(parent + id);
        if (!file.isExists()) {
            return null;
        }
        file = new File(file.getPath() + '/' + type + '.json');
        if (!file.isExists()) {
            return null;
        }
        file.open('r');
        var asset = JSON.parse(file.readAll());
        file.close();
        return asset;
    };

    getAssetFilePath = function (type, id) {
        if (type === 'layout') {
            return;
        }
        var ctx = utils.currentContext();
        var parent = assetsDir(ctx, type);
        var file = new File(parent + id);
        if (!file.isExists()) {
            return null;
        }

        var path = file.getPath();
        file.close();
        return path;
    };

    getAssets = function (type, query, start, count) {
        if (type === 'layout') {
            return;
        }
        var ctx = utils.currentContext();
        var parent = new File(assetsDir(ctx, type));
        var assetz = parent.listFiles();
        var assets = [];
        var gadgetJSON = {};
        var gadgetID = null;
        query = query ? new RegExp(query, 'i') : null;
        assetz.forEach(function (file) {
            if (!file.isDirectory()) {
                return;
            }
            gadgetID = file.getPath().substr(file.getPath().lastIndexOf(constants.FORWARD_SLASH) + 1);
            file = new File(file.getPath() + '/' + type + '.json');
            if (file.isExists()) {
                file.open('r');
                try {
                    var asset = JSON.parse(file.readAll());
                    if (!query) {
                        assets.push(asset);
                        file.close();
                        return;
                    }
                    var title = asset.title || '';
                    if (!query.test(title)) {
                        file.close();
                        return;
                    }
                    assets.push(asset);
                } catch (error) {
                    gadgetJSON = {};
                    gadgetJSON.id = gadgetID;
                    gadgetJSON.thumbnail = constants.WARNING_THUMBNAIL_URL;
                    gadgetJSON.title = constants.ERROR_TTILE_PART1 + type + constants.ERROR_TITLE_PART2 + gadgetID;
                    gadgetJSON.error = true;
                    assets.push(gadgetJSON);
                } finally {
                    file.close();
                }
            }
        });
        return assets;
    };

    /**
     * To add an asset to es store
     * @param {String} type Type of the asset to be added
     * @param {String} id Id of the asset
     * @param {Object} assetFile File with the asset
     * @returns {boolean} true if the asset upload succeeds
     */
    addAsset = function (type, id, assetFile) {
        var ctx = utils.currentContext();
        var parent = assetsDir(ctx, type);
        var assetDir = new File(parent + id + "_gdt.gdt");

        try {
            assetDir.open('w');
            assetDir.write(assetFile.getStream());
            assetDir.unZip(parent + id);
            return true;
        } catch (e) {
            log.error("Cannot add asset to " + constants.ES_STORE);
            throw e;
        } finally {
            assetDir.close();
            assetDir.del();
        }
    };

    /**
     * To delete an asset from Enterprise Store
     * @param {String} type Type of the asset
     * @param {String} id Id of the asset
     * @returns true if the asset is deleted otherwise null
     */
    deleteAsset = function (type, id) {
        var ctx = utils.currentContext();
        var parent = assetsDir(ctx, type);
        var file = new File(parent + id);
        if (!file.isExists()) {
            return null;
        }
        file.del();
        return true;
    };

    /**
     * Return whether gadgets from this store is deletable or not.
     * @return {boolean}
     * */
    isDeletable = function () {
        return deletable;
    };

    /**
     * Return whether gadgets from this store is downloadable or not.
     * @return {boolean}
     * */
    isDownloadable = function () {
        return downloadable;
    };
}());