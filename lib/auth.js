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

export async function verifyAuth() {
  //retrieving cookie from upcoming request
  const sessionCookie = cookies().get(lucia.sessionCookieName);

  if (!sessionCookie) {
    return {
      user: null,
      session: null,
    };
  }

  // checking for session id
  const sessionId = sessionCookie.value;

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  // validating session
  const result = await lucia.validateSession(sessionId);

  // wrapping in try block to avoid errors when rendering a page
  try {
    // refreshing a valid session by recreating the cookie for the same session
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}

  // creating a new fresh cookie if the session is invalid
  if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  return result;
}
