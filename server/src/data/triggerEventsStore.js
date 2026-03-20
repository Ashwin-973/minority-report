// server/src/data/triggerEventsStore.js
// In-memory store for detected parametric trigger events

const triggerEvents = [];

export const getAllTriggerEvents = () => [...triggerEvents];

export const getActiveTriggers = () =>
    triggerEvents.filter((t) => t.active);

export const getTriggerById = (id) =>
    triggerEvents.find((t) => t.id === id) || null;

export const getTriggersByZone = (zoneId) =>
    triggerEvents.filter((t) => t.zoneId === zoneId);

export const getRecentTriggers = (limitMinutes = 120) => {
    const cutoff = Date.now() - limitMinutes * 60 * 1000;
    return triggerEvents.filter((t) => new Date(t.detectedAt).getTime() > cutoff);
};

export const addTriggerEvent = (event) => {
    triggerEvents.push(event);
    return event;
};

export const deactivateTrigger = (id) => {
    const idx = triggerEvents.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    triggerEvents[idx].active = false;
    triggerEvents[idx].resolvedAt = new Date().toISOString();
    return triggerEvents[idx];
};

// Check if a trigger of this type is already active for this zone
export const hasActiveTrigger = (zoneId, triggerType) =>
    triggerEvents.some((t) => t.zoneId === zoneId && t.triggerType === triggerType && t.active);
