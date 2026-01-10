import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { Transaction, TransactionSchema } from './schema/transaction.schema';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';
import { StripeService } from './service/stripe.service';
import { PaystackService } from './service/paystack.service';
import { CreditPlanSchema } from './schema/credit-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
      {
        name: 'CreditPlan',
        schema: CreditPlanSchema,
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeService, PaystackService],
  exports: [PaymentService],
})
export class PaymentModule {}
