import { fetchQuery, executeQuery } from '../util/database';

export function voiceChannelCreated(channelId, guild, callback) {
    executeQuery('INSERT INTO voicechannels(channelId, guildId) VALUES ?', [channelId, guild.id], (result) => {
        if (callback) callback();
    });
}

export function checkVoiceChannelExists(channelId, guild, callback) {
    fetchQuery('SELECT * FROM voicechannels WHERE channelID = ? AND guildId = ?', [ channelId, guild.id ], (result) => {
        if (result.length == 0) {
            voiceChannelCreated(channelId, guild, callback);
        } else {
            callback();
        }
    });
}