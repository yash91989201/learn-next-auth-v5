"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// ACTIONS
import { signUpWithCredentials } from "@/server/actions/user";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// SCHEMAS
import { SignUpSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { SignUpSchemaType } from "@/lib/schema";
// CUSTOM COMPONENTS
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthCardWrapper from "@/components/auth/auth-card-wrapper";
// ICONS
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  UserRound,
  XCircle,
} from "lucide-react";

export default function SignUpForm() {
  const showPasswordToggle = useToggle(false);
  const [actionResponse, setActionResponse] = useState<SignUpFormStatusType>();

  const signUpForm = useForm<SignUpSchemaType>({
    shouldUseNativeValidation: true,
    resolver: zodResolver(SignUpSchema),
  });
  const { control, handleSubmit, formState } = signUpForm;

  const signInAction: SubmitHandler<SignUpSchemaType> = async (data) => {
    const actionResponse = await signUpWithCredentials(data);
    setActionResponse(actionResponse);
  };

  return (
    <AuthCardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
      showSocial
    >
      <Form {...signUpForm}>
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit(signInAction)}
        >
          <FormField
            name="name"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input {...field} placeholder="Enter your name" />
                    <UserRound />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input {...field} placeholder="Enter your email" />
                    <Mail />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3 [&>svg]:size-5 md:[&>svg]:size-6">
                    <Input
                      {...field}
                      type={showPasswordToggle.isOn ? "text" : "password"}
                      placeholder="********"
                    />
                    {showPasswordToggle.isOn ? (
                      <Eye
                        className="cursor-pointer select-none"
                        onClick={showPasswordToggle.off}
                      />
                    ) : (
                      <EyeOff
                        className="cursor-pointer select-none"
                        onClick={showPasswordToggle.on}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {actionResponse?.status === "SUCCESS" && (
            <div className="flex items-center justify-start gap-2 rounded-md bg-green-100 p-3 text-sm text-green-600 [&>svg]:size-4">
              <CheckCircle2 />
              <p>{actionResponse.message}</p>
            </div>
          )}

          {actionResponse?.status === "FAILED" && (
            <div className="flex items-center justify-start gap-3 rounded-md bg-red-100 p-3 text-sm text-red-600 [&>svg]:size-4">
              <XCircle />
              <p>{actionResponse.message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex items-center justify-center gap-3 disabled:cursor-not-allowed"
          >
            <h6 className="md:text-lg">Sign Up</h6>
            {formState.isSubmitting && <Loader2 className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
}
