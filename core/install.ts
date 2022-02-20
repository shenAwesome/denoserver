
function read(xml: string, tag: string) {
    const start = `<${tag}>`,
        end = `</${tag}>`
    const startIndex = xml.indexOf(start) + start.length,
        endIndex = xml.indexOf(end)
    return xml.substring(startIndex, endIndex)
}

function write(xml: string, tag: string, content: string) {
    const start = `<${tag}>`,
        end = `</${tag}>`
    const startIndex = xml.indexOf(start) + start.length,
        endIndex = xml.indexOf(end)
    return xml.substring(0, startIndex) + content + xml.substring(endIndex)
}

async function main() {
    let xml = await Deno.readTextFile("./DenoServer.xaml")
    let executable = read(xml, 'executable')
    const __dirname = new URL('.', import.meta.url).pathname
    executable = __dirname.replaceAll('/', '\\').substring(1) + 'deno.exe'
    xml = write(xml, 'executable', executable)
    await Deno.writeTextFile("./DenoServer.xaml", xml)
}

await main()