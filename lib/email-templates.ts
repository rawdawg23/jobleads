export const jobPostedTemplate = (customerName: string, jobId: string, vehicleReg: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Job Posted Successfully</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 8px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">Job Posted Successfully!</h1>
  </div>
  
  <div style="padding: 30px; background: #f8fafc; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1e40af; margin-top: 0;">Hi ${customerName},</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      Your ECU remapping job has been successfully posted and is now visible to qualified dealers in your area.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="color: #1e40af; margin-top: 0;">Job Details:</h3>
      <p><strong>Job ID:</strong> ${jobId}</p>
      <p><strong>Vehicle:</strong> ${vehicleReg}</p>
      <p><strong>Status:</strong> Active - Awaiting dealer applications</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      You'll receive email notifications when dealers apply for your job. You can also track applications in your dashboard.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/my-jobs" 
         style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View My Jobs
      </a>
    </div>
  </div>
  
  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>ECU Remap Pro - Professional ECU Remapping Services</p>
  </div>
</body>
</html>
`

export const dealerApplicationTemplate = (customerName: string, dealerName: string, jobId: string, quote: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Dealer Application</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 8px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">New Dealer Application!</h1>
  </div>
  
  <div style="padding: 30px; background: #f0fdf4; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #059669; margin-top: 0;">Hi ${customerName},</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      Great news! A qualified dealer has applied for your ECU remapping job.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="color: #059669; margin-top: 0;">Application Details:</h3>
      <p><strong>Dealer:</strong> ${dealerName}</p>
      <p><strong>Quote:</strong> £${quote}</p>
      <p><strong>Job ID:</strong> ${jobId}</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      Review the dealer's profile, quote, and estimated completion time in your dashboard. You can also message them directly to discuss your requirements.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/my-jobs" 
         style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Review Application
      </a>
    </div>
  </div>
  
  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>ECU Remap Pro - Professional ECU Remapping Services</p>
  </div>
</body>
</html>
`

export const paymentConfirmationTemplate = (userName: string, amount: number, type: "job" | "subscription") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 8px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">Payment Confirmed!</h1>
  </div>
  
  <div style="padding: 30px; background: #faf5ff; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #7c3aed; margin-top: 0;">Hi ${userName},</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      Your payment of £${amount} has been successfully processed.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="color: #7c3aed; margin-top: 0;">Payment Details:</h3>
      <p><strong>Amount:</strong> £${amount}</p>
      <p><strong>Type:</strong> ${type === "job" ? "Job Payment" : "Subscription Payment"}</p>
      <p><strong>Status:</strong> Confirmed</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      Thank you for using our services. If you have any questions, please don't hesitate to contact our support team.
    </p>
  </div>
  
  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>ECU Remap Pro - Professional ECU Remapping Services</p>
  </div>
</body>
</html>
`

export const sendPasswordResetEmail = async (email: string, resetToken: string, firstName: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; border-radius: 8px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">Reset Your Password</h1>
  </div>
  
  <div style="padding: 30px; background: #fef2f2; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #dc2626; margin-top: 0;">Hi ${firstName},</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        <strong>Important:</strong> This link will expire in 1 hour for security reasons.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Reset Password
      </a>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; color: #6b7280;">
      If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    
    <p style="font-size: 14px; line-height: 1.6; color: #6b7280;">
      If the button above doesn't work, copy and paste this link into your browser:
    </p>
    
    <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">
      ${resetUrl}
    </p>
  </div>
  
  <div style="text-align: center; color: #6b7280; font-size: 14px;">
    <p>ECU Remap Pro - Professional ECU Remapping Services</p>
  </div>
</body>
</html>
  `

  // For now, just log the email content
  // In production, you would send this via your email service
  console.log("Password reset email would be sent to:", email)
  console.log("Reset URL:", resetUrl)
  
  // TODO: Integrate with your email service (Resend, SendGrid, etc.)
  // await resend.emails.send({
  //   from: 'noreply@yourdomain.com',
  //   to: email,
  //   subject: 'Reset Your Password - ECU Remap Pro',
  //   html: htmlContent,
  // })
  
  return true
}
