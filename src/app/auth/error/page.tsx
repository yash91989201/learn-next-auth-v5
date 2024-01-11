import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] ">
      <Card className="min-w-[320px] bg-white">
        <CardHeader className="gap-3 text-center text-gray-700">
          <CardTitle>🔐 Next Auth v5</CardTitle>
          <CardDescription>Oops! Something went wrong.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center text-red-500 [&>svg]:size-6 md:[&>svg]:size-8">
          <ShieldAlert />
        </CardContent>
        <CardFooter>
          <Button variant="link" asChild>
            <Link href="/auth/login" className="w-full text-center">
              Back to SignIn
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
