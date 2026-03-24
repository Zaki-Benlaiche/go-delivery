'use client';

import React from 'react';
import type { OrderStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';

interface Props {
  status: OrderStatus;
}

export default function StatusBadge({ status }: Props) {
  const color = STATUS_COLORS[status] || '#747d8c';
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className="status-badge"
      style={{ background: `${color}20`, color }}
    >
      {label}
    </span>
  );
}
