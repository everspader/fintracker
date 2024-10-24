import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/app/actions/auth-actions";
import { SignInSchema } from "@/lib/schemas";

export default function SignInPage() {
  return <AuthForm type="signin" action={login} schema={SignInSchema} />;
}
