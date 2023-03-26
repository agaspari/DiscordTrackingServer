import { fetchQuery, executeQuery } from '../util/database';

export function textChannelCreated(channel, guild, callback) {
    // TODO: change this database table to 'textChannels'
    executeQuery('INSERT INTO channels(channelId, guildId) VALUES ?', [channel.id, guild.id], (result) => {
        if (callback) callback();
    });
}

export function checkTextChannelExists(channel, guild, callback) {
    fetchQuery('SELECT * FROM channels WHERE channelID = ? AND guildId = ?', [ channel.id, guild.id ], (result) => {
        if (result.length == 0) {
            textChannelCreated(channel, guild, callback);
        } else {
            callback();
        }
    });
}