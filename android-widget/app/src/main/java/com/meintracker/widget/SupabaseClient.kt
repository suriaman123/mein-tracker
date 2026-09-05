package com.meintracker.widget

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone


object SupabaseConfig {
    const val URL = https://ylfmmuxcsarmylwmzmby.supabase.co
    const val ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZm1tdXhjc2FybXlsd216bWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzI0MzIsImV4cCI6MjEwMjM0ODQzMn0.v41jjNE9qZn9n5g06kLkH3wtGspl6FPVFvej6XG5amU
}

data class TrackerStat(
    val label: String,
    val unit: String,
    val average: Double,
    val count: Int,
    val streak: Int,
)

data class TrackerConfig(val table: String, val field: String, val label: String, val unit: String)

private val TRACKERS = listOf(
    TrackerConfig("sleep_logs", "hours", "Sleep", "hrs"),
    TrackerConfig("water_logs", "liters", "Water", "L"),
    TrackerConfig("study_logs", "hours", "Study", "hrs"),
)

class SupabaseClient {
    private val http = OkHttpClient()
    private val isoDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    /** Logs in with email/password, returns an access token. Throws on failure. */
    fun login(email: String, password: String): String {
        val body = JSONObject().apply {
            put("email", email)
            put("password", password)
        }.toString().toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("${SupabaseConfig.URL}/auth/v1/token?grant_type=password")
            .addHeader("apikey", SupabaseConfig.ANON_KEY)
            .post(body)
            .build()

        http.newCall(request).execute().use { response ->
            val text = response.body?.string() ?: "{}"
            val json = JSONObject(text)
            if (!json.has("access_token")) {
                val message = json.optString("error_description", "Login failed")
                throw Exception(message)
            }
            return json.getString("access_token")
        }
    }

    private fun monthBounds(): Pair<String, String> {
        val cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        cal.set(Calendar.DAY_OF_MONTH, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        val start = isoDate.format(cal.time)

        cal.add(Calendar.MONTH, 1)
        val end = isoDate.format(cal.time)

        return Pair(start, end)
    }

    private fun fetchLogs(table: String, field: String, accessToken: String): JSONArray {
        val (start, end) = monthBounds()
        val url = "${SupabaseConfig.URL}/rest/v1/$table" +
            "?select=$field,log_date" +
            "&log_date=gte.$start&log_date=lt.$end" +
            "&order=log_date.desc"

        val request = Request.Builder()
            .url(url)
            .addHeader("apikey", SupabaseConfig.ANON_KEY)
            .addHeader("Authorization", "Bearer $accessToken")
            .get()
            .build()

        http.newCall(request).execute().use { response ->
            val text = response.body?.string() ?: "[]"
            return JSONArray(text)
        }
    }

    // Same logic as the web app: consecutive days ending today (or
    // yesterday, if today isn't logged yet).
    private fun computeStreak(dates: Set<String>): Int {
        val cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)

        if (!dates.contains(isoDate.format(cal.time))) {
            cal.add(Calendar.DAY_OF_MONTH, -1)
        }

        var streak = 0
        while (dates.contains(isoDate.format(cal.time))) {
            streak += 1
            cal.add(Calendar.DAY_OF_MONTH, -1)
        }
        return streak
    }

    /** Fetches this month's stats for all three trackers. */
    fun fetchAllStats(accessToken: String): List<TrackerStat> {
        return TRACKERS.map { tracker ->
            val rows = fetchLogs(tracker.table, tracker.field, accessToken)
            val values = mutableListOf<Double>()
            val dates = mutableSetOf<String>()

            for (i in 0 until rows.length()) {
                val row = rows.getJSONObject(i)
                values.add(row.getDouble(tracker.field))
                dates.add(row.getString("log_date"))
            }

            val average = if (values.isNotEmpty()) values.sum() / values.size else 0.0
            val streak = computeStreak(dates)

            TrackerStat(tracker.label, tracker.unit, average, values.size, streak)
        }
    }
}
