import axios from "axios";

const BASE = "/api/policies";

export const createPolicy = async (workerId) => {
    const { data } = await axios.post(BASE, { workerId });
    return data;
};

export const listPolicies = async () => {
    const { data } = await axios.get(BASE);
    return data;
};

export const getWorkerPolicies = async (workerId) => {
    const { data } = await axios.get(`${BASE}/worker/${workerId}`);
    return data;
};

export const renewPolicy = async (policyId) => {
    const { data } = await axios.post(`${BASE}/${policyId}/renew`);
    return data;
};

export const calculatePremium = async (params) => {
    const { data } = await axios.post("/api/premiums/calculate", params);
    return data;
};

export const simulateTrigger = async (zoneId, triggerType) => {
    const { data } = await axios.post("/api/triggers/simulate", { zoneId, triggerType });
    return data;
};

export const fetchTriggers = async () => {
    const { data } = await axios.get("/api/triggers");
    return data;
};

export const fetchPayouts = async () => {
    const { data } = await axios.get("/api/payouts");
    return data;
};

export const fetchWorkerPayouts = async (workerId) => {
    const { data } = await axios.get(`/api/payouts/worker/${workerId}`);
    return data;
};
