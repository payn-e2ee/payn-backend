declare namespace Express {
    export interface Request {
        authSession?: AuthSession;
    }
}