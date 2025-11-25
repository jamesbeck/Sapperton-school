"use server";

import sgMail from "@sendgrid/mail";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

interface FormResponse {
  success: boolean;
  message: string;
}

export async function sendContactEmail(
  data: ContactFormData
): Promise<FormResponse> {
  try {
    // Validate environment variable
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error("SendGrid API key is not configured");
      return {
        success: false,
        message:
          "Email service is not configured. Please contact the administrator.",
      };
    }

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return {
        success: false,
        message: "Please fill in all required fields.",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    // Configure SendGrid
    sgMail.setApiKey(apiKey);

    // Prepare email content
    const msg = {
      to: "admin@sapperton.gloucs.sch.uk",
      from: "sappertonwebsite@jamesbeck.co.uk",
      subject: "Website enquiry",
      text: `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}

Message:
${data.message}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5c3e; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #2d5c3e; }
    .value { margin-top: 5px; }
    .message-box { background-color: white; padding: 15px; border-left: 4px solid #2d5c3e; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">New Website Enquiry</h2>
      <p style="margin: 5px 0 0 0;">Sapperton C of E Primary School</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">${data.name}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
      </div>
      <div class="field">
        <div class="label">Phone:</div>
        <div class="value">${data.phone || "Not provided"}</div>
      </div>
      <div class="field">
        <div class="label">Message:</div>
        <div class="message-box">${data.message.replace(/\n/g, "<br>")}</div>
      </div>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    // Send email
    await sgMail.send(msg);

    return {
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message:
        "Failed to send message. Please try again later or contact us directly.",
    };
  }
}
