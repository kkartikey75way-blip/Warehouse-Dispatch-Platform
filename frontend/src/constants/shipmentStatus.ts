export const ShipmentStatus = {
    RECEIVED: "RECEIVED",
    PACKED: "PACKED",
    DISPATCHED: "DISPATCHED",
    IN_TRANSIT: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    RETURNED: "RETURNED"
} as const;

export type ShipmentStatus = typeof ShipmentStatus[keyof typeof ShipmentStatus];
