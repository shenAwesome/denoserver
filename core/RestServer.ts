// deno-lint-ignore-file no-explicit-any no-unused-vars ban-types
import { Application, helpers, Router, RouterContext } from "https://deno.land/x/oak@v10.2.1/mod.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";
import { augmentConfiguration } from 'https://deno.land/x/deno_config@v0.1.2/mod.ts';


const Config = {
    port: 8000
}
augmentConfiguration(Config)

interface ParamsDictionary {
    [key: string]: string;
}

function readArgs(func: Function) {
    return (func + "")
        .replace(/[/][/].*$/mg, "") // strip single-line comments
        .replace(/\s+/g, "") // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments
        .split("){", 1)[0].replace(/^[^(]*[(]/, "") // extract the parameters
        .replace(/=[^,]+/g, "") // strip any ES6 defaults
        .split(",").filter(Boolean); // split & filter [""]
}

function parse(methodName: string) {
    const methods = 'get,post,put,delete'.split(',')
    let method = 'get', name = methodName
    methods.forEach(m => {
        if (methodName.startsWith(m)) {
            method = m
            name = methodName.substring(m.length)
        }
    })
    const path = '/' + name.toLowerCase()
    return { method, path }
}

class Service {
    constructor(public method: string, public path: string,
        public params: string[]) {

    }
    toString() {
        const { path, method, params } = this
        const _method = method.toUpperCase().padEnd(6, ' ')
        return `${_method} ${path} (${params.join(', ')})`
    }
}

async function runServer(controllers: any[]) {
    const services: Service[] = []
    const router = new Router();

    function install(Controller: new () => any) {
        const controller = new Controller();
        const propertyNames = Object.getOwnPropertyNames(
            Object.getPrototypeOf(controller),
        ).filter((n) => n !== "constructor");
        propertyNames.forEach((key) => {
            const fn = controller[key] as Function,
                fnArgs = readArgs(fn);
            const { method, path } = parse(key)

            async function handle(ctx: RouterContext<any, ParamsDictionary, Record<string, any>>) {
                const readBody = ctx.request.method == 'POST' || ctx.request.method == 'PUT'
                const params = readBody ? (await ctx.request.body({ type: "json" }).value) : helpers.getQuery(ctx)
                const args = fnArgs.map((a) => params[a]);
                let ret = fn.apply(controller, args)
                if (ret.then instanceof Function) ret = await ret
                ctx.response.body = ret;
            }

            if (method == 'get') router.get(path, handle)
            if (method == 'post') router.post(path, handle)
            if (method == 'put') router.put(path, handle)
            if (method == 'delete') router.get(path, handle)
            services.push(new Service(method, path, fnArgs))
        });
    }
    controllers.forEach((c) => install(c));

    router.get('/', ctx => {
        ctx.response.body = services
    })

    const app = new Application();
    app.use(router.routes());
    app.use(router.allowedMethods());
    console.debug(`DENO server is starting on ${Config.port}`)
    services.forEach(s => console.debug(s.toString()))
    await app.listen({ port: Config.port });
}

export { runServer };
