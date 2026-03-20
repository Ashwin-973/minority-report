import axios from "axios";

const BASE = "/api";

export const submitClaim = async (payload) => {
  const { data } = await axios.post(`${BASE}/claims`, payload);
  return data;
};

export const getClaimById = async (id) => {
  const { data } = await axios.get(`${BASE}/claims/${id}`);
  return data;
};