import { fetchQuery, executeQuery } from '../util/database';
import { checkGuildExists } from './guilds';
import { checkUserExists } from './users';
import { checkTextChannelExists } from './textchannels';

export function insertMessage(channel, member, message) {
    checkGuildExists(member.guild, () => {
        checkUserExists(member, () => {
            checkTextChannelExists(channel, member.guild, () => {
                executeQuery('INSERT INTO messages(messageId, guildId, channelId, authorId, content, createdAt) VALUES ?', [message.id, member.guild.id, channel.id, member.user.id, message.content, message.createdAt], (result) => {
                    console.log(result);
                })
            })
        })
    });
}

export function getMessages(queryData, callback) {
    let { guildId, pageNum, startDate, endDate } = queryData;
    startDate = startDate || new Date(2000, 0).toISOString(); // Arbitrary start date before BOT records
    endDate = endDate || new Date().toISOString();
    fetchQuery('SELECT username, nickname, COUNT(*) AS count FROM messages INNER JOIN users ON messages.authorId = users.userId AND messages.guildId = users.guildId WHERE messages.guildId = ? AND messages.createdAt BETWEEN ? AND ? GROUP BY users.userId ORDER BY count DESC LIMIT ?, ?;', [ guildId, startDate, endDate, pageNum * 10, 10 ], (result) => {
        callback(result);
    });
}

export function getMessageTrend(guildId, callback) {
    const date = new Date();
    date.setDate(date.getDate() - 60); // TODO : Make this not STATIC 
    fetchQuery('SELECT MONTH(createdAt) as month, DAY(createdAt) AS day, COUNT(*) AS count FROM messages WHERE guildId = ? AND createdAt > ? GROUP BY MONTH(createdAt), DAY(createdAt);', [ guildId, date ], (result) => {
        callback(result);
    });
}


export function getUserMessageTrend(guildId, userId, callback) {
    const date = new Date();
    date.setDate(date.getDate() - 60); // TODO : Make this not STATIC 
    fetchQuery('SELECT MONTH(createdAt) as month, DAY(createdAt) AS day, COUNT(*) AS count FROM messages WHERE guildId = ? AND authorId = ? AND createdAt > ? GROUP BY MONTH(createdAt), DAY(createdAt);', [ guildId, userId, date ], (result) => {
        callback(result);
    });
}

export function getTotalMessages(guildId, callback) {
    const date = new Date();
    date.setDate(date.getDate() - 60); // TODO : Make this not STATIC 
    fetchQuery('SELECT COUNT(*) AS count FROM messages WHERE messages.guildId = ? AND messages.createdAt > ?;', [ guildId, date ], (result) => {
        callback(result);
    });
}