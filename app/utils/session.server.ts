import { getSession } from "../sessions.server";

export interface UserSession {
  id: string;
  name: string;
  email: string;
}

export async function getUserFromSession(request: Request): Promise<UserSession | null> {
  const session: any = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  return user || null;
}
