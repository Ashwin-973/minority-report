// shared/types/PayoutModel.js
// Payout schema for instant disbursements

export const PAYOUT_STATUS = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
};

export const PAYOUT_METHODS = {
    UPI: "UPI",
    BANK_TRANSFER: "BANK_TRANSFER",
    WALLET: "WALLET",
};

export const createPayoutModel = (overrides = {}) => ({
    id: null,
    claimId: null,
    policyId: null,
    workerId: null,
    workerName: "",

    amountINR: 0,
    method: PAYOUT_METHODS.UPI,
    status: PAYOUT_STATUS.PENDING,

    // Trigger context
    triggerType: null,
    triggerDescription: "",

    // Timestamps
    initiatedAt: new Date().toISOString(),
    processedAt: null,
    completedAt: null,

    // Payment gateway reference
    razorpayPayoutId: null,
    transactionRef: null,

    ...overrides,
});
