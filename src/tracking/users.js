import { fetchQuery, executeQuery, updateQuery } from '../util/database';
import { checkGuildExists } from './guilds';
import { SERVER_STATUS } from '../constants';
import { bot } from '../';

export function fetchUsers(guildId, callback) {
    fetchQuery('SELECT DISTINCT * FROM users WHERE guildId = ? ORDER BY nickname ASC', [guildId], (result) => {
        if (callback) callback(result);
    });
}

export function userJoinedInitial(member, callback) {
    checkGuildExists(member.guild, () => {
        executeQuery('INSERT INTO users(userId, guildId, username, nickname) VALUES ?', [member.user.id, member.guild.id, member.user.username, member.nickname], (result) => {
            if (callback) callback(result);
        });
    })
}

export function userJoined(member, callback) {
    executeQuery('INSERT INTO guildActivity(userId, guildId, type, dateTime) VALUES ?', [member.user.id, member.guild.id, SERVER_STATUS.JOINED, new Date()], (result) => {
        if (callback) callback(result);
    });
}

export function userLeft(member, callback) {
    /*
    TODO: Determine how should handle users leaving. 
        1. Have a flag in database "hasLeft" that we toggle once they leave. On join, check if there is an existing role
        2. Remove row from database entirely (delete all of their content cascading)
    */
    // executeQuery('INSERT INTO users(userId, guildId, username) VALUES ?', [user.id, guild.id, user.username], (result) => {
    //     console.log(result);
    // })
    checkUserExists(member, () => {
        executeQuery('INSERT INTO guildActivity(userId, guildId, type, dateTime) VALUES ?', [member.user.id, member.guild.id, SERVER_STATUS.LEFT, new Date()], (result) => {
            if (callback) callback(result);
        });
    });
}

export function userNicknameChange(member, callback) {
    checkGuildExists(member.guild, () => {
        checkUserExists(member, () => {
            updateQuery('UPDATE users SET nickname = ? WHERE userId = ? AND guildId = ?', [ member.nickname, member.user.id, member.guild.id])
            if (callback) callback();
        })
    });
}

export function checkUserExists(member, callback) {
    fetchQuery('SELECT * FROM users WHERE userId = ? AND guildId = ?', [ member.user.id, member.guild.id ], (result) => {
        if (result.length == 0) {
            userJoinedInitial(member, callback);
        } else {
            if (callback) callback();
        }
    });
}


export function fetchDiscordUserData(userId, guildId, callback) {
    const guild = bot.guilds.resolve(guildId);
    console.log("guild: ", guild);
    guild.members.fetch(userId)
    .then(member => {
        console.log(member);
        if (callback) callback(member);
    })
}