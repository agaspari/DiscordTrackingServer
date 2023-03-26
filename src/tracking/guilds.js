import { fetchQuery, executeQuery } from '../util/database';

export function guildAdded(guild, callback) {
    executeQuery('INSERT INTO guilds(guildId) VALUES ?', [guild.id], (result) => {
        if (callback) callback();
    });
}

export function checkGuildExists(guild, callback) {
    console.log("Guild: ", guild.id);
    fetchQuery('SELECT * FROM guilds WHERE guildId = ?', [ guild.id ], (result) => {
        if (result.length == 0) {
            guildAdded(guild, callback);
        } else {
            callback();
        }
    });
}

export function getGuildActivity(guildId, callback) {
    fetchQuery('SELECT MONTH(dateTime) as month, DAY(dateTime) AS day, type, COUNT(*) AS total FROM guildActivity WHERE guildActivity.guildId = ? GROUP BY type, DAY(dateTime), MONTH(dateTime) ORDER BY MONTH(dateTime) ASC, DAY(dateTime) ASC, type ASC;', [ guildId ], (result) => {
        if (callback) callback(result);
    });
}