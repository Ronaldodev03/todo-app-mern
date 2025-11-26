import axiosInstance from './axios';

export const tasksApi = {
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await axiosInstance.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  getTask: async (id) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data) => {
    const response = await axiosInstance.post('/tasks', data);
    return response.data;
  },

  updateTask: async ({ id, data }) => {
    const response = await axiosInstance.patch(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get('/tasks/stats');
    return response.data;
  },

  reorderTasks: async (taskIds) => {
    const response = await axiosInstance.patch('/tasks/reorder', { taskIds });
    return response.data;
  },
};
