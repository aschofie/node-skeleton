import {IncomingMessage} from "node:http";
import {z} from "zod";

type ValidationResult<T> =
    { success: true; data: T }
    | { success: false; error: object };

export async function validateRequest<T extends z.ZodTypeAny>(
    payload: string,
    schema: T
): Promise<ValidationResult<z.infer<T>>> {
    try {
        const parsedObject = JSON.parse(payload);
        const parseResult =
            schema.safeParse(parsedObject);
        if (parseResult.success) {
            return {
                success: true,
                data: parseResult.data as z.infer<T>
            };
        } else {
            return {success: false, error: parseResult.error};
        }
    } catch {
        return {
            success: false,
            error: {message: "Malformed JSON",}
        };
    }
}