type FormInitialType<ErrorsType> = {
  status: "UNINITIALIZED";
  errors: ErrorsType;
  message: string;
};

type FormSuccessType = {
  status: "SUCCESS";
  message: string;
};

type FormFailType<ErrorsType> = {
  status: "FAILED";
  errors?: ErrorsType;
  message: string;
};

type SignInFormErrorsType = {
  email?: string;
  password?: string;
};

type SignUpFormErrorsType = {
  name?: string;
  email?: string;
  password?: string;
};

type NewVerificationErrorsType = {
  token?: string;
};

type ResetErrorsType = {
  email?: string;
};

type NewPasswordErrorsType = {
  email?: string;
};

type SignInFormSuccessType = {
  status: "SUCCESS";
  message: string;
  authType: "PASSWORD" | "PASSWORD_WITH_2FA";
};

type LoginFormStatusType =
  | FormInitialType<SignInFormErrorsType>
  | SignInFormSuccessType
  | FormFailType<SignInFormErrorsType>;

type SignUpFormStatusType =
  | FormInitialType<SignUpFormErrorsType>
  | FormSuccessType
  | FormFailType<SignUpFormErrorsType>;

type NewVerificationStatusType =
  | FormInitialType<NewVerificationErrorsType>
  | FormSuccessType
  | FormFailType<NewVerificationErrorsType>;

type ResetPasswordStatusType =
  | FormInitialType<ResetErrorsType>
  | FormSuccessType
  | FormFailType<ResetErrorsType>;

type NewPasswordStatusType =
  | FormInitialType<NewPasswordErrorsType>
  | FormSuccessType
  | FormFailType<NewPasswordErrorsType>;

type UserRole = "ADMIN" | "USER";

type AuthCardWrapperProps = {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
};
