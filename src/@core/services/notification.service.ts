import { getMessaging } from '../config/firebase-admin-config';
import type { MulticastMessage, BatchResponse } from 'firebase-admin/messaging';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface DeviceInfo {
  token: string;
  platform: 'ios' | 'android';
}

/**
 * Send push notification to a single device
 */
export async function sendNotification(
  deviceToken: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const messaging = getMessaging();
    
    if (!messaging) {
      console.warn('Firebase Messaging not initialized. Skipping notification.');
      return false;
    }

    const message = {
      token: deviceToken,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {},
      // High priority for immediate delivery
      android: {
        priority: 'high' as const
      },
      apns: {
        headers: {
          'apns-priority': '10'
        }
      }
    };

    await messaging.send(message);
    console.log(`Notification sent to device: ${deviceToken.substring(0, 20)}...`);
    return true;
  } catch (error: any) {
    console.error('Failed to send notification:', error.message);
    return false;
  }
}

/**
 * Send push notification to multiple devices
 */
export async function sendBatchNotification(
  devices: DeviceInfo[],
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  try {
    const messaging = getMessaging();
    
    if (!messaging) {
      console.warn('Firebase Messaging not initialized. Skipping batch notification.');
      return { successCount: 0, failureCount: devices.length };
    }

    if (devices.length === 0) {
      console.warn('No devices to send notifications to.');
      return { successCount: 0, failureCount: 0 };
    }

    // Extract tokens
    const tokens = devices.map(d => d.token);

    // Create multicast message
    const message: MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {},
      // High priority for immediate delivery
      android: {
        priority: 'high' as const
      },
      apns: {
        headers: {
          'apns-priority': '10'
        }
      }
    };

    const response: BatchResponse = await messaging.sendEachForMulticast(message);
    
    console.log(`Batch notification sent: ${response.successCount} succeeded, ${response.failureCount} failed`);
    
    // Log failures for debugging
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to ${tokens[idx].substring(0, 20)}...: ${resp.error?.message}`);
        }
      });
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error: any) {
    console.error('Failed to send batch notification:', error.message);
    return { successCount: 0, failureCount: devices.length };
  }
}

/**
 * Send session started notification to all participants
 */
export async function sendSessionStartNotification(
  participants: Array<{ device_token: string | null; device_platform: string | null }>,
  sessionData: {
    join_code: string;
    session_id: number;
    started_at: string;
  }
): Promise<void> {
  try {
    // Filter participants with valid device tokens
    const devicesWithTokens = participants
      .filter(p => p.device_token && p.device_platform)
      .map(p => ({
        token: p.device_token!,
        platform: p.device_platform! as 'ios' | 'android'
      }));

    if (devicesWithTokens.length === 0) {
      console.log('No participants with device tokens. Skipping push notifications.');
      return;
    }

    const payload: NotificationPayload = {
      title: 'Session Started!',
      body: 'The quiz session has begun. Join now to participate!',
      data: {
        type: 'session_started',
        session_id: sessionData.session_id.toString(),
        join_code: sessionData.join_code,
        started_at: sessionData.started_at,
        current_question_index: '0',
        time_per_question: '30'
      }
    };

    await sendBatchNotification(devicesWithTokens, payload);
  } catch (error) {
    console.error('Error sending session start notifications:', error);
  }
}

/**
 * Send session invitation to all app users (broadcast)
 */
export async function sendSessionInviteNotification(
  allUsers: Array<{ device_token: string | null; device_platform: string | null }>,
  sessionData: {
    join_code: string;
    scenario_title: string;
    join_url: string;
  }
): Promise<void> {
  try {
    // Filter users with valid device tokens
    const devicesWithTokens = allUsers
      .filter(u => u.device_token && u.device_platform)
      .map(u => ({
        token: u.device_token!,
        platform: u.device_platform! as 'ios' | 'android'
      }));

    if (devicesWithTokens.length === 0) {
      console.log('No users with device tokens. Skipping session invite notifications.');
      return;
    }

    const payload: NotificationPayload = {
      title: 'New Session Available!',
      body: `"${sessionData.scenario_title}" - Please join the session.`,
      data: {
        type: 'session_invite',
        join_code: sessionData.join_code,
        join_url: sessionData.join_url,
        scenario_title: sessionData.scenario_title
      }
    };

    console.log(`Broadcasting session invite to ${devicesWithTokens.length} users...`);
    await sendBatchNotification(devicesWithTokens, payload);
  } catch (error) {
    console.error('Error sending session invite notifications:', error);
  }
}

export default {
  sendNotification,
  sendBatchNotification,
  sendSessionStartNotification,
  sendSessionInviteNotification
};
