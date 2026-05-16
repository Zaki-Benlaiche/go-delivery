'use client';

import React from 'react';
import ShopDashboard from './shop/ShopDashboard';

// Thin wrapper around the shared shop dashboard. Kept as its own file so the
// role-router in app/page.tsx can dynamic()-import it and split it into its
// own chunk — superette users never download the boucherie variant.
export default function SuperetteDashboard() {
  return <ShopDashboard kind="superette" />;
}
