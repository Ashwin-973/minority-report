import axios from "axios";

const BASE = "/api/admin";

export const fetchAllClaims = async () => {
  const { data } = await axios.get(`${BASE}/claims`);
  return data;
};

export const fetchClusters = async () => {
  const { data } = await axios.get(`${BASE}/clusters`);
  return data;
};

export const fetchAnalytics = async () => {
  const { data } = await axios.get(`${BASE}/analytics`);
  return data;
};