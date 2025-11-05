import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dashboard", "routes/Dashboard.jsx",[
        route("class/:id/lesson", "routes/dashboard/lessons.jsx"),
    ]),
    layout("layouts/authen/Authen.jsx", [
        route("login", "routes/Login.jsx"),
        route("register", "routes/Register.jsx"),
    ]),
    route("logout", "routes/actions/logout.jsx"),
] satisfies RouteConfig;
