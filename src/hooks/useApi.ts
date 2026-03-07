import { toast } from 'sonner';

export const useApi = () => {
  const fetchJsonSafe = async (res: Response) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return { raw: text };
    }
  };

  const fetchOkJson = async (url: string, init?: RequestInit) => {
    try {
      const token = localStorage.getItem('elita_auth_token');
      const headers = {
        ...init?.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const res = await fetch(url, { ...init, headers });
      const data = await fetchJsonSafe(res);

      if (res.status === 401 && url !== '/api/login') {
        localStorage.removeItem('elita_auth_token');
        window.location.reload();
      }

      if (!res.ok) {
        const msg = data?.error || data?.raw || `שגיאת שרת (${res.status})`;
        throw new Error(msg);
      }
      return data;
    } catch (error: any) {
      if (error.message !== 'Unauthorized') {
        toast.error(error.message || 'שגיאת תקשורת');
      }
      throw error;
    }
  };

  return {
    fetchOkJson,

    // ✅ New: locations (migrashim)
    locations: {
      getAll: () => fetchOkJson('/api/locations'),
    },

    trainees: {
      getAll: () => fetchOkJson('/api/trainees'),
      create: (data: any) =>
        fetchOkJson('/api/trainees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: number, data: any) =>
        fetchOkJson(`/api/trainees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      delete: (id: number) => fetchOkJson(`/api/trainees/${id}`, { method: 'DELETE' }),
    },

    slots: {
      getAll: () => fetchOkJson('/api/slots'),

      // ✅ Updated: ensure locationId is sent (default 1)
      create: (data: any) => {
        const payload = {
          ...data,
          locationId: data?.locationId ?? 1,
        };
        return fetchOkJson('/api/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      },

      delete: (id: number) => fetchOkJson(`/api/slots/${id}`, { method: 'DELETE' }),
    },

    weekly: {
      get: (startDate: string, endDate: string) =>
        fetchOkJson(`/api/weekly?startDate=${startDate}&endDate=${endDate}`),

      assign: (data: any) =>
        fetchOkJson('/api/weekly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),

      unassign: (data: any) =>
        fetchOkJson('/api/weekly', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),

      cancelSlot: (data: any) =>
        fetchOkJson('/api/weekly/slot/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
    },

    debts: {
      getAll: () => fetchOkJson('/api/debts'),
      create: (data: any) =>
        fetchOkJson('/api/debts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: number, data: any) =>
        fetchOkJson(`/api/debts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      bulkUpdate: (data: any) =>
        fetchOkJson('/api/debts/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      delete: (id: number) => fetchOkJson(`/api/debts/${id}`, { method: 'DELETE' }),
    },

    auth: {
      resetCheck: (force = false) =>
        fetchOkJson('/api/reset-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force }),
        }),
    },
  };
};