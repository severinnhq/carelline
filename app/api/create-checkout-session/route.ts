import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Make sure your API key is correctly set in your environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

interface CartItem {
  product: {
    _id: string
    name: string
    price: number
    salePrice?: number
    mainImage: string
  }
  size: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Parse the incoming request
    let parsedBody: any;
    try {
      const bodyText = await request.text();
      console.log('Raw request body:', bodyText);
      parsedBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    // Accept both an array (for backwards compatibility) or an object with cartItems and promoCode
    let cartItems: CartItem[] = [];
    let promoCode: string | undefined;
    if (Array.isArray(parsedBody)) {
      cartItems = parsedBody;
    } else if (parsedBody.cartItems && Array.isArray(parsedBody.cartItems)) {
      cartItems = parsedBody.cartItems;
      promoCode = parsedBody.promoCode;
    } else {
      console.error('Invalid request body:', parsedBody);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    console.log('Received cart items:', JSON.stringify(cartItems, null, 2));

    if (cartItems.length === 0) {
      console.error('Empty cart items');
      return NextResponse.json({ error: 'Cart items are empty' }, { status: 400 });
    }

    // Define Stripe's minimum amount for HUF
    const MIN_AMOUNT_HUF = 175;
    
    // Track the total before shipping for validation
    let totalBeforeShipping = 0;

    // Build line items from the cart items
    const lineItems = cartItems.map((item) => {
      let priceInHUF = item.product.salePrice
        ? Math.round(item.product.salePrice)
        : Math.round(item.product.price);
      
      // Ensure a valid price
      if (priceInHUF <= 0) {
        console.error(`Invalid price for product ${item.product._id}: ${priceInHUF}`);
        priceInHUF = 200; // Fallback minimum price
      }
      
      const lineItemTotal = priceInHUF * item.quantity;
      totalBeforeShipping += lineItemTotal;
      
      console.log(
        `Product: ${item.product.name}, Price: ${priceInHUF} HUF, Quantity: ${item.quantity}, Line Total: ${lineItemTotal} HUF`
      );
      
      return {
        price_data: {
          currency: 'huf',
          product_data: {
            name: `${item.product.name} (${item.size})`,
            images: [
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/product-image?filename=${encodeURIComponent(item.product.mainImage)}`
            ],
            metadata: {
              productId: item.product._id,
              size: item.size,
            },
          },
          // Convert to fillér (smallest HUF unit)
          unit_amount_decimal: (priceInHUF * 100).toString(),
        },
        quantity: item.quantity,
      };
    });

    console.log('Line items:', JSON.stringify(lineItems, null, 2));
    console.log(`Total before shipping: ${totalBeforeShipping} HUF`);

    // Validate against Stripe's minimum amount requirement
    if (totalBeforeShipping < MIN_AMOUNT_HUF) {
      console.error(`Total amount ${totalBeforeShipping} HUF is below Stripe's minimum of ${MIN_AMOUNT_HUF} HUF`);
      return NextResponse.json({ 
        error: `Order total must be at least ${MIN_AMOUNT_HUF} HUF to process payment` 
      }, { status: 400 });
    }

    // Prepare a compact version of the cart items for metadata
    const compactCartItems = cartItems.map(item => ({
      id: item.product._id,
      n: item.product.name,
      s: item.size,
      q: item.quantity,
      p: item.product.salePrice || item.product.price
    }));

    let cartItemsSummary = JSON.stringify(compactCartItems);
    if (cartItemsSummary.length > 500) {
      cartItemsSummary = cartItemsSummary.substring(0, 497) + '...';
    }

    // Calculate the total amount (still in HUF)
    const totalAmount = totalBeforeShipping;

    // Determine shipping costs
    const freeShippingThreshold = 30000; // HUF threshold for free standard shipping
    const isStandardShippingFree = totalAmount >= freeShippingThreshold;
    const standardShippingCost = isStandardShippingFree ? 0 : 1490; // HUF cost for standard shipping
    const expressShippingCost = 2990; // HUF cost for express shipping

    // Validate that total with shipping meets the minimum amount
    const minShippingTotal = totalAmount + standardShippingCost;
    if (minShippingTotal < MIN_AMOUNT_HUF) {
      console.error(`Total with standard shipping ${minShippingTotal} HUF is below Stripe's minimum`);
      return NextResponse.json({ 
        error: `Order total including shipping must be at least ${MIN_AMOUNT_HUF} HUF to process payment` 
      }, { status: 400 });
    }

    const shippingOptions = [
      {
        shipping_rate_data: {
          type: 'fixed_amount' as 'fixed_amount',
          fixed_amount: {
            amount: standardShippingCost * 100, // Convert to fillér
            currency: 'huf',
          },
          display_name: isStandardShippingFree ? 'Free Standard Shipping' : 'Standard Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day' as 'business_day',
              value: 6,
            },
            maximum: {
              unit: 'business_day' as 'business_day',
              value: 10,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount' as 'fixed_amount',
          fixed_amount: {
            amount: expressShippingCost * 100, // Convert to fillér
            currency: 'huf',
          },
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day' as 'business_day',
              value: 3,
            },
            maximum: {
              unit: 'business_day' as 'business_day',
              value: 5,
            },
          },
        },
      },
    ];
    

    // Apply promo code discount if provided
    let discounts;
    if (promoCode && promoCode.toUpperCase() === 'LM4500') {
      // This assumes you have created a Stripe coupon with ID "LM4500" that deducts 4500 HUF
      discounts = [{ coupon: 'LM4500' }];
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
        allowed_countries: [
          'AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AT', 'AU',
          'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL',
          'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CD',
          'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CV', 'CW', 'CY',
          'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES',
          'ET', 'FI', 'FJ', 'FK', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH',
          'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK',
          'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IS', 'IT',
          'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KR', 'KW', 'KY',
          'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA',
          'MC', 'MD', 'ME', 'MF', 'MG', 'MK', 'ML', 'MM', 'MN', 'MO', 'MQ', 'MR', 'MS',
          'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NG', 'NI', 'NL',
          'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL',
          'PM', 'PN', 'PR', 'PS', 'PT', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA',
          'SB', 'SC', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR',
          'SS', 'ST', 'SV', 'SX', 'SZ', 'TA', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK',
          'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY',
          'UZ', 'VA', 'VC', 'VE', 'VG', 'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
        ]
      },
      billing_address_collection: 'required',
      shipping_options: shippingOptions,
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
          message: 'We\'ll email you instructions to track your order.',
        },
      },
      // This enables the promo code input on the Checkout page.
      allow_promotion_codes: true,
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
