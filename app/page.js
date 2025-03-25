import AuthForm from "@/components/auth-form";

// searchParams is a default prop on page components
export default async function Home({ searchParams }) {
  const formMode = searchParams.mode || "login";
  return <AuthForm mode={formMode} />;
}
