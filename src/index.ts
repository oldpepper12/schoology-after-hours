import { App } from "./App";

declare const requirejs: any;

requirejs(["react", "react-dom"], function (React: any, ReactDOM: any) {
    App().then(app=>{
        ReactDOM.render(app, document.getElementById("root"));
    })
    
});