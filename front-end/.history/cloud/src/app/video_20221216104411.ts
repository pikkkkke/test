import { _Comment } from "./video/comment"

export interface Video {
    category_id: number,
    channel_title: string,
    description: string,
    title: string,
    video_id: string,
    views: number,
    likes: number,
    _id: string,
    comments?: _Comment[],
    like_users?: [],
    dislike_users?: [],
    dislikes: number
    tags?: [],

}
export interface pageInfo {
    page_num: number,
    page_size: number
}
