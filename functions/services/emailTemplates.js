/**
 * Reusable HTML and Plain-Text Email Templates for FarmHelper
 * Designed to strictly adhere to established FarmHelper visual identity and brand guidelines:
 * - Warm ivory/off-white background (#FFFDF9 / #F6F3EC)
 * - Olive/sage green primary accents (#4B6B32)
 * - Dark earthy brown headings (#2C221E)
 * - Soft subtle borders and clean typography
 */

/**
 * Generate Weather Advisory Email Template
 */
export function buildWeatherAdvisoryEmail({
  farmerName = 'Farmer',
  farmName,
  locationName,
  alertTitle,
  weatherCondition,
  forecastPeriod,
  relevantMeasurements,
  agronomicRecommendation,
}) {
  const subject = `FarmHelper Weather Advisory — ${alertTitle}`;

  const text = `FarmHelper Weather Advisory: ${alertTitle}

Hello ${farmerName},

A weather alert has been issued for your farm.

Farm Details:
- Farm Name: ${farmName}
- Location: ${locationName || 'Registered Farm Coordinates'}

Weather Forecast & Telemetry:
- Expected Condition: ${weatherCondition}
- Expected Period: ${forecastPeriod}
- Relevant Telemetry: ${relevantMeasurements}

FarmHelper Advisory Recommendation:
${agronomicRecommendation}

---
Manage your alert preferences anytime in FarmHelper Settings:
https://farmhelper.app/settings

This is an automated advisory from FarmHelper.
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      background-color: #F6F3EC;
      color: #2C221E;
      margin: 0;
      padding: 20px 10px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFDF9;
      border: 1px solid #E8E2D5;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(44, 34, 30, 0.05);
    }
    .email-header {
      background-color: #4B6B32;
      color: #FFFFFF;
      padding: 24px 28px;
      text-align: left;
    }
    .email-header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .email-header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #DDE8D2;
    }
    .email-body {
      padding: 28px;
    }
    .alert-banner {
      background-color: #FFF6E5;
      border-left: 4px solid #D97706;
      padding: 14px 18px;
      border-radius: 6px;
      margin-bottom: 24px;
    }
    .alert-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #92400E;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .meta-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #F0ECE1;
      font-size: 14px;
    }
    .meta-label {
      font-weight: 600;
      color: #65544B;
      width: 40%;
    }
    .meta-value {
      color: #2C221E;
      font-weight: 500;
    }
    .recommendation-box {
      background-color: #F0F4E8;
      border: 1px solid #CFDBC1;
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 24px;
    }
    .recommendation-box h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #4B6B32;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .recommendation-box p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: #2C221E;
    }
    .email-footer {
      background-color: #FAF7F2;
      border-top: 1px solid #E8E2D5;
      padding: 16px 28px;
      font-size: 12px;
      color: #8C7A6B;
      text-align: center;
    }
    .email-footer a {
      color: #4B6B32;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>FarmHelper</h1>
      <p>Real-Time Agricultural Weather Advisory</p>
    </div>

    <div class="email-body">
      <div class="alert-banner">
        <h2 class="alert-title">⚠️ Weather Alert: ${alertTitle}</h2>
      </div>

      <p style="font-size: 14px; color: #65544B; margin-top: 0;">
        Hello <strong>${farmerName}</strong>, our meteorological telemetry system detected significant weather conditions for your farm.
      </p>

      <table class="meta-table">
        <tr>
          <td class="meta-label">Farm Name</td>
          <td class="meta-value">${farmName}</td>
        </tr>
        <tr>
          <td class="meta-label">Farm Location</td>
          <td class="meta-value">${locationName || 'Registered Coordinates'}</td>
        </tr>
        <tr>
          <td class="meta-label">Expected Condition</td>
          <td class="meta-value">${weatherCondition}</td>
        </tr>
        <tr>
          <td class="meta-label">Expected Period</td>
          <td class="meta-value">${forecastPeriod}</td>
        </tr>
        <tr>
          <td class="meta-label">Observed Measurements</td>
          <td class="meta-value">${relevantMeasurements}</td>
        </tr>
      </table>

      <div class="recommendation-box">
        <h3>FarmHelper Recommendation</h3>
        <p>${agronomicRecommendation}</p>
      </div>
    </div>

    <div class="email-footer">
      <p style="margin: 0 0 6px 0;">You received this automated alert because email notifications are enabled for your FarmHelper account.</p>
      <p style="margin: 0;">Manage preferences in your <a href="https://farmhelper.app/settings">Account Settings</a>.</p>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}

/**
 * Generate Test Email Template
 */
export function buildTestEmail({ farmerName = 'Progressive Farmer', farmerEmail }) {
  const subject = 'FarmHelper Test Email';

  const text = `FarmHelper Test Email

Hello ${farmerName},

This is a test notification sent from your FarmHelper account to verify that your email delivery configuration is working correctly.

Recipient Email: ${farmerEmail}
Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

If you are receiving this message, your FarmHelper email delivery integration is fully functional!

---
FarmHelper Agricultural Platform
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      background-color: #F6F3EC;
      color: #2C221E;
      margin: 0;
      padding: 20px 10px;
    }
    .email-container {
      max-width: 550px;
      margin: 0 auto;
      background-color: #FFFDF9;
      border: 1px solid #E8E2D5;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(44, 34, 30, 0.05);
    }
    .email-header {
      background-color: #4B6B32;
      color: #FFFFFF;
      padding: 20px 24px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    .email-body {
      padding: 24px;
    }
    .success-badge {
      display: inline-block;
      background-color: #F0F4E8;
      border: 1px solid #CFDBC1;
      color: #4B6B32;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 20px;
      margin-bottom: 16px;
    }
    .info-list {
      background-color: #FAF7F2;
      border: 1px solid #E8E2D5;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 16px 0;
      font-size: 13px;
    }
    .email-footer {
      background-color: #FAF7F2;
      border-top: 1px solid #E8E2D5;
      padding: 14px;
      font-size: 12px;
      color: #8C7A6B;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>FarmHelper</h1>
    </div>

    <div class="email-body">
      <div class="success-badge">✓ System Verification</div>
      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #2C221E;">FarmHelper Test Email</h2>
      <p style="font-size: 14px; color: #65544B; margin-top: 0; line-height: 1.5;">
        Hello <strong>${farmerName}</strong>,
      </p>
      <p style="font-size: 14px; color: #2C221E; line-height: 1.5;">
        This is a test email notification sent from FarmHelper to confirm that real email delivery is properly configured and operational.
      </p>

      <div class="info-list">
        <p style="margin: 3px 0;"><strong>Registered Recipient:</strong> ${farmerEmail}</p>
        <p style="margin: 3px 0;"><strong>Dispatch Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        <p style="margin: 3px 0;"><strong>Status:</strong> Active & Verified</p>
      </div>
    </div>

    <div class="email-footer">
      FarmHelper — Empowering Indian Agriculture
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
