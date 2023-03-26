import { Router } from 'express';
import { fetchQuery, executeQuery } from '../util/database';

export default ({ config }) => {
    let api = Router();

    api.get('/:guildId/:authorizationCode', (req, res) => {
        const guildId = req.params.guildId;
        const authorizationCode = req.params.authorizationCode;
        authorize(guildId, authorizationCode, req.connection.remoteAddress)
            .then((authRes) => {
                res.status(200);
                res.send(authRes);
            })
            .catch((err) => {
                res.status(401);
                res.send(err);
            })
    });

    return api;
}

export function authorize(guildId, authorizationCode, ip) {
    return new Promise((resolve, reject) => {
        fetchQuery('SELECT * FROM authorization WHERE guildId = ? AND authorizationCode = BINARY ? LIMIT 1', [guildId, authorizationCode], (result) => {
            if (result.length > 0) {
                if (ip) {
                    console.log("EXECUTING QUERY");
                    executeQuery('INSERT INTO authorizationLogs VALUES ?', [ authorizationCode, new Date(), ip || ""], (result) => {});
                }

                resolve(result[0]);
            } else {
                console.log("Rejecting")
                reject("Invalid Authorization");
            }
        });
    })
    
}