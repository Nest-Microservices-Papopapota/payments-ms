
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    STRIPE_SECRET_KEY: string;

}

const envsSchema: joi.ObjectSchema<EnvVars> = joi.object({
    PORT: joi.number().required(),
    STRIPE_SECRET_KEY: joi.string().required(),
})
    .unknown(true);

const { error, value } = envsSchema.validate(process.env)

if (error) {
    throw new Error(`Environment variables validation error: ${error.message}`);
};

const envsVars: EnvVars = value;

export const envs = {
    PORT: envsVars.PORT,
    STRIPE_SECRET_KEY: envsVars.STRIPE_SECRET_KEY,
}