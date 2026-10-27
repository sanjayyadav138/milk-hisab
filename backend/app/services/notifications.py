import random
import os
import smtplib
import urllib.parse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any

def generate_random_pin(length: int = 4) -> str:
    """Generate a secure, easy-to-remember 4-digit PIN (e.g., '4829')."""
    return f"{random.randint(1000, 9999)}"

def format_welcome_whatsapp_message(
    name: str,
    phone: str,
    pin: str,
    vendor_name: str,
    business_name: Optional[str] = None
) -> str:
    """Formats the WhatsApp welcome message with credentials and login portal link."""
    display_vendor = business_name or vendor_name or "दूधिया"
    msg = (
        f"🥛 *Milk Hisab (डिजिटल दूध खाता)*\n\n"
        f"नमस्ते *{name}* जी,\n"
        f"*{display_vendor}* ने Milk Hisab पर आपका डिजिटल दूध खाता सक्रिय कर दिया है।\n\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"🌐 *लॉगिन पोर्टल:* https://milkhisab.in\n"
        f"📱 *यूज़रनेम / मोबाइल:* `{phone}`\n"
        f"🔑 *आपका गुप्त पिन:* *`{pin}`*\n"
        f"━━━━━━━━━━━━━━━━━━\n\n"
        f"✅ आप इस लिंक पर जाकर रोज़ का दूध, छुट्टी (Pause/Skip), मासिक बिल और पेमेंट सीधे देख सकते हैं।\n"
        f"🔒 लॉगिन करने के बाद आप 'पिन बदलें' विकल्प से अपना पिन भी बदल सकते हैं।\n\n"
        f"धन्यवाद!\n"
        f"दूधिया: {display_vendor} | Milk Hisab"
    )
    return msg

def get_whatsapp_share_url(phone: str, message: str) -> str:
    """Generates a WhatsApp direct web/app intent link."""
    clean_phone = phone.replace(" ", "").replace("+", "").replace("-", "")
    if len(clean_phone) == 10:
        clean_phone = f"91{clean_phone}"
    encoded = urllib.parse.quote(message)
    return f"https://api.whatsapp.com/send?phone={clean_phone}&text={encoded}"

def send_welcome_email(
    to_email: str,
    name: str,
    phone: str,
    pin: str,
    vendor_name: str,
    business_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends a welcome email from info@milkhisab.in using SMTP if configured.
    Falls back gracefully if SMTP is not configured in environment.
    """
    if not to_email or "@" not in to_email:
        return {"status": "skipped", "reason": "No valid email provided"}

    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_from = os.getenv("SMTP_FROM", "info@milkhisab.in")

    display_vendor = business_name or vendor_name or "Milk Hisab Partner"

    subject = f"🥛 Milk Hisab - Your Digital Milk Ledger Account Details ({name})"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        
        <div style="background: linear-gradient(135deg, #1d4ed8, #0f172a); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: bold;">🥛 Milk Hisab</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #bfdbfe;">Modern Digital Milk Diary & Ledger</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 15px; margin-top: 0;">Namaste <strong>{name}</strong>,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Your dairy partner <strong>{display_vendor}</strong> has activated your digital milk ledger account on Milk Hisab.
            You can now view your daily milk delivery, pause deliveries, and review monthly bills online anytime.
          </p>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; font-weight: bold; color: #1e40af;">Your Login Credentials</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Portal URL:</strong> <a href="https://milkhisab.in" style="color: #2563eb;">https://milkhisab.in</a></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Registered Mobile:</strong> <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">{phone}</code></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Security PIN:</strong> <code style="background: #fef08a; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 16px; color: #854d0e;">{pin}</code></p>
          </div>

          <div style="text-align: center; margin: 24px 0 16px 0;">
            <a href="https://milkhisab.in" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
              Open Milk Hisab Portal →
            </a>
          </div>

          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
            For security, please change your PIN after logging in.<br/>
            Contact: info@milkhisab.in | Milk Hisab Technologies
          </p>
        </div>

      </div>
    </body>
    </html>
    """

    if not smtp_host:
        print(f"[EMAIL SIMULATION] To: {to_email} | From: {smtp_from} | PIN: {pin} | Name: {name}")
        return {"status": "simulated", "to": to_email, "from": smtp_from}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Milk Hisab <{smtp_from}>"
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            server.sendmail(smtp_from, [to_email], msg.as_string())
        
        return {"status": "sent", "to": to_email}
    except Exception as e:
        print(f"[EMAIL ERROR] Failed sending to {to_email}: {e}")
        return {"status": "error", "error": str(e)}

def send_welcome_sms(
    phone: str,
    pin: str,
    vendor_name: str
) -> Dict[str, Any]:
    """
    Sends an SMS text message using Indian DLT SMS Gateway (e.g. Fast2SMS / MSG91) if configured.
    Falls back gracefully to logging.
    """
    api_key = os.getenv("FAST2SMS_API_KEY", "")
    message = f"Welcome to Milk Hisab! Your milk ledger account is created by {vendor_name}. Login at https://milkhisab.in with Mobile: {phone} and PIN: {pin}"

    if not api_key:
        print(f"[SMS SIMULATION] To: {phone} | Text: {message}")
        return {"status": "simulated", "phone": phone, "message": message}

    try:
        import urllib.request
        import json

        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "route": "q",
            "message": message,
            "language": "english",
            "flash": 0,
            "numbers": phone.replace("+91", "").replace(" ", "").strip()
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "authorization": api_key,
                "Content-Type": "application/json"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {"status": "sent", "gateway_response": data}
    except Exception as e:
        print(f"[SMS ERROR] Failed sending to {phone}: {e}")
        return {"status": "error", "error": str(e)}
