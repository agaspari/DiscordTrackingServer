import { Router } from 'express';
import { fetchUsers, fetchDiscordUserData } from '../tracking/users';
import timeago from 'epoch-timeago';

export default ({ config }) => {
    let api = Router();

    api.get('/', (req, res) => {
        const guildId = req.query.guildId;

        fetchUsers(guildId, (result) => {
            res.send(result);
        });
    });

    api.get('/:userId', (req, res) => {
        const guildId = req.query.guildId;
        const userId = req.params.userId;

        fetchDiscordUserData(userId, guildId, (member) => {
            const userData = member.user;
            userData.age = timeago(userData.createdTimestamp);
            userData.nickname = member.nickname;
            res.send(userData);
        });
    });

    return api;
}