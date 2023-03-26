import { Router } from 'express';
import users from './users';
import voiceactivity from './voiceactivity';
import messages from './messages';
import guilds from './guilds';
import authorization from './authorization';

export default ({ config }) => {
    let api = Router();

    api.get('', (req, res) => {});

    api.use('/users', users({ config }));
    api.use('/voiceactivity', voiceactivity({ config }));
    api.use('/messages', messages({ config }));
    api.use('/guilds', guilds({ config }));
    api.use('/authorization', authorization({ config }));

    return api;
}