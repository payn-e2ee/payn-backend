import { createPublicKey, KeyObject } from "crypto";

/**
 * Validate a Curve25519 public key in PEM format
 * Supports X25519 and Ed25519
 */
export function isValidCurve25519PemKey(pem: string): boolean {
    try {
        const key: KeyObject = createPublicKey(pem);

        // Must be a public key
        if (key.type !== "public") return false;

        // Check the curve type
        const allowed = ["x25519", "ed25519"];

        // Node exposes this via asymmetricKeyType
        // (string like 'x25519' or 'ed25519')
        // @ts-ignore (property exists at runtime)
        const keyType = key.asymmetricKeyType;
        if (!keyType) { return false; }

        if (!allowed.includes(keyType)) return false;

        return true;
    } catch {
        return false;
    }
}