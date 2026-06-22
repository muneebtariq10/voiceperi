import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflactor: Reflector){
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflactor.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        console.log(`Route: ${context.getHandler().name}, isPublic: ${isPublic}`);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }
}