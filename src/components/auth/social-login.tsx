"use client";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
// ACTIONS
import { loginWithGithub, loginWithGoogle } from "@/server/actions/user";
// CUSTOM COMPONENTS
import { Button } from "@/components/ui/button";
// ICONS
import { Loader2 } from "lucide-react";

export const SocialLogin = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div className="flex w-full items-center gap-x-3">
      <form action={() => loginWithGoogle(callbackUrl)}>
        <LoginWithGoogleButton />
      </form>
      <form action={() => loginWithGithub(callbackUrl)}>
        <LoginWithGithubButton />
      </form>
    </div>
  );
};

const LoginWithGoogleButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" className="w-full" variant="outline">
      {pending && <Loader2 />}
      <span>Login With Google</span>
    </Button>
  );
};

const LoginWithGithubButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" className="w-full" variant="outline">
      {pending && <Loader2 />}
      <span>Login With Github</span>
    </Button>
  );
};
