var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
/*
    Adapted from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
*/
define("prng", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PRNG = void 0;
    function xmur3(str) {
        for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
                h = h << 13 | h >>> 19;
        return function () {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
        };
    }
    function xoshiro128ss(a, b, c, d) {
        return function () {
            var t = b << 9, r = a * 5;
            r = (r << 7 | r >>> 25) * 9;
            c ^= a;
            d ^= b;
            b ^= c;
            a ^= d;
            c ^= t;
            d = d << 11 | d >>> 21;
            return (r >>> 0) / 4294967296;
        };
    }
    class PRNG {
        constructor(seed) {
            let seedFunc = xmur3(seed);
            this._rng = xoshiro128ss(seedFunc(), seedFunc(), seedFunc(), seedFunc());
        }
        nextFloat() {
            return this._rng();
        }
    }
    exports.PRNG = PRNG;
});
define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("components/Post", ["require", "exports", "react", "prng"], function (require, exports, react_1, prng_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Post = void 0;
    react_1 = __importDefault(react_1);
    function fmtTimeString(timestamp) {
        let date = new Date(Number.parseInt(timestamp) * 1000);
        return date
            .toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" })
            .toLowerCase();
    }
    class Post extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.state = {
                shouldHide: props.post.content.length > 2000,
                postExpanded: false,
            };
        }
        getPfpFile(forUser) {
            let variants = [0, 1, 2, 3, 4, 5];
            let prng = new prng_1.PRNG(forUser.name);
            return `assets/pfp${variants[Math.floor(prng.nextFloat() * 6)]}.png`;
        }
        renderPostExpander() {
            return (react_1.default.createElement("span", { className: "post-expander", onClick: () => {
                    this.setState({
                        postExpanded: !this.state.postExpanded,
                    });
                } }, this.state.postExpanded ? "Show less" : "Show more"));
        }
        postContentWithURLsFormatted(content) {
            let urlPattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g;
            for (let url of content.match(urlPattern) || []) {
                content = content.replace(url, `<a href="${url}">${url}</a>`);
            }
            return react_1.default.createElement("span", { dangerouslySetInnerHTML: { __html: content } });
        }
        renderPostContent() {
            let post = this.props.post;
            let formatted = this.postContentWithURLsFormatted(post.content);
            if (this.state.shouldHide) {
                if (this.state.postExpanded) {
                    return (react_1.default.createElement("div", { className: "post-content" },
                        formatted,
                        this.renderPostExpander()));
                }
                else {
                    return (react_1.default.createElement("div", null,
                        react_1.default.createElement("div", { className: "post-content", style: { maxHeight: "200px", overflowY: "hidden", overflowX: "hidden" } }, formatted),
                        this.renderPostExpander()));
                }
            }
            else {
                return react_1.default.createElement("div", { className: "post-content" }, formatted);
            }
        }
        renderAttachments() {
            let post = this.props.post;
            return (react_1.default.createElement("div", null, post.attachments.map((url) => (react_1.default.createElement("img", { src: url, key: url, className: "post-attach" })))));
        }
        renderComments() {
            let post = this.props.post;
            if (post.comments.length === 0) {
                return;
            }
            return (react_1.default.createElement("div", null,
                react_1.default.createElement("span", { className: "hr" }),
                react_1.default.createElement("span", { className: "post-info" },
                    post.comments.length,
                    " comments"),
                post.comments.map((comment) => (react_1.default.createElement("div", { className: "comment" },
                    react_1.default.createElement("span", { className: "user-info comment-user-info" },
                        react_1.default.createElement("img", { src: this.getPfpFile(comment.user), className: " comment-user-pfp user-pfp" }),
                        react_1.default.createElement("a", { href: comment.user.profileLink }, comment.user.name)),
                    react_1.default.createElement("div", { className: "comment-content" }, comment.content))))));
        }
        render() {
            let post = this.props.post;
            return (react_1.default.createElement("div", { className: "post" },
                react_1.default.createElement("span", { className: "user-info" },
                    react_1.default.createElement("img", { src: this.getPfpFile(post.user), className: "user-pfp" }),
                    react_1.default.createElement("a", { href: post.user.profileLink }, post.user.name)),
                react_1.default.createElement("span", { className: "hr" }),
                this.renderPostContent(),
                this.renderAttachments(),
                react_1.default.createElement("span", { className: "post-likes post-info" },
                    react_1.default.createElement("span", { className: "material-icons" }, "favorite"),
                    "\u00A0",
                    post.likes,
                    " people liked this",
                    react_1.default.createElement("span", { style: { opacity: "0.5" } },
                        "\u00A0\u2022 posted at ",
                        fmtTimeString(post.timestamp))),
                this.renderComments()));
        }
    }
    exports.Post = Post;
});
define("App", ["require", "exports", "react", "components/Post"], function (require, exports, react_2, Post_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.App = exports.hashObject = exports.hashString = void 0;
    react_2 = __importStar(react_2);
    async function fetchJSON(path) {
        let response = await fetch(path);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return await response.json();
    }
    function hashString(s) {
        var hash = 0, i, chr;
        if (s.length === 0)
            return hash;
        for (i = 0; i < s.length; i++) {
            chr = s.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
    exports.hashString = hashString;
    function hashObject(obj) {
        return hashString(JSON.stringify(obj));
    }
    exports.hashObject = hashObject;
    class AppMain extends react_2.Component {
        constructor(props) {
            super(props);
            this.state = {
                sortMode: "oldestFirst",
            };
        }
        getSortedPosts() {
            if (this.state.sortMode === "oldestFirst") {
                return this.props.posts.slice().reverse();
            }
            else {
                return this.props.posts;
            }
        }
        reverseSortingMode() {
            if (this.state.sortMode === "oldestFirst") {
                this.setState({ sortMode: "newestFirst" });
            }
            else {
                this.setState({ sortMode: "oldestFirst" });
            }
        }
        render() {
            let posts = this.getSortedPosts();
            let data = posts.map((postData) => react_2.default.createElement(Post_1.Post, { post: postData, key: hashObject(postData) }));
            return (react_2.default.createElement("div", null,
                react_2.default.createElement("div", { className: "header" },
                    react_2.default.createElement("span", { style: { fontSize: "24pt" } }, "South Community Updates and Anecdotes Archive"),
                    react_2.default.createElement("br", null),
                    react_2.default.createElement("div", { style: { opacity: "0.5", paddingLeft: "20vw", paddingRight: "20vw" } }, "On the night of March 25th, 2020, Newton South students realized that they were able to post freely to a school-wide group page consisting of a combined 2,000 students and faculty at the school. The following day, the page was taken down, but not before being archived for all of posterity to see.")),
                react_2.default.createElement("div", { className: "controls" },
                    "Sorting by:\u00A0",
                    react_2.default.createElement("span", { className: "control-sort-toggle", onClick: () => {
                            this.reverseSortingMode();
                        } }, this.state.sortMode === "oldestFirst" ? "Oldest first" : "Newest first")),
                react_2.default.createElement("div", { className: "main" }, data)));
        }
    }
    async function App() {
        let posts = (await fetchJSON("3am_posts.json"));
        return react_2.default.createElement(AppMain, { posts: posts });
    }
    exports.App = App;
});
define("index", ["require", "exports", "App"], function (require, exports, App_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    requirejs(["react", "react-dom"], function (React, ReactDOM) {
        App_1.App().then(app => {
            ReactDOM.render(app, document.getElementById("root"));
        });
    });
});
