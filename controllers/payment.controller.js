import Stripe from "stripe";
import User from "../models/user.model.js";

const plans = {
  premium: { name: "Premium", amount: 1900 },
  elite: { name: "Elite", amount: 4900 },
};

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!plans[plan]) return res.status(400).json({ success: false, message: "Invalid plan" });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `MatchNest ${plans[plan].name} Plan` },
            unit_amount: plans[plan].amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL || "https://m-nest.netlify.app"}/payment/success?plan=${plan}`,
      cancel_url: `${process.env.CLIENT_URL || "https://m-nest.netlify.app"}/payment/cancel`,
      metadata: { userId: req.user._id.toString(), plan },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!plans[plan]) return res.status(400).json({ success: false, message: "Invalid plan" });
    await User.findByIdAndUpdate(req.user._id, { membershipPlan: plan });
    res.json({ success: true, message: `${plans[plan].name} plan activated!` });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const stripe = getStripe();
    const startDate = Math.floor(new Date("2026-04-01").getTime() / 1000);
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: startDate },
    });
    const payments = sessions.data.map((s) => ({
      id: s.id,
      amount: s.amount_total / 100,
      currency: s.currency.toUpperCase(),
      status: s.payment_status,
      plan: s.metadata?.plan || "—",
      email: s.customer_details?.email || "—",
      date: new Date(s.created * 1000).toLocaleDateString(),
    }));
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};
