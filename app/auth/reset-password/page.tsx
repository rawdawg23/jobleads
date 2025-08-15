import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CTEK JOB LEADS</h1>
          <p className="text-gray-600">Create a new password</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
