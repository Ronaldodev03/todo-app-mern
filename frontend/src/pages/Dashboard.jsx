import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTaskStats,
  useReorderTasks,
} from "../hooks/useTasks";
import { TaskFilters } from "../components/tasks/TaskFilters";
import { TaskList } from "../components/tasks/TaskList";
import { TaskForm } from "../components/tasks/TaskForm";
import { StatsCards } from "../components/charts/StatsCards";
import { TasksChart } from "../components/charts/TasksChart";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Button } from "../components/common/Button";
import {
  Plus,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [filters, setFilters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    taskId: null,
  });
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [localTasks, setLocalTasks] = useState([]);

  const { data: tasksData, isLoading } = useTasks(filters);
  const { data: statsData } = useTaskStats();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();

  const tasks = tasksData?.data?.tasks || [];
  const stats = statsData?.data?.stats;

  // Sincronizar tareas locales con las del servidor
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleReorderTasks = async (reorderedTasks) => {
    // Actualizar estado local inmediatamente para UX optimista
    setLocalTasks(reorderedTasks);

    // Persistir el nuevo orden en el backend
    try {
      const taskIds = reorderedTasks.map(task => task._id);
      await reorderTasks.mutateAsync(taskIds);
    } catch (error) {
      console.error('Error al reordenar tareas:', error);
      // En caso de error, revertir al orden original
      setLocalTasks(tasks);
    }
  };

  const handleCreateTask = async (data) => {
    try {
      await createTask.mutateAsync(data);
      setIsModalOpen(false);
      toast.success("Tarea creada exitosamente");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al crear la tarea");
    }
  };

  const handleUpdateTask = async (data) => {
    try {
      await updateTask.mutateAsync({ id: editingTask._id, data });
      setIsModalOpen(false);
      setEditingTask(null);
      toast.success("Tarea actualizada exitosamente");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error al actualizar la tarea"
      );
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id) => {
    setDeleteConfirm({ isOpen: true, taskId: id });
  };

  const confirmDeleteTask = async () => {
    try {
      await deleteTask.mutateAsync(deleteConfirm.taskId);
      toast.success("Tarea eliminada exitosamente");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error al eliminar la tarea"
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleLogout = () => {
    setLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await logout();
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  Todo App
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  console.log("Button clicked! Current theme:", theme);
                  toggleTheme();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={
                  theme === "dark"
                    ? "Cambiar a modo claro"
                    : "Cambiar a modo oscuro"
                }
              >
                {theme === "dark" ? (
                  <Sun size={20} className="text-gray-700 dark:text-gray-200" />
                ) : (
                  <Moon size={20} className="text-gray-700" />
                )}
              </button>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <User size={20} />
                <span className="font-medium">{user?.username}</span>
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut size={18} className="mr-2 inline" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h2>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={20} className="mr-2 inline" />
              Nueva Tarea
            </Button>
          </div>

          <StatsCards stats={stats} />
        </div>

        {stats && stats.total > 0 && (
          <div className="mb-8">
            <TasksChart stats={stats} />
          </div>
        )}

        <TaskFilters filters={filters} onFilterChange={setFilters} />

        <TaskList
          tasks={localTasks}
          isLoading={isLoading}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onReorder={handleReorderTasks}
        />

        {tasksData?.pagination && tasks.length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="card inline-flex items-center gap-4">
              <button
                onClick={() => handlePageChange(tasksData.pagination.page - 1)}
                disabled={tasksData.pagination.page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-200"
                title="Página anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Página {tasksData.pagination.page} de{" "}
                  {tasksData.pagination.pages}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Total: {tasksData.pagination.total} tareas
                </span>
              </div>

              <button
                onClick={() => handlePageChange(tasksData.pagination.page + 1)}
                disabled={
                  tasksData.pagination.page === tasksData.pagination.pages
                }
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-200"
                title="Página siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? "Editar Tarea" : "Nueva Tarea"}
      >
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          isLoading={createTask.isPending || updateTask.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, taskId: null })}
        onConfirm={confirmDeleteTask}
        title="Eliminar Tarea"
        message="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteTask.isPending}
      />

      <ConfirmDialog
        isOpen={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        variant="warning"
      />
    </div>
  );
};
