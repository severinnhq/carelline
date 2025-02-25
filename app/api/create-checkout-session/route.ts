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
    // Log the request headers to check for content type issues
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    let cartItems: CartItem[];
    try {
      // Get the request body text first for debugging
      const bodyText = await request.text();
      console.log('Raw request body:', bodyText);
      
      // Try to parse it as JSON
      if (!bodyText || bodyText.trim() === '') {
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
      
      cartItems = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    console.log('Received cart items:', JSON.stringify(cartItems, null, 2));

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.error('Invalid cart items:', cartItems);
      return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 });
    }

    // Define Stripe's minimum amount for HUF
    const MIN_AMOUNT_HUF = 175;
    
    // Track the total before shipping for validation
    let totalBeforeShipping = 0;

    // For HUF currency, ensure prices are whole numbers with no decimal places
    const lineItems = cartItems.map((item) => {
      // Calculate the price in HUF
      let priceInHUF;
      if (item.product.salePrice) {
        // If the price is already in HUF, just round it to whole number
        priceInHUF = Math.round(item.product.salePrice);
      } else {
        // If the price is already in HUF, just round it to whole number
        priceInHUF = Math.round(item.product.price);
      }
      
      // Ensure it's a non-zero positive integer (important for HUF)
      if (priceInHUF <= 0) {
        console.error(`Invalid price for product ${item.product._id}: ${priceInHUF}`);
        priceInHUF = 200; // Set a higher minimum price to prevent errors
      }
      
      const lineItemTotal = priceInHUF * item.quantity;
      totalBeforeShipping += lineItemTotal;
      
      console.log(`Product: ${item.product.name}, Price: ${priceInHUF} HUF, Quantity: ${item.quantity}, Line Total: ${lineItemTotal} HUF`);
      
      return {
        price_data: {
          currency: 'huf',
          product_data: {
            name: `${item.product.name} (${item.size})`,
            images: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/product-image?filename=${encodeURIComponent(item.product.mainImage)}`],
            metadata: {
              productId: item.product._id,
              size: item.size,
            },
          },
          unit_amount_decimal: (priceInHUF * 100).toString(), // Convert to smallest currency unit (fillér)
        },
        quantity: item.quantity,
      };
    });

    console.log('Line items:', JSON.stringify(lineItems, null, 2));
    console.log(`Total before shipping: ${totalBeforeShipping} HUF`);

    // Check if total is below Stripe's minimum for HUF
    if (totalBeforeShipping < MIN_AMOUNT_HUF) {
      console.error(`Total amount ${totalBeforeShipping} HUF is below Stripe's minimum of ${MIN_AMOUNT_HUF} HUF`);
      return NextResponse.json({ 
        error: `Order total must be at least ${MIN_AMOUNT_HUF} HUF to process payment` 
      }, { status: 400 });
    }

    // Create a compact version of cart items for metadata
    const compactCartItems = cartItems.map(item => ({
      id: item.product._id,
      n: item.product.name,
      s: item.size,
      q: item.quantity,
      p: item.product.salePrice || item.product.price
    }));

    // Convert to JSON and truncate if necessary
    let cartItemsSummary = JSON.stringify(compactCartItems);
    if (cartItemsSummary.length > 500) {
      cartItemsSummary = cartItemsSummary.substring(0, 497) + '...';
    }

    // Calculate total amount correctly in fillér (smallest HUF unit)
    const totalAmount = totalBeforeShipping;

    // Determine if standard shipping should be free
    const freeShippingThreshold = 38000; // HUF equivalent of 100 EUR
    const isStandardShippingFree = totalAmount >= freeShippingThreshold;

    // Define shipping costs
    const standardShippingCost = isStandardShippingFree ? 0 : 1900; // HUF equivalent of 5 EUR
    const expressShippingCost = 3800; // HUF equivalent of 10 EUR

    // Make sure even with free shipping, the total meets Stripe's minimum
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
          type: 'fixed_amount',
          fixed_amount: {
            amount: standardShippingCost * 100, // Convert to fillér
            currency: 'huf',
          },
          display_name: isStandardShippingFree ? 'Free Standard Shipping' : 'Standard Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 6,
            },
            maximum: {
              unit: 'business_day',
              value: 10,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: expressShippingCost * 100, // Convert to fillér
            currency: 'huf',
          },
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 3,
            },
            maximum: {
              unit: 'business_day',
              value: 5,
            },
          },
        },
      },
    ];

    console.log('Creating Stripe checkout session with HUF currency');
    
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'hu',
      currency: 'huf',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      shipping_address_collection: {
        allowed_countries: ['AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CV', 'CW', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MK', 'ML', 'MM', 'MN', 'MO', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SZ', 'TA', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW'],
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
    };
    
    console.log('Session parameters:', JSON.stringify(sessionParams, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionParams as Stripe.Checkout.SessionCreateParams);

    console.log('Stripe session created:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    console.error('Stripe session creation error:', err);
    if (err instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', err.message, err.type, err.raw);
      return NextResponse.json(
        { error: `Stripe error: ${err.message}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}