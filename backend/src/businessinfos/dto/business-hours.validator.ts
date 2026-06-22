import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsValidBusinessHours(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsValidBusinessHours",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== "object" || !value) return false;

                    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                    
                    return days.every(day => {
                        if (!value[day] || typeof value[day] !== "object") return false;
                        
                        const { from, to, enabled } = value[day];
                        
                        if (typeof from !== "string" || typeof to !== "string" || typeof enabled !== "boolean") {
                            return false;
                        }

                        // Check if `from` and `to` are valid time strings (HH:mm format)
                        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                        if (!timeRegex.test(from) || !timeRegex.test(to)) {
                            return false;
                        }

                        return true;
                    });
                },
                defaultMessage(args: ValidationArguments) {
                    return "Invalid business hours format. Each day must have `from`, `to` as 'HH:mm' strings and `enabled` as boolean.";
                },
            },
        });
    };
}
