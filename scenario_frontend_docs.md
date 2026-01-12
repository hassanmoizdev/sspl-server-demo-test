Mobile App Push Notification Integration Guide
Overview
When an admin activates a quiz session, participants receive notifications through two channels:

Pusher (Real-time WebSocket): For instant UI updates when app is open
FCM/APNs (Push Notifications): For system notifications when app is backgrounded or closed
This dual-channel approach ensures participants are notified regardless of app state.

Setup Requirements
Android (Kotlin)

1. Add Firebase to Your Android Project
   Go to Firebase Console
   Select your project (or ask backend team for the project)
   Click "Add app" → Android icon
   Download google-services.json
   Place it in your app/ directory
2. Add Dependencies
   In your build.gradle (project level):

buildscript {
dependencies {
classpath 'com.google.gms:google-services:4.4.0'
}
}
In your build.gradle (app level):

plugins {
id 'com.google.gms.google-services'
}
dependencies {
// Firebase Cloud Messaging
implementation platform('com.google.firebase:firebase-bom:32.7.0')
implementation 'com.google.firebase:firebase-messaging-ktx'

    // Pusher (for real-time updates)
    implementation 'com.pusher:pusher-java-client:2.4.4'

} 3. Add Permissions
In AndroidManifest.xml:

<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
iOS (Swift)
1. Add Firebase to Your iOS Project
Go to Firebase Console
Select your project
Click "Add app" → iOS icon
Download GoogleService-Info.plist
Add it to your Xcode project
2. Install Dependencies
Using CocoaPods (Podfile):

pod 'Firebase/Messaging'
pod 'PusherSwift', '~> 10.1'
Run: pod install

3. Configure APNs
   Enable Push Notifications capability in Xcode
   Upload APNs certificate/key to Firebase Console
   Configure your app delegate
   API Integration
1. Join Session with Device Token
   When a participant joins a session, send their FCM/APNs device token to register for notifications.

Endpoint: POST /api/scenarios/sessions/:joinCode/join

Request Body:

{
"name": "John Doe",
"email": "john@example.com",
"device_token": "fcm_token_or_apns_token_here",
"device_platform": "android"
}
Parameters:

name (required): Participant's name
email (required): Participant's email
device_token (optional): FCM token (Android) or APNs token (iOS)
device_platform (optional): Either "android" or "ios"
Response:

{
"id": 123,
"session_id": 456,
"name": "John Doe",
"email": "john@example.com",
"joined_at": "2026-01-09T01:00:00Z"
}
Notification Payload Structure
Session Started Notification
When an admin starts a session, all participants receive:

{
"notification": {
"title": "Session Started! 🎯",
"body": "The quiz session has begun. Join now to participate!"
},
"data": {
"type": "session_started",
"session_id": "123",
"join_code": "ABC123",
"started_at": "2026-01-09T01:00:00Z",
"current_question_index": "0",
"time_per_question": "30"
}
}
Data Fields:

type: Always "session_started" for this event
session_id: Unique session identifier
join_code: Session join code
started_at: ISO 8601 timestamp when session started
current_question_index: Current question (0-indexed)
time_per_question: Seconds per question (always 30)
Implementation Examples
Android (Kotlin)

1.  Get FCM Token
    import com.google.firebase.messaging.FirebaseMessaging
    class SessionActivity : AppCompatActivity() {
        private fun getFCMToken() {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w(TAG, "Fetching FCM token failed", task.exception)
                    return@addOnCompleteListener
                }
                // Get FCM token
                val token = task.result
                Log.d(TAG, "FCM Token: $token")

                // Store token for later use when joining session
                saveTokenToPreferences(token)
            }
        }

        private fun saveTokenToPreferences(token: String) {
            val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
            prefs.edit().putString("fcm_token", token).apply()
        }
    }
2.  Request Notification Permission (Android 13+)
    import android.Manifest
    import android.content.pm.PackageManager
    import android.os.Build
    import androidx.core.app.ActivityCompat
    import androidx.core.content.ContextCompat
    class SessionActivity : AppCompatActivity() {
        private val NOTIFICATION_PERMISSION_CODE = 123

        private fun requestNotificationPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(
                        this,
                        Manifest.permission.POST_NOTIFICATIONS
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    ActivityCompat.requestPermissions(
                        this,
                        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                        NOTIFICATION_PERMISSION_CODE
                    )
                }
            }
        }
    }
3.  Join Session with Device Token
    import retrofit2.http.Body
    import retrofit2.http.POST
    import retrofit2.http.Path
    data class JoinSessionRequest(
    val name: String,
    val email: String,
    val device_token: String?,
    val device_platform: String?
    )
    interface ApiService {
    @POST("api/scenarios/sessions/{joinCode}/join")
    suspend fun joinSession(
    @Path("joinCode") joinCode: String,
    @Body request: JoinSessionRequest
    ): ParticipantResponse
    }
    class SessionRepository(private val apiService: ApiService) {
        suspend fun joinSession(
            joinCode: String,
            name: String,
            email: String,
            context: Context
        ): Result<ParticipantResponse> {
            return try {
                // Get stored FCM token
                val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
                val fcmToken = prefs.getString("fcm_token", null)

                val request = JoinSessionRequest(
                    name = name,
                    email = email,
                    device_token = fcmToken,
                    device_platform = "android"
                )

                val response = apiService.joinSession(joinCode, request)
                Result.success(response)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
4.  Handle Notifications
    Create MyFirebaseMessagingService.kt:

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Check if message contains data payload
        remoteMessage.data.isNotEmpty().let {
            val type = remoteMessage.data["type"]

            when (type) {
                "session_started" -> handleSessionStarted(remoteMessage.data)
            }
        }

        // Check if message contains notification payload
        remoteMessage.notification?.let {
            showNotification(it.title ?: "", it.body ?: "", remoteMessage.data)
        }
    }

    private fun handleSessionStarted(data: Map<String, String>) {
        val joinCode = data["join_code"]
        val sessionId = data["session_id"]

        Log.d(TAG, "Session started: $joinCode")

        // Navigate to active scenario if app is open
        val intent = Intent("SESSION_STARTED").apply {
            putExtra("join_code", joinCode)
            putExtra("session_id", sessionId)
        }
        sendBroadcast(intent)
    }

    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        val channelId = "session_notifications"
        val notificationManager = getSystemService(NotificationManager::class.java)

        // Create notification channel (Android 8.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Session Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for quiz session updates"
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Create intent to open app when notification is tapped
        val intent = Intent(this, ActiveScenarioActivity::class.java).apply {
            putExtra("join_code", data["join_code"])
            putExtra("session_id", data["session_id"])
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Build notification
        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: $token")

        // Save new token
        val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString("fcm_token", token).apply()

        // TODO: Send token to server if user is logged in
    }

    companion object {
        private const val TAG = "FCMService"
    }

}
Register service in AndroidManifest.xml:

<service
    android:name=".MyFirebaseMessagingService"
    android:exported="false">
<intent-filter>
<action android:name="com.google.firebase.MESSAGING_EVENT" />
</intent-filter>
</service>
iOS (Swift)

1.  Configure App Delegate
    import UIKit
    import Firebase
    import UserNotifications
    @main
    class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {
        func application(_ application: UIApplication,
                         didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

            // Initialize Firebase
            FirebaseApp.configure()

            // Set messaging delegate
            Messaging.messaging().delegate = self

            // Set notification delegate
            UNUserNotificationCenter.current().delegate = self

            // Request notification permission
            requestNotificationPermission()

            // Register for remote notifications
            application.registerForRemoteNotifications()

            return true
        }

        func requestNotificationPermission() {
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
                if granted {
                    print("Notification permission granted")
                } else {
                    print("Notification permission denied")
                }
            }
        }

        // MARK: - APNs Token

        func application(_ application: UIApplication,
                         didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
            // Pass device token to Firebase
            Messaging.messaging().apnsToken = deviceToken
        }

        func application(_ application: UIApplication,
                         didFailToRegisterForRemoteNotificationsWithError error: Error) {
            print("Failed to register for remote notifications: \(error)")
        }

        // MARK: - Firebase Messaging Delegate

        func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
            guard let token = fcmToken else { return }
            print("FCM Token: \(token)")

            // Save token to UserDefaults
            UserDefaults.standard.set(token, forKey: "fcm_token")

            // TODO: Send token to server if user is logged in
        }

        // MARK: - Notification Handling

        // Handle notification when app is in foreground
        func userNotificationCenter(_ center: UNUserNotificationCenter,
                                    willPresent notification: UNNotification,
                                    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
            let userInfo = notification.request.content.userInfo

            // Handle session started
            if let type = userInfo["type"] as? String, type == "session_started" {
                handleSessionStarted(userInfo: userInfo)
            }

            // Show notification even when app is in foreground
            completionHandler([.banner, .sound, .badge])
        }

        // Handle notification tap
        func userNotificationCenter(_ center: UNUserNotificationCenter,
                                    didReceive response: UNNotificationResponse,
                                    withCompletionHandler completionHandler: @escaping () -> Void) {
            let userInfo = response.notification.request.content.userInfo

            // Handle session started
            if let type = userInfo["type"] as? String, type == "session_started" {
                let joinCode = userInfo["join_code"] as? String
                let sessionId = userInfo["session_id"] as? String

                // Navigate to active scenario
                navigateToActiveScenario(joinCode: joinCode, sessionId: sessionId)
            }

            completionHandler()
        }

        private func handleSessionStarted(userInfo: [AnyHashable: Any]) {
            let joinCode = userInfo["join_code"] as? String
            let sessionId = userInfo["session_id"] as? String

            print("Session started: \(joinCode ?? "unknown")")

            // Post notification to update UI
            NotificationCenter.default.post(
                name: NSNotification.Name("SessionStarted"),
                object: nil,
                userInfo: ["join_code": joinCode ?? "", "session_id": sessionId ?? ""]
            )
        }

        private func navigateToActiveScenario(joinCode: String?, sessionId: String?) {
            // Navigate to active scenario view controller
            // Implementation depends on your navigation structure
        }
    }
2.  Join Session with Device Token
    import Foundation
    struct JoinSessionRequest: Codable {
    let name: String
    let email: String
    let deviceToken: String?
    let devicePlatform: String?
        enum CodingKeys: String, CodingKey {
            case name
            case email
            case deviceToken = "device_token"
            case devicePlatform = "device_platform"
        }
    }
    class SessionService {
        func joinSession(joinCode: String, name: String, email: String) async throws -> ParticipantResponse {
            // Get FCM token from UserDefaults
            let fcmToken = UserDefaults.standard.string(forKey: "fcm_token")

            let request = JoinSessionRequest(
                name: name,
                email: email,
                deviceToken: fcmToken,
                devicePlatform: "ios"
            )

            let url = URL(string: "https://your-api.com/api/scenarios/sessions/\(joinCode)/join")!
            var urlRequest = URLRequest(url: url)
            urlRequest.httpMethod = "POST"
            urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
            urlRequest.httpBody = try JSONEncoder().encode(request)

            let (data, response) = try await URLSession.shared.data(for: urlRequest)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                throw NSError(domain: "SessionService", code: -1, userInfo: nil)
            }

            return try JSONDecoder().decode(ParticipantResponse.self, from: data)
        }
    }
    Notification States
3.  App Open (Foreground)
    Android:

Pusher WebSocket receives session-started event immediately
FCM data message received in onMessageReceived()
Update UI in real-time
iOS:

Pusher WebSocket receives session-started event immediately
willPresent notification delegate called
Update UI in real-time 2. App in Background (Recent Apps)
Android:

System displays notification in notification tray
Tapping notification opens app via PendingIntent
Pusher reconnects and syncs state
iOS:

System displays notification banner
Tapping notification calls didReceive response delegate
Pusher reconnects and syncs state 3. App Closed (Not Running)
Android:

System displays notification in notification tray
Tapping notification launches app with intent extras
Parse join_code and session_id from intent
Navigate to active scenario
iOS:

System displays notification banner
Tapping notification launches app
didReceive response delegate called with notification data
Navigate to active scenario
Best Practices

1. Token Management
   Refresh Tokens: Update device token on server when FCM/APNs token changes
   Logout: Clear device token from server when user logs out
   Error Handling: Handle cases where notification permission is denied gracefully
2. Dual-Channel Strategy
   Pusher: Use for real-time updates when app is active
   FCM/APNs: Use for background/closed app notifications
   Redundancy: Both channels ensure reliable delivery
3. Deep Linking
   Implement proper deep linking to navigate to active scenario from notification
   Handle app launch from notification tap
   Restore session state correctly
4. Testing
   Test on physical devices (emulators may not support push notifications)
   Test all three app states: foreground, background, closed
   Verify notification appearance and tap behavior
5. User Experience
   Show loading state while joining session
   Display error messages if notification permission denied
   Provide manual refresh option if notifications fail
