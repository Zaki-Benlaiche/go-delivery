const { z } = require('zod');

// Generic body validator. On failure responds 400 with a flat field map so
// the client can render per-field errors without parsing zod's deep tree.
const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);
  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.error.flatten().fieldErrors,
    });
  }
  req[target] = result.data;
  next();
};

const schemas = {
  register: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email().max(120),
    password: z.string().min(6).max(128),
    role: z.enum(['client', 'restaurant', 'driver', 'place', 'superette', 'boucherie']).optional(),
    phone: z.string().trim().max(20).optional(),
    restaurantType: z.enum(['restaurant', 'superette', 'boucherie']).optional(),
    // Honeypot — bots auto-fill this; humans never see it.
    website: z.string().max(0).optional().or(z.literal('')),
  }),

  login: z.object({
    email: z.string().trim().toLowerCase().email().max(120),
    password: z.string().min(1).max(128),
  }),

  createOrder: z.object({
    restaurantId: z.coerce.number().int().positive(),
    items: z
      .array(
        z.object({
          productId: z.coerce.number().int().positive(),
          quantity: z.coerce.number().int().min(1).max(99),
        })
      )
      .max(50)
      .optional(),
    deliveryAddress: z.string().max(300).optional(),
    shoppingList: z.string().max(2000).optional(),
  }),

  updateOrderStatus: z.object({
    status: z.enum([
      'pending', 'accepted', 'preparing', 'ready',
      'out_for_delivery', 'delivered', 'cancelled',
    ]),
    deliveryFee: z.coerce.number().min(0).max(100000).optional(),
    total: z.coerce.number().min(0).max(10000000).optional(),
  }),

  createReservation: z.object({
    placeId: z.coerce.number().int().positive(),
  }),

  reservationStatus: z.object({
    status: z.enum(['waiting', 'called', 'done', 'cancelled']),
  }),

  reservationInfo: z.object({
    queueNumber: z.coerce.number().int().min(0).optional(),
    peopleBefore: z.coerce.number().int().min(0).optional(),
    estimatedWaitMinutes: z.coerce.number().int().min(0).max(1440).optional(),
  }),

  placeUpdate: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    address: z.string().trim().max(200).optional(),
    description: z.string().trim().max(500).optional(),
    type: z.enum(['doctor', 'clinic', 'government', 'other']).optional(),
    icon: z.string().trim().max(8).optional(),
  }),

  restaurantUpdate: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    address: z.string().trim().max(200).optional(),
    image: z.string().max(500).optional(),
    isOpen: z.boolean().optional(),
    type: z.enum(['restaurant', 'superette', 'boucherie']).optional(),
  }),

  product: z.object({
    name: z.string().trim().min(1).max(120),
    price: z.coerce.number().min(0).max(1000000),
    category: z.string().trim().max(60).optional(),
    image: z.string().max(500).optional(),
    isAvailable: z.boolean().optional(),
  }),

  productUpdate: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    price: z.coerce.number().min(0).max(1000000).optional(),
    category: z.string().trim().max(60).optional(),
    image: z.string().max(500).optional(),
    isAvailable: z.boolean().optional(),
  }),

  // Admin: change a user's role (cannot demote self — controller enforces that).
  adminRole: z.object({
    role: z.enum(['client', 'restaurant', 'driver', 'admin', 'place', 'superette', 'boucherie']),
  }),
};

module.exports = { validate, schemas };
