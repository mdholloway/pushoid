import * as lib from '../lib/subscriptions';
import * as util from '../lib/util';

const router = util.router();
let app;

router.post('/add', (req, res) => {
    const body = req.body;
    const subscription = new lib.NewSubscription(body.token, body.protocol, body.lang, body.badge);
    return lib.insert(app.dbClient, subscription).then(uuid => res.json({ uuid }))
});

router.post('/{uuid}', (req, res) => {
    const body = req.body;
    const subscription = new lib.Subscription(req.params.uuid, body.token, body.lang, body.badge);
    return lib.update(app.dbClient, subscription).then(() => res.send());
});

router.delete('/{uuid}', (req, res) => {
    return lib.remove(app.dbClient, req.params.uuid).then(() => res.end())
});

module.exports = (appObj) => {
    app = appObj;
    return {
        path: '/subscriptions',
        skip_domain: true,
        router
    };
};
