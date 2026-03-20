// server/src/controllers/adminController.js

import {
  getAllClaims,
  getFlaggedClaims,
  getRecentClaims,
} from "../data/claimsStore.js";
import { buildClusterGroups } from "../services/riskEngine/peerClusterDetector.js";
import { getAllZones } from "../data/weatherHistory.js";
import { CLAIM_STATUS } from "../../../shared/constants/riskThresholds.js";

/**
 * GET /api/admin/claims
 * Returns all claims with risk results — newest first
 */
export const listAllClaims = async (req, res) => {
  try {
    const claims = getAllClaims();
    return res.json({
      total: claims.length,
      flagged: claims.filter((c) => c.riskResult?.claimStatus === CLAIM_STATUS.FLAGGED).length,
      approved: claims.filter((c) => c.riskResult?.claimStatus === CLAIM_STATUS.APPROVED).length,
      manual: claims.filter((c) => c.riskResult?.claimStatus === CLAIM_STATUS.MANUAL_REVIEW).length,
      claims,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/admin/clusters
 * Returns active fraud cluster groups detected in recent claims
 */
export const getClusters = async (req, res) => {
  try {
    const recentClaims = getRecentClaims(120); // last 2 hours
    const clusters = buildClusterGroups(recentClaims);

    return res.json({
      clusterCount: clusters.length,
      totalClusteredClaims: clusters.reduce((s, c) => s + c.claimCount, 0),
      clusters,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/admin/analytics
 * Returns aggregated analytics for the Analytics page
 */
export const getAnalytics = async (req, res) => {
  try {
    const allClaims = getAllClaims();
    const recentClaims = getRecentClaims(60);
    const clusters = buildClusterGroups(getRecentClaims(120));
    const weatherZones = getAllZones();

    // Signal frequency breakdown
    const signalFrequency = {};
    allClaims.forEach((c) => {
      (c.riskResult?.fraudSignals || []).forEach((sig) => {
        signalFrequency[sig] = (signalFrequency[sig] || 0) + 1;
      });
    });

    // Risk score distribution buckets
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    allClaims.forEach((c) => {
      const s = c.riskResult?.riskScore || 0;
      if (s < 30) distribution.low++;
      else if (s < 60) distribution.medium++;
      else if (s < 80) distribution.high++;
      else distribution.critical++;
    });

    // Total liquidity at risk (sum of all flagged/review claims × mock payout ₹5000)
    const MOCK_PAYOUT = 5000;
    const riskyCount = allClaims.filter(
      (c) =>
        c.riskResult?.claimStatus === CLAIM_STATUS.FLAGGED ||
        c.riskResult?.claimStatus === CLAIM_STATUS.MANUAL_REVIEW
    ).length;

    const liquidityRiskINR = riskyCount * MOCK_PAYOUT;
    const savedLiquidityINR =
      allClaims.filter((c) => c.riskResult?.claimStatus === CLAIM_STATUS.FLAGGED).length *
      MOCK_PAYOUT;

    // Average risk score
    const avgRiskScore = allClaims.length
      ? Math.round(
          allClaims.reduce((s, c) => s + (c.riskResult?.riskScore || 0), 0) /
            allClaims.length
        )
      : 0;

    return res.json({
      summary: {
        totalClaims: allClaims.length,
        recentClaims: recentClaims.length,
        flaggedClaims: distribution.critical + distribution.high,
        clusterCount: clusters.length,
        avgRiskScore,
        liquidityRiskINR,
        savedLiquidityINR,
      },
      signalFrequency,
      riskDistribution: distribution,
      clusters,
      weatherZones,
      topRiskClaims: allClaims
        .sort((a, b) => (b.riskResult?.riskScore || 0) - (a.riskResult?.riskScore || 0))
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          workerName: c.workerName,
          riskScore: c.riskResult?.riskScore,
          claimStatus: c.riskResult?.claimStatus,
          fraudSignals: c.riskResult?.fraudSignals,
        })),
    });
  } catch (err) {
    console.error("getAnalytics error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};