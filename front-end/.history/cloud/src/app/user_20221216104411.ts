export interface User {
    username: string,
    password: string
}
export interface loginInfo {
    avatar: string | null,
    email: string | null,
    token: string | null,
    username: string | null,
    userid: string,
}
export interface userinfo {
    _id: string,
    admin: boolean,
    displayname: string,
    email: string,
    username: string
}
export interface interface_favorites {
    favorites: string[],
    userid: string
}
export interface interface_follows {
    follows: string[],
    userid: string
}