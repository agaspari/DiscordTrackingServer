import { Router } from 'express';
import { getMessages, getMessageTrend, getUserMessageTrend, getTotalMessages } from '../tracking/messages';
import { authorize } from './authorization';

export default ({ config }) => {
    let api = Router();

    api.get('/', (req, res) => {
        const { guildId, authorizationCode } = req.query;

        authorize(guildId, authorizationCode)
        .then(() => {
            getMessages(req.query, (result) => {
                console.log("Result from api: ", result);
                res.send(result);
            });
        }).catch(() => {
            res.status(401);
            res.send(err);
        });
        
    });

    api.get('/trend/', (req, res) => {
        const { guildId, authorizationCode } = req.query;
        authorize(guildId, authorizationCode)
        .then(() => {
            getMessageTrend(guildId, (result) => {
                console.log("Result from api: ", result);
                res.send(result);
            });
        }).catch((err) => {
            res.status(401);
            res.send(err);
        });
    });

    api.get('/trend/:userId', (req, res) => {
        const { guildId, authorizationCode } = req.query;
        const userId = req.params.userId;

        authorize(guildId, authorizationCode)
        .then(() => {
            getUserMessageTrend(guildId, userId, (result) => {
                console.log("Result from api: ", result);
                res.send(result);
            });
        }).catch((err) => {
            res.status(401);
            res.send(err);
        });
    });

    api.get('/total/:guildId', (req, res) => {
        const { authorizationCode } = req.query;
        const guildId = req.params.guildId;

        authorize(guildId, authorizationCode)
        .then(() => {
            getTotalMessages(guildId, (result) => {
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