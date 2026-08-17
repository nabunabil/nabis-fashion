import nodemailer from "nodemailer";
import { env } from "./env";

// Initialize Nodemailer transporter with Google SMTP
let transporter: nodemailer.Transporter | null = null;

if (env.smtpUser && env.smtpPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&copy;/gi, "\u00a9")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) return;

  const fromAddress = env.smtpFromEmail;
  const from = `Nabis Fashton <${fromAddress}>`;

  try {
    return await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: htmlToText(html),
    });
  } catch {
    // Email failures should not break the app
  }
}

type OrderItem = {
  quantity: number;
  price: number;
  medicine: { name: string };
};

type OrderForEmail = {
  id: string;
  total: number;
  paymentMethod: string;
  shippingName: string;
  shippingEmail: string;
  address: string;
  createdAt: Date;
  items: OrderItem[];
};

export async function sendOrderConfirmationEmail(order: OrderForEmail) {
  if (!order.shippingEmail) return;

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px; font-size:13px; color:#333; border-bottom:1px solid #eee;">
            ${item.medicine.name}
          </td>
          <td style="padding:10px 12px; font-size:13px; color:#333; border-bottom:1px solid #eee; text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:10px 12px; font-size:13px; color:#333; border-bottom:1px solid #eee; text-align:right;">
            ৳${item.price.toFixed(2)}
          </td>
          <td style="padding:10px 12px; font-size:13px; color:#333; border-bottom:1px solid #eee; text-align:right;">
            ৳${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
  <head>    
    <meta charset="UTF-8" />
    <title>Order Confirmation</title>
  </head>

  <body style="margin:0; padding:0; background:#f5f7fb; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:30px;">

          <table width="520" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr>
              <td align="left">
                <img
                  src="https://i.ibb.co.com/39ySSmQd/logo-zenvin.png"
                  alt="Nabis Fashton"
                  width="140"
                  style="display:block;"
                />
              </td>
              <td align="right">
                <img
                  src="https://img.icons8.com/?size=100&id=uLWV5A9vXIPu&format=png&color=000000"
                  alt="Facebook"
                  width="24"
                  style="margin-left:8px; display:inline-block;"
                />
                <img
                  src="https://img.icons8.com/?size=100&id=13930&format=png&color=000000"
                  alt="LinkedIn"
                  width="24"
                  style="margin-left:8px; display:inline-block;"
                />
              </td>
            </tr>
          </table>

          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:28px;">

            <tr>
              <td style="padding-bottom:6px;">
                <span style="display:inline-block; background:#dcfce7; color:#16a34a; font-size:12px; font-weight:600; padding:4px 10px; border-radius:20px;">
                  Order Confirmed
                </span>
              </td>
            </tr>

            <tr>
              <td style="font-size:20px; font-weight:700; color:#111; padding-bottom:4px;">
                Thank you for your order!
              </td>
            </tr>

            <tr>
              <td style="font-size:14px; color:#555; padding-bottom:20px; line-height:1.6;">
                Hi ${order.shippingName || "there"},<br>
                Your order has been confirmed. Here is your invoice summary.
              </td>
            </tr>

            <!-- Order Meta -->
            <tr>
              <td style="padding-bottom:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-radius:6px; padding:14px;">
                  <tr>
                    <td style="font-size:13px; color:#555; padding:4px 0;">
                      <strong style="color:#111;">Order ID:</strong>&nbsp;#${order.id.slice(-8).toUpperCase()}
                    </td>
                    <td style="font-size:13px; color:#555; padding:4px 0; text-align:right;">
                      <strong style="color:#111;">Date:</strong>&nbsp;${formattedDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:13px; color:#555; padding:4px 0;">
                      <strong style="color:#111;">Payment:</strong>&nbsp;${order.paymentMethod}
                    </td>
                    <td style="font-size:13px; color:#555; padding:4px 0; text-align:right;">
                      <strong style="color:#111;">Shipping to:</strong>&nbsp;${order.address}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Items Table -->
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee; border-radius:6px; border-collapse:collapse;">
                  <thead>
                    <tr style="background:#f3f4f6;">
                      <th style="padding:10px 12px; font-size:12px; font-weight:600; color:#555; text-align:left; border-bottom:1px solid #eee;">
                        Product
                      </th>
                      <th style="padding:10px 12px; font-size:12px; font-weight:600; color:#555; text-align:center; border-bottom:1px solid #eee;">
                        Qty
                      </th>
                      <th style="padding:10px 12px; font-size:12px; font-weight:600; color:#555; text-align:right; border-bottom:1px solid #eee;">
                        Unit Price
                      </th>
                      <th style="padding:10px 12px; font-size:12px; font-weight:600; color:#555; text-align:right; border-bottom:1px solid #eee;">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRows}
                    <tr style="background:#f9fafb;">
                      <td colspan="3" style="padding:12px; font-size:14px; font-weight:700; color:#111; text-align:right;">
                        Total
                      </td>
                      <td style="padding:12px; font-size:14px; font-weight:700; color:#4f46e5; text-align:right;">
                        ৳${order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding-top:24px; font-size:13px; color:#555; line-height:1.6;">
                If you have any questions about your order, please contact us at
                <a href="mailto:info@abnahid.com" style="color:#4f46e5; text-decoration:none;">info@abnahid.com</a>.
              </td>
            </tr>

            <tr>
              <td style="padding-top:20px; font-size:13px; color:#777;">
                Thanks,<br>
                Nabis Fashton Team
              </td>
            </tr>

          </table>

          <div style="max-width:520px; margin-top:16px; font-size:12px; color:#888; text-align:left; line-height:1.6;">
            500 Medical Park Drive, Sylhet<br>
            © 2025 Nabis Fashton
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  return sendEmail({
    to: order.shippingEmail,
    subject: `Order Confirmed — #${order.id.slice(-8).toUpperCase()}`,
    html,
  });
}
