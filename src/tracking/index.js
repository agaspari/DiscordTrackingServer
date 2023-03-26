import { insertMessage } from './messages';
import { userJoined, userLeft, userNicknameChange } from './users'; // TODO: Change users.js to guild.js
import { checkUserExists } from './users';
import { userJoinedChannel, userLeftChannel, userMovedChannel } from './voiceactivity';

import { PRESENCE_CHANGE_STATUS, SERVER_STATUS, MEMBER_CHANGE_STATUS } from '../constants';
export function handleUserMessage(params) {
    const { channel, member, message } = params; 
    insertMessage(channel, member, message);
}

export function handleUserServerStatus(params) {
    const { member, type } = params;
    switch (type) {
        case SERVER_STATUS.LEFT:
        case SERVER_STATUS.BANNED:
        case SERVER_STATUS.KICKED:
            userLeft(member);
            break;
        case SERVER_STATUS.JOINED:
            checkUserExists(member, () => {
                userJoined(member)
            });
            break;
    };
}

export function handleUserPresenceChange(params) {
    const { member, channelId, type } = params;
    switch (type) {
        case PRESENCE_CHANGE_STATUS.LEFT:
            userLeftChannel(member, channelId);
            break;
        case PRESENCE_CHANGE_STATUS.JOINED:
            userJoinedChannel(member, channelId);
            break;
        case PRESENCE_CHANGE_STATUS.MOVED:
            userMovedChannel(member, params.oldChannelId, params.newChannelId);
            break;
    };
}


export function handleMemberChange(params) {
    const { member, type } = params;

    switch (type) {
        case MEMBER_CHANGE_STATUS.NICKNAME:
            userNicknameChange(member);    
            break;
    }
}

function handleUserChannel(params) {

}