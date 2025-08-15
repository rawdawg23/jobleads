import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-16 w-64 h-64 bg-gradient-to-br from-primary/25 to-secondary/25 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute bottom-16 left-16 w-72 h-72 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            CTEK JOB LEADS
          </h1>
          <p className="text-foreground/70">Create a new password</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
