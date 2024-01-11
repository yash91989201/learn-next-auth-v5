"use client";
import { Poppins } from "next/font/google";
// UTILS
import { cn } from "@/lib/utils";
// CUSTOM COMPONENTS
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { SocialLogin } from "@/components/auth/social-login";
import { BackButton } from "@/components/auth/back-button";

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
  return (
    <Card className="max-w-[480px] shadow-md">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={cn("text-3xl font-semibold", poppinsFont.className)}>
            🔐 Next Auth V5
          </h1>
          <p className="text-sm text-muted-foreground">{headerLabel}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <SocialLogin />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
}
