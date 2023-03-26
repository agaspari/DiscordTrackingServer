import { fetchQuery, executeQuery, updateQuery } from '../util/database';
import { checkGuildExists } from './guilds';
import { checkUserExists } from './users';
import { checkVoiceChannelExists } from './voicechannels';

export function userJoinedChannel(member, channelId) {
    checkPreConditions(member, channelId, () => {
        executeQuery('INSERT INTO voiceactivity(voiceChannelId, guildId, userId, joinTime) VALUES ?', [channelId, member.guild.id, member.user.id, new Date()], (result) => {
            //console.log(result);
        });
    });
    
}	

export function userLeftChannel(member, channelId) {
    checkPreConditions(member, channelId, () => {
        fetchQuery('SELECT * FROM voiceactivity WHERE userId=? AND guildId=? AND voiceChannelId=? AND leaveTime IS NULL ORDER BY joinTime DESC LIMIT 1', [member.user.id, member.guild.id, channelId], (result) => {
            const voiceActivityRecord = result[0];
            if (voiceActivityRecord) {
                updateQuery('UPDATE voiceactivity SET leaveTime=? WHERE voiceActivityRecordId=?', [new Date(), voiceActivityRecord.voiceActivityRecordId], (updateResult) => {
                    //console.log("Res here: ", updateResult);
                });
            } else {
                console.log("ERROR: User left without join record.", member, channelId);
            }
        });
    });
}

export function userMovedChannel(member, oldChannelId, newChannelId) {
    checkPreConditions(member, newChannelId, () => {
        fetchQuery('SELECT * FROM voiceactivity WHERE userId=? AND guildId=? AND voiceChannelId=? AND leaveTime IS NULL ORDER BY joinTime DESC LIMIT 1', [member.user.id, member.guild.id, oldChannelId], (result) => {
            const voiceActivityRecord = result[0];
            if (voiceActivityRecord) {
                updateQuery('UPDATE voiceactivity SET leaveTime=? WHERE voiceActivityRecordId=?', [new Date(), voiceActivityRecord.voiceActivityRecordId], (updateResult) => {
                    //console.log("Res here: ", updateResult);
                    userJoinedChannel(member, newChannelId);
                });
            } else {
                console.log("ERROR: User moved without join record.", member, oldChannelId, newChannelId);
            }
        });
    });
}

function checkPreConditions(member, channelId, callback) {
    checkGuildExists(member.guild, () => {
        checkUserExists(member, () => {
            checkVoiceChannelExists(channelId, member.guild, () => {
                callback();
            });
        })
    });
}

export function getUserActivity(queryData, callback) {
    let { guildId, pageNum, startDate, endDate } = queryData;
    startDate = startDate || new Date(2000, 0).toISOString(); // Arbitrary start date before BOT records
    endDate = endDate || new Date().toISOString();
    
    fetchQuery('SELECT username, nickname, SUM(TIMESTAMPDIFF(SECOND, joinTime, leaveTime)) AS totalTime FROM voiceactivity INNER JOIN users ON voiceactivity.userId = users.userId AND voiceactivity.guildId = users.guildId WHERE voiceactivity.guildId = ? AND leaveTime BETWEEN ? AND ? GROUP BY users.userId ORDER BY totalTime DESC LIMIT ?, ?', [guildId, startDate, endDate, pageNum * 10, 10], (result) => {
        callback(result);
    });
}


export function getTotalUserActivity(guildId, callback) {
    const date = new Date();
    date.setDate(date.getDate() - 60); // TODO : Make this not STATIC 
    fetchQuery('SELECT SUM(TIMESTAMPDIFF(SECOND, joinTime, leaveTime)) AS totalTime FROM voiceactivity WHERE voiceactivity.guildId = ? AND leaveTime > ?;', [guildId, date], (result) => {
        callback(result);
    });
}