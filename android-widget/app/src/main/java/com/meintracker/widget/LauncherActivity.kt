package com.meintracker.widget

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Plain launcher screen so the app has something to open from the app
 * drawer — mainly useful for updating saved credentials without having
 * to remove and re-add the widget.
 */
class LauncherActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_config)

        val emailInput = findViewById<EditText>(R.id.email_input)
        val passwordInput = findViewById<EditText>(R.id.password_input)
        val errorText = findViewById<TextView>(R.id.error_text)
        val saveButton = findViewById<Button>(R.id.save_button)

        CredentialStore.getEmail(this)?.let { emailInput.setText(it) }
        saveButton.text = "Save credentials"

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
                    withContext(Dispatchers.IO) {
                        SupabaseClient().login(email, password)
                    }
                    CredentialStore.save(this@LauncherActivity, email, password)
                    WidgetUpdateWorker.enqueueOneTime(this@LauncherActivity)
                    errorText.visibility = View.GONE
                    saveButton.text = "Saved ✓"
                } catch (e: Exception) {
                    errorText.text = "Login failed: ${e.message}"
                    errorText.visibility = View.VISIBLE
                    saveButton.isEnabled = true
                    saveButton.text = "Save credentials"
                }
            }
        }
    }
}
