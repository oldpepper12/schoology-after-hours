import React from "react";
import { PRNG } from "../prng";
import { PostData, UserData } from "../types";

interface IProps {
    post: PostData;
}

interface IState {
    shouldHide: boolean;
    postExpanded: boolean;
}

function fmtTimeString(timestamp: string) {
    let date = new Date(Number.parseInt(timestamp) * 1000);
    return date
        .toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" })
        .toLowerCase();
}

function pluralize(qty: number, singular: string, plural: string) {
    return qty + " " + (qty === 1 ? singular : plural);
}

export class Post extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            shouldHide: props.post.content.length > 2000,
            postExpanded: false,
        };
    }
    getPfpFile(forUser: UserData) {
        let variants = [0, 1, 2, 3, 4, 5];
        let prng = new PRNG(forUser.name);
        return `assets/pfp${variants[Math.floor(prng.nextFloat() * 6)]}.png`;
    }

    renderPostExpander() {
        return (
            <span
                className="post-expander"
                onClick={() => {
                    this.setState({
                        postExpanded: !this.state.postExpanded,
                    });
                }}
            >
                {this.state.postExpanded ? "Show less" : "Show more"}
            </span>
        );
    }

    postContentWithURLsFormatted(content: string) {
        let urlPattern =
            /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g;
        for (let url of content.match(urlPattern) || []) {
            content = content.replace(url, `<a href="${url}">${url}</a>`);
        }

        return <span dangerouslySetInnerHTML={{ __html: content }} style={{ whiteSpace: "pre-wrap" }}></span>;
    }

    renderPostContent() {
        let post = this.props.post;
        let formatted = this.postContentWithURLsFormatted(post.content);
        if (this.state.shouldHide) {
            if (this.state.postExpanded) {
                return (
                    <div className="post-content">
                        {formatted}
                        {this.renderPostExpander()}
                    </div>
                );
            } else {
                return (
                    <div>
                        <div
                            className="post-content"
                            style={{ maxHeight: "200px", overflowY: "hidden", overflowX: "hidden" }}
                        >
                            {formatted}
                        </div>
                        {this.renderPostExpander()}
                    </div>
                );
            }
        } else {
            return <div className="post-content">{formatted}</div>;
        }
    }

    renderAttachments() {
        let post = this.props.post;
        return (
            <div>
                {post.attachments.map((url) => (
                    <img src={url} key={url} className="post-attach"></img>
                ))}
            </div>
        );
    }

    renderComments() {
        let post = this.props.post;

        if (post.comments.length === 0) {
            return;
        }

        return (
            <div>
                <span className="hr"></span>
                <span className="post-info">{pluralize(post.comments.length, "comment", "comments")}</span>
                {post.comments.map((comment) => (
                    <div className="comment">
                        <span className="user-info comment-user-info">
                            <img src={this.getPfpFile(comment.user)} className=" comment-user-pfp user-pfp"></img>
                            <a href={comment.user.profileLink}>{comment.user.name}</a>
                        </span>
                        <div className="comment-content">{comment.content}</div>
                    </div>
                ))}
            </div>
        );
    }

    render() {
        let post = this.props.post;
        return (
            <div className="post">
                <span className="user-info">
                    <img src={this.getPfpFile(post.user)} className="user-pfp"></img>
                    <a href={post.user.profileLink}>{post.user.name}</a>
                </span>
                <span className="hr"></span>
                {this.renderPostContent()}
                {this.renderAttachments()}
                <span className="post-likes post-info">
                    <span className="material-icons">favorite</span>&nbsp;{pluralize(post.likes, "person", "people")} liked this
                    <span style={{ opacity: "0.5" }}>&nbsp;• posted at {fmtTimeString(post.timestamp)}</span>
                </span>
                {this.renderComments()}
            </div>
        );
    }
}
