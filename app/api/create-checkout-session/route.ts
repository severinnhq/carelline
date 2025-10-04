import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Make sure your API key is correctly set in your environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// ✅ Updated CartItem interface with image
interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    mainImage: string;
  };
  size: string;
  quantity: number;
  image?: string; // added image for variant
}

interface RequestPayload {
  cartItems?: CartItem[];
  promoCode?: string;
}

const FIXED_AMOUNT = 'fixed_amount' as const;
const BUSINESS_DAY = 'business_day' as const;

export async function POST(request: NextRequest) {
  try {
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    // Parse the incoming request body
    let parsedBody: unknown;
    try {
      const bodyText = await request.text();
      console.log('Raw request body:', bodyText);
      parsedBody = JSON.parse(bodyText);
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Ensure that we have valid cart items
    let cartItems: CartItem[];
    let promoCode: string | undefined;

    if (Array.isArray(parsedBody)) {
      cartItems = parsedBody;
    } else {
      const { cartItems: items, promoCode: code } = parsedBody as RequestPayload;
      if (!items || !Array.isArray(items)) {
        console.error('Invalid request body:', parsedBody);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
      cartItems = items;
      promoCode = code;
    }

    console.log('Received cart items:', JSON.stringify(cartItems, null, 2));

    if (cartItems.length === 0) {
      console.error('Empty cart items');
      return NextResponse.json({ error: 'Cart items are empty' }, { status: 400 });
    }

    // Define Stripe's minimum amount for HUF
    const MIN_AMOUNT_HUF = 175;
    let totalBeforeShipping = 0;

    // ✅ Build line items from the cart items
    const lineItems = cartItems.map(item => {
      let priceInHUF = item.product.salePrice
        ? Math.round(item.product.salePrice)
        : Math.round(item.product.price);

      if (priceInHUF <= 0) {
        console.error(`Invalid price for product ${item.product._id}: ${priceInHUF}`);
        priceInHUF = 200; // Fallback minimum price
      }

      const lineItemTotal = priceInHUF * item.quantity;
      totalBeforeShipping += lineItemTotal;
      console.log(
        `Product: ${item.product.name}, Price: ${priceInHUF} HUF, Quantity: ${item.quantity}, Line Total: ${lineItemTotal} HUF`
      );

      // ✅ use variant image if available, fallback to mainImage
      const productImage = item.image || item.product.mainImage;

      return {
        price_data: {
          currency: 'huf',
          product_data: {
            name: `${item.product.name} (${item.size})`,
            images: [
              `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${encodeURIComponent(productImage)}`
            ],
            metadata: {
              productId: item.product._id,
              size: item.size,
            },
          },
          unit_amount_decimal: (priceInHUF * 100).toString(), // Convert to fillér
        },
        quantity: item.quantity,
      };
    });

    console.log('Line items:', JSON.stringify(lineItems, null, 2));
    console.log(`Total before shipping: ${totalBeforeShipping} HUF`);

    if (totalBeforeShipping < MIN_AMOUNT_HUF) {
      console.error(`Total amount ${totalBeforeShipping} HUF is below Stripe's minimum of ${MIN_AMOUNT_HUF} HUF`);
      return NextResponse.json(
        { error: `Order total must be at least ${MIN_AMOUNT_HUF} HUF to process payment` },
        { status: 400 }
      );
    }

    const compactCartItems = cartItems.map(item => ({
      id: item.product._id,
      n: item.product.name,
      s: item.size,
      q: item.quantity,
      p: item.product.salePrice || item.product.price,
    }));

    let cartItemsSummary = JSON.stringify(compactCartItems);
    if (cartItemsSummary.length > 500) {
      cartItemsSummary = cartItemsSummary.substring(0, 497) + '...';
    }

    const totalAmount = totalBeforeShipping;
    const freeShippingThreshold = 30000; // HUF threshold for free standard shipping
    const isStandardShippingFree = totalAmount >= freeShippingThreshold;
    const standardShippingCost = isStandardShippingFree ? 0 : 1990;
    const expressShippingCost = 3990;
    const minShippingTotal = totalAmount + standardShippingCost;

    if (minShippingTotal < MIN_AMOUNT_HUF) {
      console.error(`Total with standard shipping ${minShippingTotal} HUF is below Stripe's minimum`);
      return NextResponse.json(
        { error: `Order total including shipping must be at least ${MIN_AMOUNT_HUF} HUF to process payment` },
        { status: 400 }
      );
    }

    const shippingOptions = [
      {
        shipping_rate_data: {
          type: FIXED_AMOUNT,
          fixed_amount: {
            amount: standardShippingCost * 100, // Convert to fillér
            currency: 'huf',
          },
          display_name: isStandardShippingFree ? 'Free Standard Shipping' : 'Standard Shipping',
          delivery_estimate: {
            minimum: {
              unit: BUSINESS_DAY,
              value: 6,
            },
            maximum: {
              unit: BUSINESS_DAY,
              value: 10,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: FIXED_AMOUNT,
          fixed_amount: {
            amount: expressShippingCost * 100,
            currency: 'huf',
          },
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: {
              unit: BUSINESS_DAY,
              value: 3,
            },
            maximum: {
              unit: BUSINESS_DAY,
              value: 5,
            },
          },
        },
      },
    ];

    // Apply discount if promoCode is provided and equals "LM4500"
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (promoCode !== undefined && promoCode.toUpperCase() === 'LM4500') {
      discounts = [{ coupon: 'WnXzcbua' }];  // Use the coupon ID, not the name
      console.log('Promo code applied: LM4500 - discount of 4500 HUF');
    }

    console.log('Creating Stripe checkout session with HUF currency');

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'hu',
      currency: 'huf',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      shipping_address_collection: {
        allowed_countries: ['HU', 'DE', 'AT', 'RO', 'SK', 'CZ', 'PL', 'HR', 'SI', 'IT', 'FR', 'NL', 'BE', 'GB', 'IE', 'US'], // ✨ shorten list for sanity
      },
      billing_address_collection: 'required',
      shipping_options: shippingOptions,
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        cartItemsSummary: cartItemsSummary,
        freeStandardShipping: isStandardShippingFree.toString(),
      },
      custom_text: {
        shipping_address: {
          message: isStandardShippingFree
            ? 'Please provide your full shipping address. Standard shipping is FREE for your order!'
            : 'Please provide your full shipping address for accurate delivery.',
        },
        submit: {
          message: "We'll email you instructions to track your order.",
        },
      },
      allow_promotion_codes: true,
      ...(discounts ? { discounts } : {}),
    };

    console.log('Session parameters:', JSON.stringify(sessionParams, null, 2));

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Stripe session created:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    console.error('Stripe session creation error:', err);
    if (err instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', err.message, err.type, err.raw);
      return NextResponse.json({ error: `Stripe error: ${err.message}` }, { status: 400 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : 'An unknown error occurred' }, { status: 500 });
  }
}
