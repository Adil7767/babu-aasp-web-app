import { NextResponse } from 'next/server';

const PLANS = [
  { id: 'STARTER', name: 'Starter', customer_limit: 200, monthly_price_pkr: 1000, description: 'Up to 200 customers', features: 'Basic billing, customer management' },
  { id: 'PROFESSIONAL', name: 'Professional', customer_limit: 1000, monthly_price_pkr: 2000, description: 'Up to 1,000 customers', features: 'Billing + complaints + analytics' },
  { id: 'ENTERPRISE', name: 'Enterprise', customer_limit: 0, monthly_price_pkr: 3000, description: 'Unlimited customers', features: 'Full system access + priority support' },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const includePaymentDetails = searchParams.get('payment_details') === 'true';
  if (includePaymentDetails) {
    return NextResponse.json({
      plans: PLANS,
      payment_instructions: {
        jazzcash: process.env.PLATFORM_JAZZCASH_NUMBER || '',
        easypaisa: process.env.PLATFORM_EAZYPAISA_NUMBER || '',
        bank: process.env.PLATFORM_BANK_DETAILS || '',
      },
    });
  }
  return NextResponse.json(PLANS);
}
