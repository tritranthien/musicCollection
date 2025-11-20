import { authCookie } from "../../service/auth.server.js";
import { redirect } from "react-router";

export async function action({ request }) {
  const cookieHeader = await authCookie.serialize("", { maxAge: 0 });

  return redirect("/dang-nhap", {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  });
}

export async function loader() {
  const cookieHeader = await authCookie.serialize("", { maxAge: 0 });
  return redirect("/dang-nhap", {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  });
}
