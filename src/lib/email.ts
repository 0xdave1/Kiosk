/**
 * Resend Transactional Email Notification System (Plain-Text Clean Style)
 *
 * Clean, cardless, background-free typography email templates for Kiosk:
 * 1. Welcome Greeting Email (`sendWelcomeEmail`)
 * 2. Admin Submission Alert (`sendWebsiteReviewNotificationToAdmin`)
 * 3. Client Submission Confirmation (`sendWebsiteReviewConfirmationToClient`)
 * 4. Website Live Published Email (`sendWebsiteLiveEmail`)
 * 5. Project Status Update Notice (`sendProjectStatusEmail`)
 * 6. Payment & Renewal Requests (`sendPaymentRequestEmail`, `sendGracePeriodReminderEmail`, `sendSiteFlaggedNoticeEmail`)
 * 7. Password Reset Request Email (`sendPasswordResetEmail`)
 *
 * @module email
 * @format
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "Kiosk <noreply@kioosk.online>";

/**
 * Resolves the active base application URL across local dev, preview branches, and production.
 */
export function getAppUrl(): string {
	if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
	if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
	return "https://kioosk.online";
}

export interface SendEmailPayload {
	to: string;
	subject: string;
	html: string;
}

/**
 * Dispatches an email via Resend API or logs fallback payload in local development mode.
 */
export async function sendEmail({
	to,
	subject,
	html,
}: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
	const apiKey = process.env.RESEND_API_KEY || RESEND_API_KEY;
	const fromAddress = process.env.EMAIL_FROM || EMAIL_FROM || "Kiosk <noreply@kioosk.online>";

	if (!apiKey) {
		console.log(`[EMAIL_DEV_FALLBACK] To: ${to} | Subject: ${subject}`);
		return { success: true, id: `dev_mock_${crypto.randomUUID().slice(0, 8)}` };
	}

	try {
		let res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				from: fromAddress,
				to: [to],
				subject,
				html,
			}),
		});

		let data = await res.json();

		// If rejected due to domain not being verified in Resend, automatically fallback to onboarding@resend.dev
		if (
			!res.ok &&
			(data.name === "validation_error" ||
				data.message?.toLowerCase().includes("domain") ||
				data.message?.toLowerCase().includes("verify") ||
				data.message?.toLowerCase().includes("not verified"))
		) {
			console.warn("[RESEND_FALLBACK_TO_ONBOARDING]", data.message);
			res = await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					from: "Kiosk <onboarding@resend.dev>",
					to: [to],
					subject,
					html,
				}),
			});
			data = await res.json();
		}

		if (!res.ok) {
			console.error("[RESEND_API_ERROR]", data);
			return { success: false, error: data.message || "Failed to dispatch email via Resend" };
		}

		return { success: true, id: data.id };
	} catch (err: any) {
		console.error("[EMAIL_DISPATCH_EXCEPTION]", err);
		return { success: false, error: err?.message || "Unexpected network error during email dispatch" };
	}
}

/**
 * Minimalist, Cardless Email Shell (Plain white canvas, standard readable typography)
 */
function renderEmailShell({
	title,
	contentHtml,
}: {
	title: string;
	contentHtml: string;
}) {
	const appUrl = getAppUrl();
	const logoBaseUrl = appUrl.includes("localhost") ? "https://kioosk.online" : appUrl;
	const logoUrl = `${logoBaseUrl}/KIOSK%20PNG2.png`;

	return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${title}</title>
			</head>
			<body style="margin: 0; padding: 24px 16px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased;">
				<div style="max-width: 580px; margin: 0 auto;">
					<!-- Brand Logo Header -->
					<div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f3f4f6;">
						<a href="${appUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;">
							<img src="${logoUrl}" alt="Kiosk" width="130" style="display: block; width: 130px; max-width: 130px; height: auto; border: 0; outline: none; text-decoration: none;" />
						</a>
					</div>

					${contentHtml}

					<div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; line-height: 1.5;">
						<p style="margin: 0 0 4px 0;">Best regards,</p>
						<p style="margin: 0 0 8px 0; font-weight: 700; color: #111827;">The Kiosk Team</p>
						<p style="margin: 0;">
							<a href="https://kioosk.online" style="color: #004ac6; text-decoration: none;">kioosk.online</a>
						</p>
					</div>
				</div>
			</body>
		</html>
	`;
}

/**
 * 1. Welcome Greeting Email
 */
export async function sendWelcomeEmail(toEmail: string, userName: string) {
	const appUrl = getAppUrl();
	const subject = "Welcome to Kiosk - Your Workspace is Ready";
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			Welcome to Kiosk. Your workspace is fully set up and ready to use.
		</p>
		<p style="margin: 0 0 16px 0;">
			You can log in to your dashboard to submit your business details, view live website builds, and manage your online store:
		</p>
		<p style="margin: 0 0 24px 0;">
			👉 <a href="${appUrl}/dashboard" style="color: #004ac6; font-weight: 700; text-decoration: underline;">Open Your Kiosk Dashboard</a> (${appUrl}/dashboard)
		</p>
		<p style="margin: 0 0 16px 0;">
			If you need any help getting started, simply reply directly to this email and our team will assist you.
		</p>
	`;

	const html = renderEmailShell({
		title: "Welcome to Kiosk",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

export interface WebsiteReviewEmailPayload {
	clientName: string;
	clientEmail: string;
	businessName: string;
	tagline: string;
	plan: string;
	logoUrl?: string | null;
	imagesCount?: number;
	productsCount?: number;
	servicesCount?: number;
	projectId?: string;
	contactPhone?: string;
	contactEmail?: string;
	whatsappLink?: string;
	selectedFont?: string;
	themeMode?: string;
}

/**
 * 2. Admin Submission Alert
 */
export async function sendWebsiteReviewNotificationToAdmin(payload: WebsiteReviewEmailPayload) {
	const adminEmail = process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL;
	if (!adminEmail) {
		console.warn("[EMAIL_ADMIN_NOTICE] ADMIN_EMAIL or NOTIFICATION_EMAIL is not configured.");
		if (process.env.NODE_ENV !== "production") {
			return { success: true, id: `dev_mock_${crypto.randomUUID().slice(0, 8)}` };
		}
		return { success: false, error: "Admin email not configured" };
	}
	const appUrl = getAppUrl();
	const reviewUrl = payload.projectId
		? `${appUrl}/admin/projects/${payload.projectId}`
		: `${appUrl}/admin/projects`;
	const subject = `[New Submission] ${payload.businessName} (${payload.plan.replace(/_/g, " ")})`;

	const contentHtml = `
		<p style="margin: 0 0 16px 0;"><strong>New Client Submission Received:</strong></p>
		<p style="margin: 0 0 16px 0;">
			A client has submitted their website intake details for review and publishing:
		</p>

		<p style="margin: 0 0 8px 0;"><strong>Business Details:</strong></p>
		<ul style="margin: 0 0 20px 0; padding-left: 20px;">
			<li><strong>Business:</strong> ${payload.businessName}</li>
			<li><strong>Tagline:</strong> ${payload.tagline || "N/A"}</li>
			<li><strong>Plan:</strong> ${payload.plan.replace(/_/g, " ")}</li>
			<li><strong>Theme:</strong> ${payload.themeMode || "Light"}</li>
			<li><strong>Assets:</strong> ${payload.imagesCount || 0} files uploaded</li>
		</ul>

		<p style="margin: 0 0 8px 0;"><strong>Client Contact:</strong></p>
		<ul style="margin: 0 0 24px 0; padding-left: 20px;">
			<li><strong>Name:</strong> ${payload.clientName}</li>
			<li><strong>Email:</strong> ${payload.clientEmail}</li>
			${payload.contactPhone ? `<li><strong>Phone:</strong> ${payload.contactPhone}</li>` : ""}
			${payload.whatsappLink ? `<li><strong>WhatsApp:</strong> ${payload.whatsappLink}</li>` : ""}
		</ul>

		<p style="margin: 0 0 16px 0;">
			👉 Review this project in the Admin Hub:<br/>
			<a href="${reviewUrl}" style="color: #004ac6; font-weight: 700; text-decoration: underline;">${reviewUrl}</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "New Client Submission",
		contentHtml,
	});

	return sendEmail({ to: adminEmail, subject, html });
}

/**
 * 3. Client Submission Confirmation Email
 */
export async function sendWebsiteReviewConfirmationToClient(
	toEmail: string,
	clientName: string,
	businessName: string,
	plan: string,
) {
	const appUrl = getAppUrl();
	const subject = `Details Received: ${businessName} is Now in Review`;

	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${clientName || "there"},</p>
		<p style="margin: 0 0 16px 0;">
			We have received your business details and brand assets for <strong>${businessName}</strong>.
		</p>
		<p style="margin: 0 0 16px 0;">
			Our fulfillment team is now setting up your <strong>${plan.replace(/_/g, " ")}</strong> website layout, connecting your subdomain, and testing your WhatsApp order flows.
		</p>

		<p style="margin: 0 0 8px 0;"><strong>What to expect next:</strong></p>
		<ul style="margin: 0 0 24px 0; padding-left: 20px;">
			<li>Our team reviews your submitted content.</li>
			<li>We build and optimize your website for mobile and desktop.</li>
			<li>You will receive an email confirmation as soon as your website is live!</li>
		</ul>

		<p style="margin: 0 0 16px 0;">
			You can track progress anytime from your dashboard:<br/>
			👉 <a href="${appUrl}/dashboard/projects" style="color: #004ac6; font-weight: 700; text-decoration: underline;">${appUrl}/dashboard/projects</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "Website Details Received",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

export interface WebsiteLiveEmailPayload {
	toEmail: string;
	clientName: string;
	businessName: string;
	publishedUrl: string;
	plan: string;
}

/**
 * 4. Website Live Published Email
 */
export async function sendWebsiteLiveEmail(payload: WebsiteLiveEmailPayload) {
	const appUrl = getAppUrl();
	const subject = `Your Website is Live: ${payload.businessName}`;

	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${payload.clientName || "there"},</p>
		<p style="margin: 0 0 16px 0;">
			Great news! Your <strong>${payload.businessName}</strong> website has completed review and is officially live on the internet.
		</p>

		<p style="margin: 0 0 8px 0;"><strong>Your Live Website Link:</strong></p>
		<p style="margin: 0 0 24px 0;">
			👉 <a href="${payload.publishedUrl}" target="_blank" style="color: #004ac6; font-weight: 800; font-size: 16px; text-decoration: underline;">${payload.publishedUrl}</a>
		</p>

		<p style="margin: 0 0 8px 0;"><strong>Next steps for your brand:</strong></p>
		<ul style="margin: 0 0 24px 0; padding-left: 20px;">
			<li>Add your website link to your Instagram, TikTok, and WhatsApp bio.</li>
			<li>Customers can now browse your products/services and order directly to your WhatsApp.</li>
			<li>You can manage your products and updates anytime from your Kiosk dashboard.</li>
		</ul>

		<p style="margin: 0 0 16px 0;">
			Access your dashboard:<br/>
			👉 <a href="${appUrl}/dashboard" style="color: #004ac6; font-weight: 700; text-decoration: underline;">${appUrl}/dashboard</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "Your Website is Live",
		contentHtml,
	});

	return sendEmail({ to: payload.toEmail, subject, html });
}

/**
 * 5. Project Status Email
 */
export async function sendProjectStatusEmail(
	toEmail: string,
	userName: string,
	projectName: string,
	status: string,
	publishedUrl?: string,
) {
	const appUrl = getAppUrl();
	const subject = `Update on ${projectName}: Status is ${status}`;
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			Your project <strong>${projectName}</strong> has been updated to: <strong>${status}</strong>.
		</p>
		${
			publishedUrl
				? `<p style="margin: 0 0 16px 0;">Published URL: <a href="${publishedUrl}" style="color: #004ac6; font-weight: 700; text-decoration: underline;">${publishedUrl}</a></p>`
				: ""
		}
		<p style="margin: 0 0 16px 0;">
			👉 View details in your dashboard:<br/>
			<a href="${appUrl}/dashboard/projects" style="color: #004ac6; font-weight: 700; text-decoration: underline;">${appUrl}/dashboard/projects</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "Project Status Update",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

/**
 * 6. Payment Request / Invoice Email
 */
export async function sendPaymentRequestEmail({
	toEmail,
	userName,
	invoiceNumber,
	plan,
	amount,
	currency,
	dueDate,
	paymentLink,
}: {
	toEmail: string;
	userName: string;
	invoiceNumber: string;
	plan: string;
	amount: number;
	currency: string;
	dueDate: string;
	paymentLink: string;
}) {
	const subject = `Invoice ${invoiceNumber}: Kiosk ${plan} Renewal`;
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			Your hosting and maintenance subscription for <strong>${plan}</strong> is ready for renewal.
		</p>

		<p style="margin: 0 0 8px 0;"><strong>Invoice Summary:</strong></p>
		<ul style="margin: 0 0 24px 0; padding-left: 20px;">
			<li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
			<li><strong>Plan:</strong> ${plan}</li>
			<li><strong>Due Date:</strong> ${dueDate}</li>
			<li><strong>Total Amount:</strong> ${currency} ${amount}.00</li>
		</ul>

		<p style="margin: 0 0 16px 0;">
			👉 Pay your invoice securely online:<br/>
			<a href="${paymentLink}" style="color: #004ac6; font-weight: 700; font-size: 16px; text-decoration: underline;">Pay ${currency} ${amount}.00</a> (${paymentLink})
		</p>
		<p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
			Supports Card, Bank Transfer, USSD, and Mobile Money.
		</p>
	`;

	const html = renderEmailShell({
		title: `Invoice ${invoiceNumber}`,
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

/**
 * 7. Grace Period Reminder Email
 */
export async function sendGracePeriodReminderEmail({
	toEmail,
	userName,
	invoiceNumber,
	plan,
	amount,
	currency,
	daysRemaining,
	paymentLink,
}: {
	toEmail: string;
	userName: string;
	invoiceNumber: string;
	plan: string;
	amount: number;
	currency: string;
	daysRemaining: number;
	paymentLink: string;
}) {
	const subject = `Reminder: ${daysRemaining} Days Remaining for Invoice #${invoiceNumber}`;
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			This is a friendly reminder that renewal invoice <strong>#${invoiceNumber}</strong> (${currency} ${amount}.00) for your <strong>${plan}</strong> website remains pending.
		</p>
		<p style="margin: 0 0 20px 0;">
			Your website remains active under our grace period. Please complete payment within the next <strong>${daysRemaining} days</strong> to keep your site online without interruption.
		</p>
		<p style="margin: 0 0 16px 0;">
			👉 Pay Invoice:<br/>
			<a href="${paymentLink}" style="color: #004ac6; font-weight: 700; text-decoration: underline;">${paymentLink}</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "Grace Period Notice",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

/**
 * 8. Site Flagged / Suspended Notice Email
 */
export async function sendSiteFlaggedNoticeEmail({
	toEmail,
	userName,
	invoiceNumber,
	plan,
	amount,
	currency,
	paymentLink,
}: {
	toEmail: string;
	userName: string;
	invoiceNumber: string;
	plan: string;
	amount: number;
	currency: string;
	paymentLink: string;
}) {
	const subject = `Action Required: Website Renewal Expired for ${plan} #${invoiceNumber}`;
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			The renewal period for invoice <strong>#${invoiceNumber}</strong> (${currency} ${amount}.00) has expired.
		</p>
		<p style="margin: 0 0 20px 0;">
			Your website files, data, and configurations are secure. To reactivate your website immediately, please complete the renewal payment.
		</p>
		<p style="margin: 0 0 16px 0;">
			👉 Reactivate Your Website:<br/>
			<a href="${paymentLink}" style="color: #004ac6; font-weight: 700; text-decoration: underline;">${paymentLink}</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "Website Renewal Expired",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

/**
 * 9. Password Reset Request Email
 */
export async function sendPasswordResetEmail({
	toEmail,
	userName,
	resetUrl,
}: {
	toEmail: string;
	userName: string;
	resetUrl: string;
}) {
	const subject = "Reset Your Kiosk Password";
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName || "there"},</p>
		<p style="margin: 0 0 16px 0;">
			We received a request to reset the password for your Kiosk account.
		</p>
		<p style="margin: 0 0 16px 0;">
			Click the link below to set a new password. This secure link will expire in <strong>1 hour</strong>:
		</p>
		<p style="margin: 0 0 24px 0;">
			👉 <a href="${resetUrl}" style="color: #004ac6; font-weight: 700; text-decoration: underline;">Reset Your Password</a> (${resetUrl})
		</p>
		<p style="margin: 0; font-size: 13px; color: #6b7280;">
			If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
		</p>
	`;

	const html = renderEmailShell({
		title: "Reset Your Password",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

/**
 * 10. Support Ticket Notification & Customer Confirmation Emails
 */
export interface SupportTicketPayload {
	ticketId: string;
	name: string;
	email: string;
	phone?: string;
	category: string;
	priority: string;
	subject: string;
	message: string;
	websiteUrl?: string;
}

export async function sendSupportTicketEmail(payload: SupportTicketPayload) {
	const adminEmail = process.env.ADMIN_EMAIL || "support@kioosk.online";

	// 1. Send alert notification to Support Admin
	const adminSubject = `[Support Ticket #${payload.ticketId}] ${payload.priority.toUpperCase()}: ${payload.subject}`;
	const adminContentHtml = `
		<p style="margin: 0 0 16px 0;"><strong>New Support Ticket #${payload.ticketId}</strong></p>
		<div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
			<p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${payload.name}</p>
			<p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${payload.email}" style="color: #004ac6;">${payload.email}</a></p>
			${payload.phone ? `<p style="margin: 0 0 8px 0;"><strong>Phone/WhatsApp:</strong> ${payload.phone}</p>` : ""}
			<p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${payload.category}</p>
			<p style="margin: 0 0 8px 0;"><strong>Priority:</strong> ${payload.priority.toUpperCase()}</p>
			${payload.websiteUrl ? `<p style="margin: 0 0 8px 0;"><strong>Website/URL:</strong> <a href="${payload.websiteUrl}" style="color: #004ac6;">${payload.websiteUrl}</a></p>` : ""}
		</div>

		<p style="margin: 0 0 8px 0; font-weight: 700;">Message Content:</p>
		<div style="background-color: #ffffff; border-left: 3px solid #004ac6; padding: 12px 16px; margin-bottom: 24px; font-family: monospace; font-size: 14px; white-space: pre-wrap; color: #1f2937;">
			${payload.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
		</div>

		<p style="margin: 0; font-size: 13px; color: #6b7280;">
			Reply directly to <a href="mailto:${payload.email}" style="color: #004ac6;">${payload.email}</a> to assist this customer.
		</p>
	`;

	const adminHtml = renderEmailShell({
		title: adminSubject,
		contentHtml: adminContentHtml,
	});

	await sendEmail({
		to: adminEmail,
		subject: adminSubject,
		html: adminHtml,
	});

	// 2. Send automated confirmation receipt to customer
	const clientSubject = `We received your inquiry: #${payload.ticketId} - Kiosk Support`;
	const clientContentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${payload.name},</p>
		<p style="margin: 0 0 16px 0;">
			Thank you for reaching out to Kiosk Support. We have received your inquiry regarding <strong>"${payload.subject}"</strong>.
		</p>
		<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
			<p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">Ticket Reference ID:</p>
			<p style="margin: 0; font-size: 16px; font-weight: 700; color: #004ac6;">#${payload.ticketId}</p>
		</div>
		<p style="margin: 0 0 16px 0;">
			Our team has been notified and will review your request. Our typical response time is within <strong>2 to 4 hours</strong> during regular business operations.
		</p>
		<p style="margin: 0 0 16px 0;">
			If you need urgent real-time updates, you can also reach us directly on WhatsApp or reply to this email with any additional details.
		</p>
	`;

	const clientHtml = renderEmailShell({
		title: clientSubject,
		contentHtml: clientContentHtml,
	});

	return sendEmail({
		to: payload.email,
		subject: clientSubject,
		html: clientHtml,
	});
}

/**
 * 11. Recurring Payment Success Email
 */
export async function sendRecurringPaymentSuccessEmail({
	toEmail,
	userName,
	plan,
	amount,
	currency,
	cardLast4,
	nextBillingDate,
}: {
	toEmail: string;
	userName: string;
	plan: string;
	amount: number;
	currency: string;
	cardLast4?: string;
	nextBillingDate: string;
}) {
	const subject = `Subscription Renewed: Your ${plan} Website is Active`;
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			Your recurring subscription for your <strong>${plan}</strong> website has automatically renewed successfully.
		</p>
		<div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
			<p style="margin: 0 0 6px 0; font-size: 14px; color: #166534;"><strong>Amount Billed:</strong> ${currency} ${amount}.00</p>
			${cardLast4 ? `<p style="margin: 0 0 6px 0; font-size: 14px; color: #166534;"><strong>Payment Card:</strong> •••• ${cardLast4}</p>` : ""}
			<p style="margin: 0; font-size: 14px; color: #166534;"><strong>Next Renewal Date:</strong> ${nextBillingDate}</p>
		</div>
		<p style="margin: 0 0 16px 0;">
			Your live website and custom domain remain online with zero downtime. You can view your invoice history and manage your billing settings anytime from your dashboard.
		</p>
		<p style="margin: 0 0 16px 0;">
			👉 <a href="${getAppUrl()}/dashboard/billing" style="color: #004ac6; font-weight: 700; text-decoration: underline;">View Billing Dashboard</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "Subscription Renewed",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

/**
 * 12. Recurring Payment Failed Warning Email
 */
export async function sendRecurringPaymentFailedEmail({
	toEmail,
	userName,
	plan,
	amount,
	currency,
	cardLast4,
	paymentLink,
	dueDate,
}: {
	toEmail: string;
	userName: string;
	plan: string;
	amount: number;
	currency: string;
	cardLast4?: string;
	paymentLink: string;
	dueDate: string;
}) {
	const subject = `Urgent: Recurring Payment Failed for Your ${plan} Website`;
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			We attempted to renew your <strong>${plan}</strong> website subscription (${currency} ${amount}.00)${cardLast4 ? ` using your card ending in •••• ${cardLast4}` : ""}, but the charge could not be completed.
		</p>
		<div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
			<p style="margin: 0; font-size: 14px; color: #92400e;">
				<strong>Notice:</strong> If payment is not completed or recurring billing updated before <strong>${dueDate}</strong>, your plan will be terminated and your live website will be paused.
			</p>
		</div>
		<p style="margin: 0 0 16px 0;">
			Please update your payment method or pay the renewal invoice immediately using the link below:
		</p>
		<p style="margin: 0 0 20px 0;">
			👉 <a href="${paymentLink}" style="color: #004ac6; font-weight: 700; text-decoration: underline;">Pay Renewal & Update Payment Method</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "Recurring Payment Failed",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

/**
 * 13. Plan Terminated Notice Email
 */
export async function sendPlanTerminatedNoticeEmail({
	toEmail,
	userName,
	plan,
	reactivationLink,
}: {
	toEmail: string;
	userName: string;
	plan: string;
	reactivationLink: string;
}) {
	const subject = `Your Kiosk Subscription Plan Has Been Terminated: ${plan}`;
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			Your 1-month subscription period for your <strong>${plan}</strong> website has ended and no active recurring payment was received. As a result, your subscription plan has been terminated and your live website is temporarily paused.
		</p>
		<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
			<p style="margin: 0 0 8px 0; font-size: 14px; color: #991b1b;">
				<strong>Website Status:</strong> Paused / Subscription Inactive
			</p>
			<p style="margin: 0; font-size: 13px; color: #b91c1c;">
				Your website content, domain settings, images, and data remain securely stored. Nothing has been deleted.
			</p>
		</div>
		<p style="margin: 0 0 16px 0;">
			To instantly reactivate your website and restore live visitors, please log in and restart your subscription:
		</p>
		<p style="margin: 0 0 24px 0;">
			👉 <a href="${reactivationLink}" style="color: #004ac6; font-weight: 700; text-decoration: underline;">Reactivate Your Plan Now</a> (${reactivationLink})
		</p>
		<p style="margin: 0; font-size: 13px; color: #6b7280;">
			If you have any questions or require assistance, reply directly to this email and our team will help you.
		</p>
	`;

	const html = renderEmailShell({
		title: "Subscription Plan Terminated",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}

/**
 * 14. Recurring Payment Setup Reminder Email (Sent prior to 1-month period end)
 */
export async function sendRecurringSetupReminderEmail({
	toEmail,
	userName,
	plan,
	expiryDate,
	paymentLink,
}: {
	toEmail: string;
	userName: string;
	plan: string;
	expiryDate: string;
	paymentLink: string;
}) {
	const subject = `Action Required: Your ${plan} 1-Month Subscription Expires on ${expiryDate}`;
	const contentHtml = `
		<p style="margin: 0 0 16px 0;">Hi ${userName},</p>
		<p style="margin: 0 0 16px 0;">
			Your 1-month subscription for your <strong>${plan}</strong> website will expire on <strong>${expiryDate}</strong>.
		</p>
		<div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
			<p style="margin: 0; font-size: 14px; color: #92400e;">
				<strong>Notice:</strong> Automatic recurring payment is currently <strong>not set</strong> on your account. To prevent your website plan from terminating at the end of the period, please ensure payment is completed or set up recurring card billing.
			</p>
		</div>
		<p style="margin: 0 0 16px 0;">
			👉 Renew & Enable Recurring Payment:<br/>
			<a href="${paymentLink}" style="color: #004ac6; font-weight: 700; text-decoration: underline;">${paymentLink}</a>
		</p>
	`;

	const html = renderEmailShell({
		title: "Subscription Renewal Notice",
		contentHtml,
	});

	return sendEmail({ to: toEmail, subject, html });
}
