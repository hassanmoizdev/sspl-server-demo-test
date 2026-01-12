import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER || 'ap2',
  useTLS: true
});

export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
): Promise<void> {
  try {
    await pusher.trigger(channel, event, data);
    console.log(`Pusher event triggered: ${event} on channel ${channel}`);
  } catch (error) {
    console.error(`Failed to trigger Pusher event: ${event}`, error);
    throw error;
  }
}

export default pusher;
