package com.meintracker.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit


private const val APP_URL = https://suriaman123.github.io/mein-tracker/#/dashboard

class TrackerWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Show whatever we've got immediately (loading state or last known
        // data), then kick off a background refresh.
        for (id in appWidgetIds) {
            renderLoadingOrCached(context, appWidgetManager, id)
        }
        WidgetUpdateWorker.enqueueOneTime(context)
        schedulePeriodicRefresh(context)
    }

    override fun onEnabled(context: Context) {
        schedulePeriodicRefresh(context)
    }

    private fun schedulePeriodicRefresh(context: Context) {
        val request = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(30, TimeUnit.MINUTES)
            .build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "mein_tracker_widget_refresh",
            ExistingPeriodicWorkPolicy.KEEP,
            request
        )
    }

    private fun renderLoadingOrCached(
        context: Context,
        appWidgetManager: AppWidgetManager,
        widgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_tracker)

        if (!CredentialStore.hasCredentials(context)) {
            views.setTextViewText(R.id.widget_footer, "Tap to set up")
        }

        val openAppIntent = Intent(Intent.ACTION_VIEW, Uri.parse(APP_URL))
        val pendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_title, pendingIntent)

        appWidgetManager.updateAppWidget(widgetId, views)
    }

    companion object {
        fun updateAllWidgets(context: Context, stats: List<TrackerStat>?, errorMessage: String?) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, TrackerWidgetProvider::class.java)
            )

            for (id in ids) {
                val views = RemoteViews(context.packageName, R.layout.widget_tracker)

                if (errorMessage != null) {
                    views.setTextViewText(R.id.widget_footer, errorMessage)
                } else if (stats != null) {
                    stats.forEach { stat ->
                        val text = if (stat.count == 0) "—" else {
                            val avgText = String.format("%.1f", stat.average)
                            val streakText = if (stat.streak > 0) "  🔥${stat.streak}" else ""
                            "$avgText ${stat.unit}$streakText"
                        }
                        when (stat.label) {
                            "Sleep" -> views.setTextViewText(R.id.sleep_value, text)
                            "Water" -> views.setTextViewText(R.id.water_value, text)
                            "Study" -> views.setTextViewText(R.id.study_value, text)
                        }
                    }
                    views.setTextViewText(R.id.widget_footer, "This month · tap to open app")
                }

                val openAppIntent = Intent(Intent.ACTION_VIEW, Uri.parse(APP_URL))
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, openAppIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_title, pendingIntent)

                appWidgetManager.updateAppWidget(id, views)
            }
        }
    }
}
