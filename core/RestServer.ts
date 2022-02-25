// deno-lint-ignore-file no-explicit-any no-unused-vars ban-types
import { Application, helpers, Router, RouterContext, send } from "https://deno.land/x/oak@v10.2.1/mod.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";
import { augmentConfiguration } from 'https://deno.land/x/deno_config@v0.1.2/mod.ts';
import { join, extname } from "https://deno.land/std/path/mod.ts";


const __dirname = new URL('.', import.meta.url).pathname.substring(1)


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

class Service {

    toHtml() {
        const { path, method, params, doc } = this
        return `<div class='serviceCard'> 
            <a href='${path}'>${path}</a> 
            <div class='serviceDoc'>
                ${doc.doc}
            </div>
        </div>`
    }

    public method: string = '' as any
    public path: string = '' as any
    public doc: Doc = null as any
    public fn: Function = null as any
    public params: string[] = []

    constructor(props: Partial<Service>) {
        Object.assign(this, props)
    }

    toString() {
        const { path, method, params } = this
        const _method = method.toUpperCase().padEnd(6, ' ')
        return `${_method} ${path} (${params.join(', ')})`
    }

    async handle(ctx: RouterContext<any, ParamsDictionary, Record<string, any>>) {
        const readBody = ctx.request.method == 'POST' || ctx.request.method == 'PUT'


        const params = readBody ? (await ctx.request.body({ type: "json" }).value) : helpers.getQuery(ctx)
        const args = this.params.map((a) => params[a]);
        let ret = this.fn.apply(null, args)
        if (ret.then instanceof Function) ret = await ret
        //for JSON:
        ctx.response.body = ret;

        //https://stackoverflow.com/questions/65496698/handling-multipart-form-data-with-deno-and-oak
    }
}

const range = (start: number, stop: number, step = 1) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))

interface Doc {
    doc: string
    tags: string[]
}

function findDoc(allSrc: string[], fn: Function) {
    const fnStr = fn.toString().split('\n')[0].trim().split('(')[0] + '('
    const find = allSrc.findIndex(line => line.trim().startsWith(fnStr))
    const docs = []
    if (find != -1) {
        let idx = find
        while (true) {
            idx--;
            const line = allSrc[idx]
            if (line && line.trim().startsWith('*')) {
                docs.push(line.trim().substring(1).trim())
            } else {
                break
            }
        }
        docs.reverse()
    }
    const remove = ["@returns", "/"],
        tags = [] as string[], rest = [] as string[]
    docs.filter(d => !remove.includes(d)).forEach(d => {
        (d.startsWith('@') ? tags : rest).push(d)
    })
    return { doc: rest.join('\n'), tags }
}

async function getAllSrc() {
    const srcFolder = new URL('../src', import.meta.url).pathname.substring(1)
    const srcList = [] as string[]
    const files: string[] = [];
    for await (const dirEntry of Deno.readDir(srcFolder)) {
        if (dirEntry.isFile && extname(dirEntry.name) == '.ts') {
            files.push(`${srcFolder}/${dirEntry.name}`)
        }
    }
    for (const f of files) {
        console.log('f: ', f);
        srcList.push(await Deno.readTextFile(f))
    }
    return srcList.join('\n').split('\n')
}

async function runServer(controllers: { [key: string]: new () => any }) {

    const home = new URL('.', import.meta.url).pathname.substring(1)

    const services: Service[] = []
    const router = new Router();

    const allSrc = await getAllSrc()
    console.log('allSrc: ', allSrc.length);

    function install(serviceName: string, Controller: new () => any) {
        console.log('serviceName: ', serviceName);
        const controller = new Controller();


        const propertyNames = Object.getOwnPropertyNames(
            Object.getPrototypeOf(controller),
        ).filter((n) => n !== "constructor");
        propertyNames.map((key) => {
            const fn = controller[key] as Function,
                fnArgs = readArgs(fn);
            //const { method, path } = parse(key)
            let method = 'get'
            const path = `/${serviceName}/key`.toLowerCase()
            const doc = findDoc(allSrc, fn)
            const service = new Service({
                method, path, doc,
                fn: fn.bind(controller), params: fnArgs
            })

            function handle(ctx: RouterContext<any, ParamsDictionary, Record<string, any>>) {
                return service.handle(ctx)
            }

            router.get(path, handle)//always supports get
            if (method == 'post') router.post(path, handle)
            if (method == 'put') router.put(path, handle)
            if (method == 'delete') router.get(path, handle)
            services.push(service)
        })
    }



    Promise.all(Object.entries(controllers).map(([name, Cls]) => {
        install(name, Cls)
    }))

    router.get('/', ctx => {
        console.log(ctx.request.accepts())
        ctx.response.body = ` 
        <html>
        <head>
            <link rel="stylesheet" href="index.css">
        </head>

        <body>
            ${services.map(s => s.toHtml()).join('')} 
        </body>
        </html>
        `
    })

    const app = new Application()
    app.use(router.routes())
    app.use(router.allowedMethods())

    app.use(async (context, next) => {
        try {
            await context.send({
                root: `${__dirname}/../static`
            })
        } catch (e) {
            next()
        }
    })

    console.debug(`DENO server is starting on ${Config.port} from ${home}`)
    services.forEach(s => console.debug(s.toString()))
    await app.listen({ port: Config.port });
}

export { runServer };
