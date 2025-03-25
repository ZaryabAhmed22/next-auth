"use client";
import { decideauth, signup } from "@/actions/auth";
import Link from "next/link";
import { useFormState } from "react-dom";

export default function AuthForm({ mode }) {
  //decide auth function decides whether to return the login action or the signup action. Binding the function means preconfiguring the function when it is called. First argument is for the 'this' keyword
  const [formState, formAction] = useFormState(decideauth.bind(null, mode), {});

  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
        <button type="submit">
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </p>
      <p>
        {mode === "login" && (
          <Link href="/?mode=signup">Create an account</Link>
        )}
        {mode === "signup" && (
          <Link href="/?mode=login">Login with existing account.</Link>
        )}
      </p>
    </form>
  );
}
