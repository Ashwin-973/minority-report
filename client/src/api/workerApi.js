import axios from "axios";

const BASE = "/api/workers";

export const registerWorker = async (data) => {
    const { data: res } = await axios.post(`${BASE}/register`, data);
    return res;
};

export const listWorkers = async () => {
    const { data } = await axios.get(BASE);
    return data;
};

export const getWorker = async (id) => {
    const { data } = await axios.get(`${BASE}/${id}`);
    return data;
};

export const getWorkerDashboard = async (id) => {
    const { data } = await axios.get(`${BASE}/${id}/dashboard`);
    return data;
};
