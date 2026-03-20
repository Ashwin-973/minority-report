// server/src/data/payoutsStore.js
// In-memory payout store

const payouts = [];

export const getAllPayouts = () => [...payouts];
export const getPayoutById = (id) => payouts.find((p) => p.id === id) || null;
export const getPayoutsByWorker = (workerId) => payouts.filter((p) => p.workerId === workerId);
export const getPayoutsByClaim = (claimId) => payouts.filter((p) => p.claimId === claimId);

export const addPayout = (payout) => {
    payouts.push(payout);
    return payout;
};

export const updatePayout = (id, updates) => {
    const idx = payouts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    payouts[idx] = { ...payouts[idx], ...updates };
    return payouts[idx];
};

export const getPendingPayouts = () => payouts.filter((p) => p.status === "PENDING");
export const getCompletedPayouts = () => payouts.filter((p) => p.status === "COMPLETED");

export const getTotalPayoutsINR = () =>
    payouts.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amountINR, 0);
