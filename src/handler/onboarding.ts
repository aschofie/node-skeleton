import {IncomingMessage, ServerResponse} from "node:http";
import {randomUUID} from "node:crypto";
import {HttpMethod, HttpStatus} from "../routes/router-definitions.ts";
import {logger} from "../logging/logger.ts";
import {z} from "zod";
import {validateRequest} from "../util/validation.ts";

const __filename: string = import.meta.url;

const customerSchema = z.object({
    firstName: z.string().max(25),
    lastName: z.string().max(25),
    email: z.string().email()
});

export async function onboarding(
    req: IncomingMessage,
    res: ServerResponse
): Promise<boolean> {
    const request = new Response(req as unknown as ReadableStream);
    const payload = await request.text();
    const customer =
        await validateRequest(payload, customerSchema);
    if (!customer.success) {
        res.statusCode = HttpStatus.BadRequest;
        logger.warn({error: customer.error, payload});
        res.statusCode = HttpStatus.BadRequest;
        res.end('Bad Request\n');
    } else {
        const hasCorrelationId = "x-correlation-id" in req.headers
        const correlationId = hasCorrelationId
            ? req.headers["x-correlation-id"] as string
            : randomUUID();
        const forwardData = !hasCorrelationId
            ? {correlationId, ...customer.data}
            : customer.data;
        logger.info({forwarding: forwardData});
        const responseStatus =
            await onboardingForward(forwardData);
        if (responseStatus.status != HttpStatus.Ok) {
            res.statusCode = HttpStatus.InternalError;
        } else {
            res.statusCode = HttpStatus.Ok;
        }
        res.end(`${responseStatus.statusText}\n`);
    }
    return true;
}

async function onboardingForward(
    forwardData: object
): Promise<{ status: number; statusText: string }> {
    const forwardUrl = process.env.FORWARD_URL as string;
    const forwardUrlTimeoutMs =
        parseInt(process.env.FORWARD_TIMEOUT_MS as string);
    try {
        const response = await fetch(forwardUrl, {
            method: HttpMethod.Post,
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(forwardData),
            signal: AbortSignal.timeout(forwardUrlTimeoutMs)
        });
        if (response.ok) {
            logger.info({
                message: "Forward successful",
                status: response.status,
                payload: forwardData
            });
            return {
                status: response.status,
                statusText: response.statusText
            };
        }
        logger.warn({
            message: "Forward failed with HTTP error",
            status: response.status,
            statusText: response.statusText,
            payload: forwardData
        });
        return {
            status: response.status,
            statusText: response.statusText
        };
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({
            message: "Forward request failed",
            error: error.message,
            payload: forwardData
        });
        if (error.name === "AbortError") {
            return {
                status: HttpStatus.GatewayTimeout,
                statusText: "Gateway Timeout"
            };
        }
        return {
            status: HttpStatus.BadGateway,
            statusText: "Bad Gateway"
        };
    }
}
