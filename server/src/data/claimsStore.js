// server/src/data/claimsStore.js
// In-memory store — simulates DB for hackathon

const claims = [];

export const getAllClaims = () => [...claims];

export const getClaimById = (id) => claims.find((c) => c.id === id) || null;

export const addClaim = (claim) => {
  claims.unshift(claim); // newest first
  return claim;
};

export const updateClaim = (id, updates) => {
  const idx = claims.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  claims[idx] = { ...claims[idx], ...updates };
  return claims[idx];
};

export const getFlaggedClaims = () =>
  claims.filter((c) => c.riskResult?.claimStatus !== "APPROVED");

export const getClaimsByWorker = (workerId) =>
  claims.filter((c) => c.workerId === workerId);

export const getRecentClaims = (limitMinutes = 60) => {
  const cutoff = Date.now() - limitMinutes * 60 * 1000;
  return claims.filter((c) => new Date(c.submittedAt).getTime() > cutoff);
};

export const clearClaims = () => {
  claims.length = 0;
};

// Seed with some initial demo claims on import
import { seedDemoClaims } from "./seedClaims.js";
seedDemoClaims(claims);