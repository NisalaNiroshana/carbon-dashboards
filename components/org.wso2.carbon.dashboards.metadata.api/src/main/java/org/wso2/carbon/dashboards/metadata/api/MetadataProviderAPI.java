package org.wso2.carbon.dashboards.metadata.api;
/*
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import org.wso2.carbon.dashboards.metadata.bean.Metadata;
import org.wso2.carbon.dashboards.metadata.bean.PaginationContext;
import org.wso2.carbon.dashboards.metadata.bean.Query;
import org.wso2.carbon.dashboards.metadata.exception.MetadataException;
import org.wso2.carbon.dashboards.metadata.provider.MetadataProvider;
import org.wso2.msf4j.Microservice;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import java.util.List;

public class MetadataProviderAPI implements MetadataProvider, Microservice {

    @GET
    @Produces()
    public boolean isExists(Query query) throws MetadataException {
        return false;
    }

    public void add(Metadata metadata) throws MetadataException {

    }

    public void update(Metadata metadata) throws MetadataException {

    }

    public void delete(Query query) throws MetadataException {

    }

    @GET
    public Metadata get(Query query) throws MetadataException {
        Metadata metadata = new Metadata();
        metadata.setName("Sample Metadata");
        metadata.setShared(false);
        return metadata;
    }

    public List<Metadata> get(Query query, PaginationContext paginationContext) throws MetadataException {
        return null;
    }
}
