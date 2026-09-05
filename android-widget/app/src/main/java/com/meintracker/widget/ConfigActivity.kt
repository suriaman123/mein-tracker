package com.meintracker.widget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ConfigActivity : AppCompatActivity() {

    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_config)

        // If the widget cancels here, Android should not add it.
        setResult(Activity.RESULT_CANCELED)

        appWidgetId = intent?.extras?.getInt(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

        val emailInput = findViewById<EditText>(R.id.email_input)
        val passwordInput = findViewById<EditText>(R.id.password_input)
        val errorText = findViewById<TextView>(R.id.error_text)
        val saveButton = findViewById<Button>(R.id.save_button)

        // Pre-fill if credentials already exist (re-configuring an existing widget).
        CredentialStore.getEmail(this)?.let { emailInput.setText(it) }

        saveButton.setOnClickListener {
            val email = emailInput.text.toString().trim()
            val password = passwordInput.text.toString()

            if (email.isEmpty() || password.isEmpty()) {
                errorText.text = "Enter both email and password."
                errorText.visibility = View.VISIBLE
                return@setOnClickListener
            }

            errorText.visibility = View.GONE
            saveButton.isEnabled = false
            saveButton.text = "Checking…"

            lifecycleScope.launch {
                try {
                    // Verify the credentials actually work before saving, so
                    // a typo doesn't silently produce a broken widget.
                    withContext(Dispatchers.IO) {
                        SupabaseClient().login(email, password)
                    }

                    CredentialStore.save(this@ConfigActivity, email, password)
                    WidgetUpdateWorker.enqueueOneTime(this@ConfigActivity)

                    val resultValue = Intent().putExtra(
                        AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId
                    )
                    setResult(Activity.RESULT_OK, resultValue)
                    finish()
                } catch (e: Exception) {
                    errorText.text = "Login failed: ${e.message}"
                    errorText.visibility = View.VISIBLE
                    saveButton.isEnabled = true
                    saveButton.text = "Save and add widget"
                }
            }
        }
    }
}
