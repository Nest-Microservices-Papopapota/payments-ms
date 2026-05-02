
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    STRIPE_SECRET_KEY: string;
    STRIPE_SUCCESS_URL: string;
    STRIPE_CANCEL_URL: string;
    STRIPE_ENDPOINT_SECRET: string;
    NATS_SERVERS: string[];

}

const envsSchema: joi.ObjectSchema<EnvVars> = joi.object({
    PORT: joi.number().required(),
    STRIPE_SECRET_KEY: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
    STRIPE_ENDPOINT_SECRET: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),

})
    .unknown(true);

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
})

if (error) {
    throw new Error(`Environment variables validation error: ${error.message}`);
};

const envsVars: EnvVars = value;

export const envs = {
    PORT: envsVars.PORT,
    STRIPE_SECRET_KEY: envsVars.STRIPE_SECRET_KEY,
    STRIPE_SUCCESS_URL: envsVars.STRIPE_SUCCESS_URL,
    STRIPE_CANCEL_URL: envsVars.STRIPE_CANCEL_URL,
    STRIPE_ENDPOINT_SECRET: envsVars.STRIPE_ENDPOINT_SECRET,
    NATS_SERVERS: envsVars.NATS_SERVERS,
}