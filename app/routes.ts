import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";
export default [
    index("routes/home.tsx"),
    route("bang-dieu-khien", "routes/Dashboard.jsx",[
        route(`chuong-trinh-hoc/bai-giang/:classId`, "routes/dashboard/lessons.jsx"),
        route(`chuong-trinh-hoc/:class/:file_type`, "routes/media.jsx"),
        route(`suu-tap/:file_type`, "routes/collection.jsx"),
        route(`tuy-chinh/:category`, "routes/category.jsx"),
        route(`thong-tin-suu-tam/:category`, "routes/document.jsx"),
        route(`thong-tin-suu-tam/tao-moi`, "routes/document/documentEditor.jsx"),
        route(`tim-kiem`, "routes/search.jsx"),
        route(`chuong-trinh-hoc/bai-giang/create/:classId?`, "routes/dashboard/createLesson.jsx"),
        route(`chuong-trinh-hoc/bai-giang/edit/:lessonId`, "routes/dashboard/editLesson.jsx"),
    ]),
    layout("layouts/authen/Authen.jsx", [
        route("login", "routes/Login.jsx"),
        route("register", "routes/Register.jsx"),
    ]),
    route("logout", "routes/actions/logout.jsx"),
    route("upload/:path", "routes/actions/upload.jsx"),
    route("updateFile", "routes/actions/updateFile.jsx"),
    route("deleteFile", "routes/actions/deleteFile.jsx"),
    route("api/category", "routes/actions/category.jsx"),
    route("api/filterFile", "routes/actions/filterFile.jsx"),
    route("api/lesson", "routes/actions/lesson.jsx"),
] satisfies RouteConfig;
