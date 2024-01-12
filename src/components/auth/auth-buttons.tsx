"use client";
import { useFormStatus } from "react-dom";
// CUSTOM COMPONENTS
import { Button } from "@/components/ui/button";
// ICONS
import { Loader2 } from "lucide-react";

function LoginWithGoogle() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 "
    >
      {pending && <Loader2 className="animate-spin" />}
      <span>Login with Google</span>
    </Button>
  );
}

function LoginWithGithub() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 "
    >
      {pending && <Loader2 className="animate-spin" />}
      <span>Login with Github</span>
    </Button>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 text-lg"
    >
      {pending && <Loader2 className="animate-spin" />}
      <span>Logout</span>
    </Button>
  );
}

export { LoginWithGithub, LoginWithGoogle, LogoutButton };
