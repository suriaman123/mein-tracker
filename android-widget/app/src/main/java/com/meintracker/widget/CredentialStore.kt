package com.meintracker.widget

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Stores the user's email/password using Android's EncryptedSharedPreferences
 * (backed by the Android Keystore) — not plaintext, not readable by other apps.
 */
object CredentialStore {
    private const val PREFS_NAME = "mein_tracker_secure_prefs"
    private const val KEY_EMAIL = "email"
    private const val KEY_PASSWORD = "password"

    private fun prefs(context: Context): SharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        return EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun save(context: Context, email: String, password: String) {
        prefs(context).edit()
            .putString(KEY_EMAIL, email)
            .putString(KEY_PASSWORD, password)
            .apply()
    }

    fun getEmail(context: Context): String? = prefs(context).getString(KEY_EMAIL, null)

    fun getPassword(context: Context): String? = prefs(context).getString(KEY_PASSWORD, null)

    fun hasCredentials(context: Context): Boolean =
        getEmail(context) != null && getPassword(context) != null
}
