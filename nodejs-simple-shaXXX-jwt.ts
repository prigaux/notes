# require nodejs >= 14.18 for "base64url" encoding

export type jwt_conf = { alg: 'HS256', secret: string, with_iat?: true }
const compute_signature = (conf: jwt_conf, header: string, payload: string) => (
    createHmac("sha256", conf.secret).update(header + "." + payload).digest("base64url")
)
export const to_jwt = (conf: jwt_conf, data: Record<string, string|number>) => {
    const to_base64url = (data: Record<string, string|number>) => (
        Buffer.from(JSON.stringify(data)).toString("base64url")
    )
    const header = to_base64url({ alg: conf.alg, typ: "JWT" });
    const payload = to_base64url(conf.with_iat ? { ...data, iat: Math.round(Date.now() / 1000) } : data);
    return header + "." + payload + "." + compute_signature(conf, header, payload);
}

export const from_jwt = (conf: jwt_conf, jwt: string) => {
    const [header, payload, signature] = jwt.split('.')
    if (compute_signature(conf, header, payload) !== signature) return
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
}
