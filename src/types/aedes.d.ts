import "aedes";

declare module "aedes" {
    interface Client {
        authSession: AuthSession;
    }
}