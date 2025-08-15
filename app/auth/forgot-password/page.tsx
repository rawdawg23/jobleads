import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-br from-secondary/15 to-primary/15 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            CTEK JOB LEADS
          </h1>
          <p className="text-foreground/70">Reset your password</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
