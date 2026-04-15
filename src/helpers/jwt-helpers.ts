import jwt, { type JwtPayload } from "jsonwebtoken";

export function verifyToken(accessToken: string): jwt.JwtPayload | null {
    try {
        return jwt.verify(
            accessToken,
            process.env.JWT_SECRET as string,
            { algorithms: ["HS256"] }
        ) as JwtPayload;
    } catch (err) {
        console.error("verifyToken:", err);
        return null;
    }
};

export function generateToken(payload: any): string {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { algorithm: "HS256" }
    );
}