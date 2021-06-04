import React, { Component } from "react";
import { Post } from "./components/Post";
import { PostData } from "./types";

async function fetchJSON(path: string) {
    let response = await fetch(path);
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

export function hashString(s: string) {
    var hash = 0,
        i,
        chr;
    if (s.length === 0) return hash;
    for (i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function hashObject(obj: any) {
    return hashString(JSON.stringify(obj));
}

interface IProps {
    posts: PostData[];
}

interface IState {
    sortMode: "oldestFirst" | "newestFirst";
}

class AppMain extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            sortMode: "oldestFirst",
        };
    }

    getSortedPosts() {
        if (this.state.sortMode === "oldestFirst") {
            return this.props.posts.slice().reverse();
        } else {
            return this.props.posts;
        }
    }

    reverseSortingMode() {
        if (this.state.sortMode === "oldestFirst") {
            this.setState({ sortMode: "newestFirst" });
        } else {
            this.setState({ sortMode: "oldestFirst" });
        }
    }

    render() {
        let posts = this.getSortedPosts();
        let data = posts.map((postData) => <Post post={postData} key={hashObject(postData)} />);
        return (
            <div>
                <div className="header">
                    <span style={{ fontSize: "24pt" }}>South Community Updates and Anecdotes Archive</span>
                    <br></br>
                    <div style={{ opacity: "0.5", paddingLeft: "20vw", paddingRight: "20vw" }}>
                        On the night of March 25th, 2020, Newton South students realized that they were able to post
                        freely to a school-wide group page consisting of a combined 2,000 students and faculty at the
                        school. The following day, the page was taken down, but not before being archived for all of
                        posterity to see.
                    </div>
                </div>
                <div className="controls">
                    Sorting by:&nbsp;
                    <span
                        className="control-sort-toggle"
                        onClick={() => {
                            this.reverseSortingMode();
                        }}
                    >
                        {this.state.sortMode === "oldestFirst" ? "Oldest first" : "Newest first"}
                    </span>
                </div>
                <div className="main">{data}</div>
            </div>
        );
    }
}

export async function App() {
    let posts = (await fetchJSON("3am_posts.json")) as PostData[];
    return <AppMain posts={posts}></AppMain>;
}
