"use server";

import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

// The server action gets a first argument prevState when used with useFormState(useActionState) hook
export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // validate data
  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  // store it in the database
  //1. hash password
  const hashedPassword = hashUserPassword(password);

  //2. check for email duplication and store user
  try {
    const id = createUser(email, hashedPassword);
    // setting the session for the new user
    await createAuthSession(id);

    redirect("/training");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email: "It seems that the email has been used",
        },
      };
    }

    throw error;
  }
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  console.log(email);

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: "Please enter a valid email address.",
      },
    };
  }

  // calling the verfiy password function from hash.js to check if it matches the hashed password
  const isValidPassword = verifyPassword(existingUser.password, password);

  if (!isValidPassword) {
    return {
      errors: {
        email: "Please enter a valid password",
      },
    };
  }

  // setting the session for the existing user
  await createAuthSession(existingUser.id);

  redirect("/training");
}

export async function decideauth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  }

  return signup(prevState, formData);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
