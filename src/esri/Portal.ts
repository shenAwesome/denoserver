
import { searchGroups, getGroupUsers, getUser } from "https://cdn.skypack.dev/@esri/arcgis-rest-portal";

class Obj {
    set(props: Partial<this>) {
        Object.assign(this, props)
        return this
    }
}

class Group extends Obj {
    constructor(public portal: Portal, public id: string) {
        super();
    }
    title = ''
    owner = ''
    admin: string[] = []
    users: string[] = []
}

class Portal {
    async getGroup(title: string) {
        let ret: Group | null = null
        const group = (await searchGroups({
            filter: `title:"${title}"`,
            num: 1
        })).results[0]
        if (group) {
            const id = group.id as string
            ret = new Group(this, id).set({ title })
            const { owner, admin, users } = await getGroupUsers(id)
            ret.set({ owner, admin: admin || [], users })
        }
        return ret
    }
    //https://esri.github.io/arcgis-rest-js/api/portal/addGroupUsers/
    //searchUsers
    async getUser(username: string) {
        const user = await getUser(`${username}`)
        return user
    }
}

export { Portal }