import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dashboard", "routes/Dashboard.jsx",[
        route("class/:class/lectures", "routes/dashboard/lessons.jsx"),
        route("class/:class/videos", "routes/media.jsx"),
    ]),
    layout("layouts/authen/Authen.jsx", [
        route("login", "routes/Login.jsx"),
        route("register", "routes/Register.jsx"),
    ]),
    route("logout", "routes/actions/logout.jsx"),
    route("upload/:path", "routes/actions/upload.jsx")
    
] satisfies RouteConfig;
