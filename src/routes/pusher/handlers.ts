
import { RequestHandler } from 'express';
import pusher from '../../@core/services/pusher';
import { getProfile } from '../../@core/services/profiles';

export const handlePusherAuthentication:RequestHandler = async (req, res, next) => {
  try {
    const socket_id = req.body.socket_id;
    const userProfile = await getProfile();

    const user = {
      id: String(req.user?.id),
      user_info: {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name
      }
    };

    const authResponse = pusher.authenticateUser(socket_id, user);
    res.send(authResponse);
  }
  catch (err) {
    next(err);
  }
};

export const handlePusherAuthorization:RequestHandler = async (req, res, next) => {
  try {
    const socket_id = req.body.socket_id;
    const channel = req.body.channel_name;

    const authResponse = pusher.authorizeChannel(socket_id, channel);
    res.send(authResponse);
  }
  catch (err) {
    next(err);
  }
};
