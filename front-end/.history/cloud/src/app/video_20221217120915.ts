

export interface Video {
    category_id: number,
    description: string,
    title: string,
    publisher: string,
    genre: string,
    producer: string,
    video_id: string,
    views: number,
    check: boolean,
    video: string,
    cover: string,
    collect: number,
    date: string,
    _id: string,
    comment?: _Comment[],

}
export interface pageInfo {
    page_num: number,
    page_size: number
}

export interface _Comment {
    _id: string,
    comment: string,
    dislikes: string[],
    likes: string[],
    replies?: [],
    userid: string,
    username: [],
    video_id: []
}
export interface ret {
    message: string
}