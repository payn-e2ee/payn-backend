import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
    console.error(err);
    res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
    return;
}