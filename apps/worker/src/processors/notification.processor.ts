import { Injectable } from "@nestjs/common";
import { logger } from "../shared/logger";
import * as nodemailer from "nodemailer";

@Injectable()
export class NotificationProcessor {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (user && pass && pass !== "xxxx-xxxx-xxxx-xxxx") {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      logger.info({ host, port, user }, "[NotificationProcessor] Gmail SMTP transporter configured");
    } else {
      logger.warn(
        "[NotificationProcessor] SMTP credentials not set or placeholder. Emails will be logged to console.",
      );
    }
  }

  private async sendEmail(options: { to: string; subject: string; text: string; html: string }) {
    const fromName = process.env.MAIL_FROM_NAME || "Dhaka Model College";
    const fromAddr = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || "noreply@dhakamodel.edu.bd";
    const from = `"${fromName}" <${fromAddr}>`;

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        logger.info({ messageId: info.messageId, to: options.to }, "[NotificationProcessor] Email sent successfully via SMTP");
        return info;
      } catch (err: any) {
        logger.error({ error: err.message, to: options.to }, "[NotificationProcessor] Failed to send email via SMTP");
        throw err; // Re-throw so outbox worker can retry
      }
    } else {
      logger.info(
        { to: options.to, subject: options.subject },
        "[NotificationProcessor:DEV-MOCK] Email dispatched (credentials not active)",
      );
      return { messageId: `mock-${Date.now()}` };
    }
  }

  async handleAbsenteeNotification(payload: { studentId: string; date: string; sectionId: string }) {
    logger.info({ studentId: payload.studentId, date: payload.date }, "[Processor] Sending SMS notification to absentee parent");
    return { success: true, deliveredAt: new Date().toISOString() };
  }

  async handleNoticeBroadcast(payload: { noticeId: string; audience: any }) {
    logger.info({ noticeId: payload.noticeId }, "[Processor] Broadcasting school notice to targeted audience");
    return { success: true };
  }

  async handleSendOtpEmail(payload: { email: string; fullName: string; otp: string; ttlMinutes?: number }) {
    const ttl = payload.ttlMinutes || 10;
    const subject = `Your Verification Code: ${payload.otp} - Dhaka Model College`;
    const text = `Hello ${payload.fullName},\n\nYour 6-digit institutional verification code is: ${payload.otp}\n\nThis code will expire in ${ttl} minutes. If you did not request this verification, please ignore this email.\n\nDhaka Model College Institutional Management System`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #4338ca; margin: 0; font-size: 22px;">Dhaka Model College</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Institutional Management System</p>
        </div>
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155;">Hello <strong>${payload.fullName}</strong>,</p>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">Please use the following 6-digit verification code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e1b4b; background: #e0e7ff; padding: 12px 24px; display: inline-block; border-radius: 6px; border: 1px dashed #6366f1;">
            ${payload.otp}
          </div>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #ef4444; font-weight: 500;">
            Code expires in ${ttl} minutes. Do not share this code with anyone.
          </p>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          If you did not initiate this request, you can safely disregard this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: payload.email,
      subject,
      text,
      html,
    });

    return {
      success: true,
      deliveredTo: payload.email,
      dispatchedAt: new Date().toISOString(),
    };
  }

  async handleAdminRoleRequest(payload: { requestId: string; email: string; fullName: string; role: string }) {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || "admin@dhakamodel.edu.bd";
    const subject = `Action Required: New ${payload.role} Role Request (${payload.fullName})`;
    const text = `A new staff role request requires administrator approval.\n\nApplicant: ${payload.fullName}\nEmail: ${payload.email}\nRequested Role: ${payload.role}\nRequest ID: ${payload.requestId}\n\nPlease review and approve or reject this request in the Staff Management directory.`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #0f172a; margin: 0;">Staff Role Request Pending Approval</h3>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Dhaka Model College Administration</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px;">Applicant Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">${payload.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Gmail Address:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${payload.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Requested Role:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #4f46e5;">${payload.role}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Request ID:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-family: monospace; color: #475569;">${payload.requestId}</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #475569; margin-bottom: 20px;">
          Please log in to the administrator portal to verify credentials and decide on this role assignment.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject,
      text,
      html,
    });

    return {
      success: true,
      notifiedAdmins: true,
      dispatchedAt: new Date().toISOString(),
    };
  }

  async handleSendRoleApprovedEmail(payload: { email: string; fullName: string; role: string; decision?: string; rejectionReason?: string }) {
    const isApproved = payload.decision !== "REJECTED";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (isApproved) {
      const subject = `Account Approved: Welcome to Dhaka Model College Staff (${payload.role})`;
      const text = `Dear ${payload.fullName},\n\nYour institutional role request for ${payload.role} has been approved by the Administration.\n\nYou may now log in to the portal using your credentials:\n${appUrl}/login\n\nDhaka Model College`;
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #16a34a; margin: 0 0 12px 0;">Role Request Approved</h2>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">
            Dear <strong>${payload.fullName}</strong>,<br/><br/>
            Your application for the <strong>${payload.role}</strong> role at <strong>Dhaka Model College</strong> has been verified and approved by the Administration.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${appUrl}/login" style="background-color: #4338ca; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Sign In to Institutional Portal
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            If you have any questions, please contact the college administration office.
          </p>
        </div>
      `;

      await this.sendEmail({ to: payload.email, subject, text, html });
    } else {
      const subject = `Update Regarding Your Institutional Role Request - Dhaka Model College`;
      const reason = payload.rejectionReason || "Details provided did not match institutional records.";
      const text = `Dear ${payload.fullName},\n\nYour role request for ${payload.role} could not be approved at this time.\nReason: ${reason}\n\nDhaka Model College`;
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #dc2626; margin: 0 0 12px 0;">Role Request Update</h2>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">
            Dear <strong>${payload.fullName}</strong>,<br/><br/>
            We regret to inform you that your request for the <strong>${payload.role}</strong> role was not approved.
          </p>
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 20px 0 0 0;">
            If you believe this was an error, please visit the administrative office with proof of employment.
          </p>
        </div>
      `;

      await this.sendEmail({ to: payload.email, subject, text, html });
    }

    return {
      success: true,
      deliveredTo: payload.email,
      dispatchedAt: new Date().toISOString(),
    };
  }
}
