import { redirect } from "react-router";

export async function loader() {
    return redirect("/bang-dieu-khien");
}

export default function Index() {
    // This component will never render because loader redirects
    return null;
}
