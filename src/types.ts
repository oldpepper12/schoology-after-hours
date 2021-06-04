export interface PostData {
    user: UserData;
    content: string;
    attachments: string[];
    timestamp: string;
    comments: CommentData[];
    likes: number
}

export interface UserData {
    name: string;
    profileLink: string;
}

export interface CommentData {
    user: UserData;
    content: string;
}