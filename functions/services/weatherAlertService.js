import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from './emailService.js';
import { buildWeatherAdvisoryEmail } from './emailTemplates.js';

/**
 * Validate latitude and longitude coordinates
 */
function isValidCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Fetch forecast weather telemetry from Open-Meteo API
 */
async function fetchOpenMeteoWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`;
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'FarmHelperBackend/1.0 (Agricultural Advisory)' },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo HTTP ${response.status} for coords (${lat}, ${lng})`);
  }

  const data = await response.json();
  if (!data || (!data.current && !data.daily)) {
    throw new Error('Invalid Open-Meteo telemetry response structure.');
  }

  return data;
}

/**
 * Evaluate agricultural weather alert rules against telemetry
 */
export function evaluateWeatherAlertRules(weatherData) {
  const alerts = [];
  const current = weatherData.current || {};
  const daily = weatherData.daily || {};

  const todayDate = daily.time?.[0] || new Date().toISOString().split('T')[0];
  const todayPrecipProb = daily.precipitation_probability_max?.[0] ?? (current.precipitation > 0 ? 80 : 0);
  const todayPrecipSum = daily.precipitation_sum?.[0] ?? 0;
  const todayMaxTemp = daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 25;
  const todayMinTemp = daily.temperature_2m_min?.[0] ?? current.temperature_2m ?? 20;
  const todayWmoCode = daily.weather_code?.[0] ?? current.weather_code ?? 0;
  const currentWindSpeed = current.wind_speed_10m ?? 0;

  // 1. Heavy Rainfall Rule (Precip prob >= 75% OR Precip sum >= 15mm OR WMO heavy rain codes)
  const heavyRainWmoCodes = [65, 82, 95, 96, 99];
  if (todayPrecipProb >= 75 || todayPrecipSum >= 15 || heavyRainWmoCodes.includes(todayWmoCode)) {
    alerts.push({
      type: 'HEAVY_RAINFALL',
      title: 'Heavy Rainfall Expected',
      condition: `High rain probability (${todayPrecipProb}%) with expected precipitation of ${todayPrecipSum} mm.`,
      period: `Today (${todayDate})`,
      measurements: `Rain Probability: ${todayPrecipProb}%, Expected Rainfall: ${todayPrecipSum} mm`,
      recommendation: 'Ensure field drainage channels are clear to prevent waterlogging. Suspend foliar pesticide/fertilizer spraying until rainfall subsides to prevent wash-off.',
      dateStr: todayDate,
    });
  }

  // 2. Extreme High Temperature Rule (Max Temp >= 39°C)
  if (todayMaxTemp >= 39) {
    alerts.push({
      type: 'EXTREME_HEAT',
      title: 'Extreme High Temperature Warning',
      condition: `Severe heatwave condition detected with maximum temperature reaching ${Math.round(todayMaxTemp)}°C.`,
      period: `Today (${todayDate})`,
      measurements: `Max Temperature: ${Math.round(todayMaxTemp)}°C`,
      recommendation: 'Provide light irrigation during early morning or evening hours to protect crop roots from heat stress and high evapotranspiration.',
      dateStr: todayDate,
    });
  }

  // 3. Frost / Cold Wave Rule (Min Temp <= 5°C)
  if (todayMinTemp <= 5) {
    alerts.push({
      type: 'FROST_COLD_WAVE',
      title: 'Frost / Cold Wave Warning',
      condition: `Low night temperature falling to ${Math.round(todayMinTemp)}°C with frost risk.`,
      period: `Overnight / Today (${todayDate})`,
      measurements: `Min Temperature: ${Math.round(todayMinTemp)}°C`,
      recommendation: 'Apply light evening irrigation to raise soil thermal capacity. Provide protective coverings or smoke smudge fires around nursery/seedling plots.',
      dateStr: todayDate,
    });
  }

  // 4. Strong Wind / Storm Advisory Rule (Wind Speed >= 30 km/h)
  if (currentWindSpeed >= 30) {
    alerts.push({
      type: 'STRONG_WIND_STORM',
      title: 'Strong Wind & Gust Advisory',
      condition: `High wind velocity of ${Math.round(currentWindSpeed)} km/h observed.`,
      period: `Current / Today (${todayDate})`,
      measurements: `Wind Speed: ${Math.round(currentWindSpeed)} km/h`,
      recommendation: 'Stake tall standing crops (sugarcane, banana, papaya, maize). Avoid spray applications to prevent severe chemical drift.',
      dateStr: todayDate,
    });
  }

  return alerts;
}

/**
 * Process scheduled weather advisories for all eligible users and farms
 */
export async function processScheduledWeatherAlerts(db) {
  console.log('[Scheduled Job] Starting automated weather advisory scan...');

  let totalUsersProcessed = 0;
  let totalFarmsEvaluated = 0;
  let totalEmailsSent = 0;
  let totalSkippedDuplicates = 0;

  try {
    // Query users collection
    const usersSnapshot = await db.collection('users').get();
    console.log(`[Scheduled Job] Found ${usersSnapshot.size} registered users in Firestore.`);

    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      const userProfile = userDoc.data() || {};
      const farmerName = userProfile.fullName || 'Progressive Farmer';

      // Check email notification preference and optional notificationEmail from user settings
      let emailNotificationsEnabled = userProfile.emailNotifications !== false;
      let recipientEmail = null;

      try {
        const prefSnap = await db.collection('users').doc(uid).collection('settings').doc('preferences').get();
        if (prefSnap.exists) {
          const prefData = prefSnap.data();
          if (typeof prefData.emailNotifications === 'boolean') {
            emailNotificationsEnabled = prefData.emailNotifications;
          }
          if (
            prefData.notificationEmail &&
            typeof prefData.notificationEmail === 'string' &&
            prefData.notificationEmail.includes('@')
          ) {
            recipientEmail = prefData.notificationEmail.trim().toLowerCase();
          }
        }
      } catch (prefErr) {
        console.warn(`[Scheduled Job Note] Could not fetch settings for UID ${uid}: ${prefErr.message}`);
      }

      // If no notificationEmail from preferences, fallback to user's Firebase Auth / profile email
      if (!recipientEmail && userProfile.email && typeof userProfile.email === 'string' && userProfile.email.includes('@')) {
        recipientEmail = userProfile.email.trim().toLowerCase();
      }

      if (!emailNotificationsEnabled) {
        console.log(`[Scheduled Job] Skipping UID ${uid}: emailNotifications disabled by user preference.`);
        continue;
      }

      if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
        console.warn(`[Scheduled Job Diagnostic] Skipping UID ${uid}: no valid registered or notification email address found.`);
        continue;
      }

      totalUsersProcessed++;

      // Fetch farms belonging strictly to this user
      const farmsSnapshot = await db.collection('farms').where('userId', '==', uid).get();
      if (farmsSnapshot.empty) {
        console.log(`[Scheduled Job] UID ${uid} has 0 registered farm plots.`);
        continue;
      }

      for (const farmDoc of farmsSnapshot.docs) {
        totalFarmsEvaluated++;
        const farmId = farmDoc.id;
        const farm = farmDoc.data();
        const farmName = farm.farmName || 'My Farm Plot';
        const locationName = farm.locationName || 'Registered Location';
        const lat = farm.latitude;
        const lng = farm.longitude;

        if (!isValidCoordinates(lat, lng)) {
          console.warn(`[Scheduled Job Diagnostic] Skipping farm "${farmName}" (ID: ${farmId}) for UID ${uid}: missing or invalid coordinates (lat: ${lat}, lng: ${lng}).`);
          continue;
        }

        let weatherData;
        try {
          weatherData = await fetchOpenMeteoWeather(lat, lng);
        } catch (weatherErr) {
          console.error(`[Scheduled Job Error] Failed to fetch weather for farm "${farmName}" (ID: ${farmId}): ${weatherErr.message}`);
          continue; // Continue with next farm without failing job
        }

        const alerts = evaluateWeatherAlertRules(weatherData);
        if (alerts.length === 0) {
          continue;
        }

        // Filter out alerts already sent to user for this farm on this forecast date
        const newAlerts = [];
        for (const alert of alerts) {
          const notificationId = `weather_${farmId}_${alert.type}_${alert.dateStr}`;
          const historyRef = db.collection('users').doc(uid).collection('notificationHistory').doc(notificationId);
          const historySnap = await historyRef.get();

          if (historySnap.exists && historySnap.data()?.status === 'SENT') {
            console.log(`[Scheduled Job Deduplication] Alert "${notificationId}" already sent to UID ${uid}. Skipping.`);
            totalSkippedDuplicates++;
          } else {
            newAlerts.push({ ...alert, notificationId });
          }
        }

        if (newAlerts.length === 0) {
          continue;
        }

        // Consolidate alerts for this farm into a single advisory email
        const primaryAlert = newAlerts[0];
        const consolidatedTitle = newAlerts.map((a) => a.title).join(' & ');
        const consolidatedConditions = newAlerts.map((a) => a.condition).join(' ');
        const consolidatedMeasurements = newAlerts.map((a) => a.measurements).join(' | ');
        const consolidatedRecommendations = newAlerts.map((a) => `${a.title}: ${a.recommendation}`).join('\n\n');

        const emailContent = buildWeatherAdvisoryEmail({
          farmerName,
          farmName,
          locationName,
          alertTitle: consolidatedTitle,
          weatherCondition: consolidatedConditions,
          forecastPeriod: primaryAlert.period,
          relevantMeasurements: consolidatedMeasurements,
          agronomicRecommendation: consolidatedRecommendations,
        });

        // Attempt sending email via configured provider
        let emailResult;
        try {
          emailResult = await sendEmail({
            to: recipientEmail,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });
        } catch (sendErr) {
          console.error(`[Scheduled Job Delivery Failure] Failed to send email to ${recipientEmail} for farm "${farmName}": ${sendErr.message}`);
          continue; // Do NOT write 'SENT' to notification history if provider fails!
        }

        // Record SENT only after successful email provider dispatch
        for (const alert of newAlerts) {
          const historyRef = db.collection('users').doc(uid).collection('notificationHistory').doc(alert.notificationId);
          await historyRef.set({
            id: alert.notificationId,
            userId: uid,
            farmId: farmId,
            farmName: farmName,
            alertType: alert.type,
            forecastDate: alert.dateStr,
            status: emailResult.simulated ? 'SIMULATED_DEV' : 'SENT',
            sentAt: FieldValue.serverTimestamp(),
            provider: emailResult.provider,
            messageId: emailResult.messageId || null,
            simulated: emailResult.simulated || false,
          });
        }

        totalEmailsSent++;
        console.log(`[Scheduled Job Success] Delivered weather advisory email to ${recipientEmail} for farm "${farmName}".`);
      }
    }

    console.log('[Scheduled Job Complete] Summary:', {
      usersProcessed: totalUsersProcessed,
      farmsEvaluated: totalFarmsEvaluated,
      emailsSent: totalEmailsSent,
      skippedDuplicates: totalSkippedDuplicates,
    });

    return {
      success: true,
      usersProcessed: totalUsersProcessed,
      farmsEvaluated: totalFarmsEvaluated,
      emailsSent: totalEmailsSent,
      skippedDuplicates: totalSkippedDuplicates,
    };
  } catch (err) {
    console.error('[Scheduled Job Fatal Error]', err);
    throw err;
  }
}
