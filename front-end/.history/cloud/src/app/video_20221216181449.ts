

export interface Video {
    category_id: number,
    channel_title: string,
    description: string,
    title: string,
    video_id: string,
    views: number,
    likes: number,
    collect: number,
    date: string,
    _id: string,
    comments?: _Comment[],
    dislikes: number
    tags?: [],

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