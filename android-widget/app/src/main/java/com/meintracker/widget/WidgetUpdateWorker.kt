package com.meintracker.widget

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkerParameters
import androidx.work.WorkManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class WidgetUpdateWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val email = CredentialStore.getEmail(applicationContext)
        val password = CredentialStore.getPassword(applicationContext)

        if (email == null || password == null) {
            TrackerWidgetProvider.updateAllWidgets(
                applicationContext, null, "Tap widget, then open app to set up"
            )
            return Result.success()
        }

        return try {
            withContext(Dispatchers.IO) {
                val client = SupabaseClient()
                val token = client.login(email, password)
                val stats = client.fetchAllStats(token)
                TrackerWidgetProvider.updateAllWidgets(applicationContext, stats, null)
            }
            Result.success()
        } catch (e: Exception) {
            TrackerWidgetProvider.updateAllWidgets(
                applicationContext, null, "Error: ${e.message}"
            )
            Result.retry()
        }
    }

    companion object {
        fun enqueueOneTime(context: Context) {
            val request = OneTimeWorkRequestBuilder<WidgetUpdateWorker>().build()
            WorkManager.getInstance(context).enqueue(request)
        }
    }
}
