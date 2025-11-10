import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";
export default [
    index("routes/home.tsx"),
    route("/bang-dieu-khien", "routes/Dashboard.jsx",[
        route(`chuong-trinh-hoc/bai-giang/:class`, "routes/dashboard/lessons.jsx"),
        route(`chuong-trinh-hoc/:class/:file_type`, "routes/media.jsx"),
        route(`suu-tap/:file_type`, "routes/collection.jsx"),
    ]),
    layout("layouts/authen/Authen.jsx", [
        route("login", "routes/Login.jsx"),
        route("register", "routes/Register.jsx"),
    ]),
    route("logout", "routes/actions/logout.jsx"),
    route("upload/:path", "routes/actions/upload.jsx"),
    route("updateFile", "routes/actions/updateFile.jsx"),
    
] satisfies RouteConfig;
