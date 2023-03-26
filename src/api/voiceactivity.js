import { Router } from 'express';
import { getUserActivity } from '../tracking/voiceactivity';
import { authorize } from './authorization';

export default ({ config }) => {
    let api = Router();

    api.get('/', (req, res) => {
        const { guildId, authorizationCode } = req.query;

        authorize(guildId, authorizationCode)
        .then(() => {
            getUserActivity(req.query, (result) => {
                console.log("Result from api: ", result);
                res.send(result);
            });
        }).catch((err) => {
            res.status(401);
            res.send(err);
        });        
    });

    return api;
}