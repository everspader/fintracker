import { AuthForm } from "@/components/auth/auth-form";
import { signUp } from "@/app/actions/auth-actions";

export default function SignUpPage() {
  return <AuthForm type="signup" action={signUp} />;
}
