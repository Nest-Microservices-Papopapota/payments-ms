import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
@Injectable()
export class PaymentService {

    private readonly stripe = new Stripe(
        envs.STRIPE_SECRET_KEY,
    );
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy
    ) { }

    async createSession(paymentSessionDto: PaymentSessionDto) {
        const { currency, items, orderId } = paymentSessionDto;
        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100),//20 dolares = 2000/100 = 20.00
                },
                quantity: item.quantity,
            }
        });

        const session = await this.stripe.checkout.sessions.create({
            // colocar aquí el Id de mi orden
            payment_intent_data: {
                metadata: {
                    orderId: orderId
                }
            },
            line_items: [
                ...lineItems
            ],
            mode: 'payment',
            success_url: envs.STRIPE_SUCCESS_URL,
            cancel_url: envs.STRIPE_CANCEL_URL,
        });
        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url,
        }
        // return session;
    }

    async stripeWebhook(
        req: Request, res: Response
    ) {
        const signature = req.headers['stripe-signature'];
        let event: any;
        //Testing // CLI stripe listen --forward-to localhost:3003/api/v1/payments/webhook
        //const endpointSecret = "whsec_2d224ed97798661b39182ae66073b114f005a5524ecd45c917238948852aa367";//envs.STRIPE_SECRET_KEY;
        const endpointSecret = envs.STRIPE_ENDPOINT_SECRET;
        try {
            event = this.stripe.webhooks.constructEvent(
                req['rawBody'],
                signature || '',
                endpointSecret
            );
        } catch (err: any) {
            // console.log(`Webhook Error: ${err.message}`);
            res.status(400).send({ error: `Webhook Error: ${err.message}` });
        }
        // console.log(event);
        switch (event.type) {
            case 'charge.succeeded':
                const charge = event.data.object;
                const payload = {
                    stripePaymentId: charge.id,
                    orderId: charge.metadata.orderId,
                    receiptUrl: charge.receipt_url,
                }
                // this.logger.log({ payload })
                this.client.emit('payment.succeeded', payload);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.status(200).json({ signature });
    }
}
