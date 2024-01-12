"use client";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { useSearchParams } from "next/navigation";
// ACTIONS
import { loginWithGithub, loginWithGoogle } from "@/server/actions/user";
// UTILS
import { cn } from "@/lib/utils";
// CUSTOM COMPONENTS
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LoginWithGoogle,
  LoginWithGithub,
} from "@/components/auth/auth-buttons";

const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function AuthCardWrapper({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: AuthCardWrapperProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <Card className="min-w-[400px] shadow-md">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={cn("text-3xl font-semibold", poppinsFont.className)}>
            🔐 Next Auth V5
          </h1>
          <p className="text-sm text-muted-foreground">{headerLabel}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex flex-col gap-3">
        {showSocial && (
          <div className="flex w-full items-center gap-3">
            <form
              className="w-full"
              action={() => loginWithGoogle(callbackUrl)}
            >
              <LoginWithGoogle />
            </form>
            <form
              className="w-full"
              action={() => loginWithGithub(callbackUrl)}
            >
              <LoginWithGithub />
            </form>
          </div>
        )}
        <Button variant="link" className="w-full font-normal" size="sm" asChild>
          <Link href={backButtonHref}>{backButtonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
