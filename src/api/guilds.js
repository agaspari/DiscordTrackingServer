import { Router } from 'express';
import { getGuildActivity } from '../tracking/guilds';
import { authorize } from './authorization';

export default ({ config }) => {
    let api = Router();

    api.get('/', (req, res) => {
        const { guildId, authorizationCode } = req.query;

        authorize(guildId, authorizationCode)
        .then(() => {
            getGuildActivity(guildId, (result) => {
                console.log("Result from api: ", result);
                res.send(result);
            });
        })
        .catch((err) => {
            res.status(401);
            res.send(err);
        });
        
    });

    return api;
}