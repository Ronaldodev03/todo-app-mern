import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import { toast } from '../utils/toast';

export const useTasks = (filters = {}) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getTasks(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Tarea creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear la tarea');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.updateTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Tarea actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la tarea');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Tarea eliminada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la tarea');
    },
  });
};

export const useTaskStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: tasksApi.getStats,
    staleTime: 1000 * 60 * 5,
  });
};

export const useReorderTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.reorderTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al reordenar las tareas');
    },
  });
};
