import { Client } from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';
import { HTTPError } from './util';

enum Protocol {
    'fcm',
    'apns',
    'web'
}

export class NewSubscription {
    token: string;
    protocol: Protocol;
    lang?: string;
    badge?: bigint;
    constructor(token: string, protocol: Protocol, lang?: string, badge?: bigint) {
        if (!token) {
            throwBadRequestError("'token' field required");
        }
        if (!(protocol in Protocol)) {
            throwBadRequestError(`protocol ${protocol} not recognized`);
        }
        this.token = token;
        this.protocol = protocol;
        this.lang = lang;
        this.badge = badge;
    };
}

export class Subscription {
    uuid: string;
    token?: string;
    lang?: string;
    badge?: bigint;
    constructor(uuid: string, token?: string, lang?: string, badge?: bigint) {
        this.uuid = uuid;
        this.token = token;
        this.lang = lang;
        this.badge = badge;
    }
}

export async function insert(dbClient: Client, subscription: NewSubscription): Promise<string> {
    const columns = [ 'uuid', 'provider_token', 'protocol', 'created', 'updated', 'lang', 'badge' ];
    const query = `INSERT INTO subscriptions (${columns.join(',')}) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const uuid = uuidv4();
    const now = Date.now();
    const params = [ uuid, subscription.token, subscription.protocol, now, now, subscription.lang,
        subscription.badge ];
    await dbClient.execute(query, params, { prepare: true });
    return uuid;
}

export async function update(dbClient: Client, subscription: Subscription): Promise<void> {
    let query = 'UPDATE subscriptions SET updated = ?';
    const params: any[] = [ Date.now() ];
    if (subscription.token) {
        query += ', token = ?';
        params.push(subscription.token);
    }
    if (subscription.lang) {
        query += ', lang = ?';
        params.push(subscription.lang);
    }
    if (subscription.badge) {
        query += ', badge = ?';
        params.push(subscription.badge);
    }
    query += ' WHERE uuid = ? IF EXISTS';
    params.push(subscription.uuid);
    await dbClient.execute(query, params, { prepare: true });
}

export async function remove(dbClient: Client, uuid: string): Promise<void> {
    const query = 'DELETE FROM subscriptions WHERE uuid = ?';
    await dbClient.execute(query, [ uuid ], { prepare: true });
}

function throwBadRequestError(detail: string): void {
    throw new HTTPError({
        status: 400,
        type: 'bad_request',
        title: 'Bad request',
        detail
    });
}
