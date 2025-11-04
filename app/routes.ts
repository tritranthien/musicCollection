import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    layout("layouts/authen/Authen.jsx", [
        route("login", "routes/Login.jsx"),
        route("register", "routes/Register.jsx"),
    ])
] satisfies RouteConfig;
