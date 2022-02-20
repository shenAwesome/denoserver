// deno-lint-ignore-file require-await no-unused-vars
import { v4 } from "https://deno.land/std@0.126.0/uuid/mod.ts";
import { ld as _ } from "https://x.nest.land/deno-lodash@1.0.0/mod.ts";
import { request } from 'https://cdn.skypack.dev/@esri/arcgis-rest-request?dts';
import { UserSession } from 'https://cdn.skypack.dev/@esri/arcgis-rest-auth';
import { getLayer } from 'https://cdn.skypack.dev/@esri/arcgis-rest-feature-layer'; //?dts will fail to compile

class Test {

    async test(name: string, age: string) {
        name = _.upperCase(name)
        const esri = await request("https://www.arcgis.com/sharing/rest/info")
        const authentication = new UserSession({ username: "jsmith", password: "123456" })
        const layer = await getLayer({
            url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0"
        })

        console.log(JSON.stringify(layer))

        return {
            ret: name + age,
            time: Date.now(),
            esri,
            layer: layer.type
        };
    }

    async postTest(name: string) {
        return {
            test: "hello post !!!!" + name
        }
    }

}

export default [Test] 
