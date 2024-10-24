import { AuthForm } from "@/components/auth/auth-form";
import { signUp } from "@/app/actions/auth-actions";
import { SignUpSchema } from "@/lib/schemas";

export default function SignUpPage() {
  return <AuthForm type="signup" action={signUp} schema={SignUpSchema} />;
}
