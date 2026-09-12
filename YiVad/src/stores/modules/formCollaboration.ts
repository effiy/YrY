import { defineStore } from "pinia";
import { ref } from "vue";

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  activeField?: string;
  lastSeen: number;
}

export const useFormCollaborationStore = defineStore("formCollaboration", () => {
  const activeSessions = ref<Map<string, CollaborationUser[]>>(new Map());
  const lockedFields = ref<Map<string, Record<string, string>>>(new Map()); // formId → { field → userId }

  function joinSession(formId: string, user: CollaborationUser) {
    const users = activeSessions.value.get(formId) || [];
    const existing = users.findIndex((u) => u.id === user.id);
    if (existing >= 0) {
      users[existing] = user;
    } else {
      users.push(user);
    }
    activeSessions.value.set(formId, users);
  }

  function leaveSession(formId: string, userId: string) {
    const users = activeSessions.value.get(formId) || [];
    activeSessions.value.set(formId, users.filter((u) => u.id !== userId));

    // Release locks
    const locks = lockedFields.value.get(formId) || {};
    for (const [field, uid] of Object.entries(locks)) {
      if (uid === userId) delete locks[field];
    }
    lockedFields.value.set(formId, locks);
  }

  function lockField(formId: string, field: string, userId: string) {
    const locks = lockedFields.value.get(formId) || {};
    locks[field] = userId;
    lockedFields.value.set(formId, { ...locks });
  }

  function unlockField(formId: string, field: string) {
    const locks = lockedFields.value.get(formId) || {};
    delete locks[field];
    lockedFields.value.set(formId, { ...locks });
  }

  function getUsers(formId: string): CollaborationUser[] {
    return activeSessions.value.get(formId) || [];
  }

  function getLocks(formId: string): Record<string, string> {
    return lockedFields.value.get(formId) || {};
  }

  return {
    activeSessions,
    lockedFields,
    joinSession,
    leaveSession,
    lockField,
    unlockField,
    getUsers,
    getLocks,
  };
});