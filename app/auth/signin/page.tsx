import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/app/actions/auth-actions";

export default function SignInPage() {
  return <AuthForm type="signin" action={login} />;
}
