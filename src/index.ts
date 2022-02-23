// deno-lint-ignore-file require-await no-unused-vars
import { v4 } from "https://deno.land/std@0.126.0/uuid/mod.ts";
import { ld as _ } from "https://arweave.net/L92fXEGOMl2rGqlDvH6fvtEORNo2LlbDkvtn3jik9F4/mod.ts";
import { request } from 'https://cdn.skypack.dev/@esri/arcgis-rest-request?dts';
import { UserSession } from 'https://cdn.skypack.dev/@esri/arcgis-rest-auth';
import { getLayer } from 'https://cdn.skypack.dev/@esri/arcgis-rest-feature-layer'; //?dts will fail to compile 
import { toGeom } from "https://esm.sh/@aslab/geocalc@1.0.33"
import { searchGroups } from "https://cdn.skypack.dev/@esri/arcgis-rest-portal";

import { Portal } from './esri/Portal.ts'

//import jsts from 'https://cdn.skypack.dev/jsts';

class Test {

    async testPortal(name: string) {
        const portal = new Portal()
        const group = portal.getGroup('Fire')
        return portal.getUser(name)
    }

    testGeom(radius = 100) {
        const point = toGeom(`{
            "type": "Point",
            "coordinates": [125.6, 10.1]
        }`)
        const polygon = point.buffer(parseInt(radius + ''))
        return {
            test: 'hello',
            feat: polygon.area(),
            json: polygon.toJSON()
        }
    }

    async test(name: string, age: string) {
        name = _.upperCase(name)
        const esri = await request("https://www.arcgis.com/sharing/rest/info")
        const authentication = new UserSession({ username: "jsmith", password: "123456" })
        const layer = await getLayer({
            url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0"
        })

        return {
            ret: name + age,
            time: Date.now(),
            esri,
            layer: layer.type,
            version: 1.0
        };

        /**
         *  * const session = new UserSession({
 *   username: "jsmith",
 *   password: "123456",
 *   // optional
 *   portal: "https://[yourserver]/arcgis/sharing/rest"
 * })
 *
 * request(url, { authentication: session })
         */
    }

    async postTest(name: string) {
        return {
            test: "hello post !!!!" + name
        }
    }

}

export default [Test] 
