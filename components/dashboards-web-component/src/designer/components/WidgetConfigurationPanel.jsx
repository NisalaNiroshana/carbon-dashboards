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

import React from 'react';

import Drawer from 'material-ui/Drawer';
import Checkbox from 'material-ui/Checkbox';
import {Card, CardMedia} from 'material-ui/Card';

import {dashboardLayout} from '../../utils/WidgetLoadingComponent';
import {pubsubComponent} from '../../utils/PubSubComponent';
import DashboardUtils from '../../utils/DashboardUtils';
import {FormattedMessage} from 'react-intl';

const styles = {
    widgetDrawer: {
        background: '#192830'
    }
};

class WidgetConfigurationPanel extends React.Component {

    constructor(props) {
        super(props);
        this.getPublishers = this.getPublishers.bind(this);
        this.handlePublisherCheckBoxEvent = this.handlePublisherCheckBoxEvent.bind(this);
        this.getSubscriberTopics = this.getSubscriberTopics.bind(this);
        this.state = {
            checked: false
        }
        this.publisherTopicsMap = new Map();
    }

    handlePublisherCheckBoxEvent(event, isInputChecked) {
        let selectedWidget = dashboardLayout.selectedItem;
        console.log("DASASASAS")
        console.log(dashboardLayout.toConfig())
        DashboardUtils.getWidgetProps(dashboardLayout.toConfig().content,event.currentTarget.id);
        console.log("LOG")
        let key = event.currentTarget.id + "_" +
            event.currentTarget.name.substring(0, event.currentTarget.name.lastIndexOf("_"));
        if (isInputChecked) {
            pubsubComponent.wire(selectedWidget.config.content[0].props.id, event.currentTarget.id);
            this.persistPubSubWiringInDashboardJSON(dashboardLayout.toConfig().content, selectedWidget.config.content[0].props.id,
                event.currentTarget.id);
            console.log(key + "   KEY --------------")
            console.log(event.currentTarget)
            let publisherTopics = dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.publisherTopics;
            if (publisherTopics) {
                this.publisherTopicsMap.set(key, publisherTopics);
            } else {
                this.publisherTopicsMap.set(key, ["default_topic"]);
            }
            console.log("AASASASAS----")
            this.setState({checked: true});
        } else {
            if (pubsubComponent.unwire(selectedWidget.config.content[0].props.id, event.currentTarget.id)) {
                this.unpersistPubSubWiringInDashboardJSON(dashboardLayout.toConfig().content,
                    selectedWidget.config.content[0].props.id, event.currentTarget.id);
                console.log(event.currentTarget.id)
                console.log("AASASASAS----ELSE")
                console.log(event.currentTarget)
                console.log(key + "   KEY --------------")
                this.publisherTopicsMap.delete(key)
                this.setState({checked: false});
            }
        }
    }

    persistPubSubWiringInDashboardJSON(content, subscriberId, publisherId) {
        content.forEach(contentItem => {
            if (contentItem.type !== 'component') {
                this.persistPubSubWiringInDashboardJSON(contentItem.content, subscriberId, publisherId)
            } else {
                if (subscriberId === contentItem.props.id) {
                    if (!contentItem.props.configs.pubsub.publishers) {
                        contentItem.props.configs.pubsub.publishers = [];
                    }
                    contentItem.props.configs.pubsub.publishers.push(publisherId.toString())
                }
            }
        });
    }

    unpersistPubSubWiringInDashboardJSON(content, subscriberId, publisherId) {
        content.forEach(contentItem => {
            if (contentItem.type !== 'component') {
                this.unpersistPubSubWiringInDashboardJSON(contentItem.content, subscriberId, publisherId)
            } else {
                if (subscriberId === contentItem.props.id) {
                    let position = contentItem.props.configs.pubsub.publishers.indexOf(publisherId);
                    contentItem.props.configs.pubsub.publishers.splice(position, 1);
                }
            }
        });
    }

    getPublishers() {
        let publishers = [];
        let publisherMapKey;
        if (dashboardLayout.selectedItem &&
            dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.types.indexOf("subscriber") !== -1) {
            for (let [key, val] of pubsubComponent.getPublishersMap().entries()) {
                this.state.checked = !!(dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.publishers &&
                    dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.publishers.indexOf(val) !== -1);
                publisherMapKey = val + "_" + key.substring(0, key.lastIndexOf("_"));
                if (this.state.checked) {
                    let publisherTopics = dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.publisherTopics;
                    if (publisherTopics) {
                        this.publisherTopicsMap.set(publisherMapKey, publisherTopics);
                    } else {
                        this.publisherTopicsMap.set(publisherMapKey, ["default_topic"]);
                    }
                }
                console.log(key);
                console.log(val)
                console.log("THARUNDI")
                publishers.push(<Checkbox id={val}
                                          label={key.substring(0, key.length - 4)}
                                          name={key}
                                          onCheck={this.handlePublisherCheckBoxEvent}
                                          checked={this.state.checked}
                                          className="publishers-list"/>)
            }
        }
        return publishers;
    }

    getPublisherTopics() {

    }

    getSubscriberTopics() {
        let subscriberTopics = [];
        if (dashboardLayout.selectedItem && dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.subscriberTopics) {
            dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.subscriberTopics.map((topic) => {
                subscriberTopics.push(<div style={{marginBottom: 10}}>{topic}</div>)
                for (let [key, val] of this.publisherTopicsMap.entries()) {
                    subscriberTopics.push(<Checkbox id={val + key.split(0, key.length - 4)}
                                                    label={val + key.substring(key.lastIndexOf("_"), key.length)}
                                                    name={key}
                                                    className="publishers-list"/>)
                }
            });
        }
        subscriberTopics.length === 0 ? subscriberTopics.push(<div>default-topic</div>) : "";
        return subscriberTopics;
    }

    render() {
        return (<Drawer open={this.props.open} openSecondary={true}
                        containerStyle={styles.widgetDrawer}
                        containerClassName="widget-configuration-panel">
            <div className="widget-configuration-panel-header"><FormattedMessage id="widget.configuration"
                                                                                 defaultMessage="Widget Configuration"/>
            </div>
            <div><FormattedMessage id="publisher.list.heading" defaultMessage="Publishers"/></div>
            {this.getPublishers()}
            <div style={{margin: "10px"}}>
                <Card
                    style={{padding: 15}}
                    expanded={true}
                >
                    <CardMedia
                        expandable
                    >
                        {this.getSubscriberTopics()}
                    </CardMedia>
                </Card>
            </div>
        </Drawer>);
    }

}

export default WidgetConfigurationPanel;