// server/src/services/payoutService.js
// Payout processing — handles disbursement lifecycle

import { v4 as uuidv4 } from "uuid";
import { addPayout, updatePayout, getPayoutById } from "../data/payoutsStore.js";
import { updatePolicy } from "../data/policiesStore.js";

/**
 * Initiate a payout for an approved claim
 * @param {object} params - { claimId, policyId, workerId, workerName, amountINR, triggerType, triggerDescription }
 * @returns {object} payout record
 */
export const initiatePayout = async (params) => {
    const {
        claimId,
        policyId,
        workerId,
        workerName,
        amountINR,
        triggerType,
        triggerDescription,
    } = params;

    const payout = {
        id: `PAY_${uuidv4().slice(0, 8).toUpperCase()}`,
        claimId,
        policyId,
        workerId,
        workerName,
        amountINR,
        method: "UPI",
        status: "PENDING",
        triggerType,
        triggerDescription,
        initiatedAt: new Date().toISOString(),
        processedAt: null,
        completedAt: null,
        razorpayPayoutId: null,
        transactionRef: `TXN_${Date.now()}_${workerId}`,
    };

    addPayout(payout);

    // Auto-process after brief delay (simulates payment gateway processing)
    setTimeout(async () => {
        await processPayout(payout.id);
    }, 2000);

    return payout;
};

/**
 * Process a pending payout
 */
export const processPayout = async (payoutId) => {
    const payout = getPayoutById(payoutId);
    if (!payout || payout.status !== "PENDING") return null;

    // Mark as processing
    updatePayout(payoutId, {
        status: "PROCESSING",
        processedAt: new Date().toISOString(),
    });

    // Simulate payment gateway processing (1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000;

    return new Promise((resolve) => {
        setTimeout(() => {
            // Complete the payout (99% success rate for demo)
            const success = Math.random() > 0.01;

            const updates = success
                ? {
                    status: "COMPLETED",
                    completedAt: new Date().toISOString(),
                    razorpayPayoutId: `pout_${uuidv4().slice(0, 14)}`,
                }
                : {
                    status: "FAILED",
                    completedAt: new Date().toISOString(),
                };

            const updated = updatePayout(payoutId, updates);

            // Update policy total payouts if successful
            if (success && updated?.policyId) {
                const policy = updatePolicy(updated.policyId, {});
                if (policy) {
                    updatePolicy(updated.policyId, {
                        totalPayoutsINR: (policy.totalPayoutsINR || 0) + updated.amountINR,
                        claimsCount: (policy.claimsCount || 0) + 1,
                    });
                }
            }

            resolve(updated);
        }, processingTime);
    });
};
