import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    size: string;
    quantity: number;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, orderId, products, subtotal, totalAmount } = body as {
            email: string;
            orderId: string;
            products: CartItem[];
            subtotal: number;
            totalAmount: number;
        };

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const discount = subtotal - totalAmount;

        // Build the product rows for the HTML table
        const productRowsHtml = products
            .map(
                (item) => `
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 12px 8px; vertical-align: middle; display: flex; align-items: center; gap: 10px;">
            ${item.image
                        ? `<img src="${item.image}" alt="${item.name}" width="50" height="50" style="border-radius: 4px; object-fit: cover;" />`
                        : ""
                    }
            <div>
              <span style="font-weight: 600; color: #333333; display: block;">${item.name}</span>
              <span style="font-size: 12px; color: #777777;">Size: ${item.size.toUpperCase()}</span>
            </div>
          </td>
          <td style="padding: 12px 8px; text-align: center; vertical-align: middle; color: #555555;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; vertical-align: middle; font-weight: 600; color: #333333;">
            ₹${(item.price * item.quantity).toLocaleString("en-IN")}
          </td>
        </tr>
      `
            )
            .join("");

        const emailHtmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - KitKart</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #fafafa;
              margin: 0;
              padding: 20px;
              -webkit-font-smoothing: antialiased;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
              border: 1px solid #eef0f3;
            }
            .header {
              background-color: #111111;
              padding: 30px 20px;
              text-align: center;
              border-bottom: 3px solid #c5a059;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              letter-spacing: 2px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .content {
              padding: 30px 25px;
            }
            .welcome-text {
              font-size: 18px;
              color: #222222;
              margin-top: 0;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .sub-text {
              font-size: 14px;
              color: #555555;
              line-height: 1.6;
              margin-bottom: 25px;
            }
            .order-badge {
              display: inline-block;
              background-color: #f7f3eb;
              border: 1px solid #e6d8be;
              color: #8c6b2d;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              margin-bottom: 25px;
            }
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .products-table th {
              background-color: #f8f9fa;
              padding: 10px 8px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #666666;
              border-bottom: 2px solid #eeeeee;
              text-align: left;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            .summary-table td {
              padding: 6px 8px;
              font-size: 14px;
            }
            .summary-label {
              color: #666666;
            }
            .summary-value {
              text-align: right;
              color: #222222;
              font-weight: 500;
            }
            .total-row td {
              padding-top: 15px;
              border-top: 2px dashed #eeeeee;
              font-size: 18px;
              font-weight: 700;
            }
            .total-row .summary-label {
              color: #111111;
            }
            .total-row .summary-value {
              color: #c5a059;
              font-size: 20px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 25px 20px;
              text-align: center;
              font-size: 12px;
              color: #777777;
              border-top: 1px solid #eeeeee;
              line-height: 1.5;
            }
            .footer a {
              color: #c5a059;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1>KitKart</h1>
            </div>
            <div class="content">
              <h2 class="welcome-text">Thank You for Your Order!</h2>
              <p class="sub-text">We've received your order and are getting it ready to ship. Here are your order details:</p>
              
              <div class="order-badge">
                Order ID: #${orderId}
              </div>

              <table class="products-table">
                <thead>
                  <tr>
                    <th style="width: 60%;">Product</th>
                    <th style="width: 15%; text-align: center;">Qty</th>
                    <th style="width: 25%; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRowsHtml}
                </tbody>
              </table>

              <table class="summary-table">
                <tr>
                  <td class="summary-label">Subtotal</td>
                  <td class="summary-value">₹${subtotal.toLocaleString("en-IN")}</td>
                </tr>
                ${discount > 0
                ? `
                <tr>
                  <td class="summary-label" style="color: #28a745;">Discount</td>
                  <td class="summary-value" style="color: #28a745;">-₹${discount.toLocaleString("en-IN")}</td>
                </tr>
                `
                : ""
            }
                <tr>
                  <td class="summary-label">Shipping</td>
                  <td class="summary-value" style="color: #28a745; font-weight: 600;">FREE</td>
                </tr>
                <tr class="total-row">
                  <td class="summary-label">Total Amount</td>
                  <td class="summary-value">₹${totalAmount.toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              <p>If you have any questions, reply to this email or contact us at <a href="mailto:support.house25@gmail.com">support.house25@gmail.com</a>.</p>
              <p>&copy; ${new Date().getFullYear()} KitKart. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        // Note: If using Resend with an unverified domain (onboarding@resend.dev),
        // Resend will only deliver emails to the email address registered with the Resend account.
        const { data, error } = await resend.emails.send({
            from: "KitKart <onboarding@resend.dev>",
            to: [email],
            subject: `Order Confirmation #${orderId} - KitKart`,
            html: emailHtmlContent,
        });

        if (error) {
            console.error("Resend API Error details:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Send Email Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
