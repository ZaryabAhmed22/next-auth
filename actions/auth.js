"use server";

import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/user";
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
    createUser(email, hashedPassword);
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

  redirect("/training");
}
