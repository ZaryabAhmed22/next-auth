import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { Lucia } from "lucia";
import db from "./db";
import { cookies } from "next/headers";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users", // where the user is stored
  session: "sessions", // where the session is stored
});

// creating a lucia instance to create sessions, session cookies and validate incoming requests
const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

// creating a new session using the user ID
export async function createAuthSession(userId) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  //Next Js 14. adding the cookie to the outgoing request. The browser will automatically store the cookie
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  // Next Js 15
  //   (await cookies().set())
}
