import {HttpMethod, type Routes} from "./router-definitions.ts";
import {onboarding} from "../handler/onboarding.ts";

export const defaultRoutes: Routes = {
    onboarding: {
        pattern: new URLPattern({pathname: '/onboarding'}),
        handler: onboarding,
        method: HttpMethod.Post
    }
}
