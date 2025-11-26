import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query para obtener el usuario autenticado
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      try {
        const response = await authApi.getMe();
        return response.data.user;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      localStorage.setItem('token', response.token);
      queryClient.setQueryData(['auth', 'me'], response.data.user);
    },
  });

  // Mutation para register
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      localStorage.setItem('token', response.token);
      queryClient.setQueryData(['auth', 'me'], response.data.user);
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      // Aunque falle el logout en el servidor, limpiamos el cliente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    user,
    loading: isLoading,
    isAuthenticated: !!user && !isError,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
