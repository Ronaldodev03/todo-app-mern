import { Edit2, Trash2, Calendar, GripVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Función auxiliar para formatear fechas sin problemas de zona horaria
const formatDate = (dateString) => {
  if (!dateString) return '';
  // Extraer solo la parte de la fecha (YYYY-MM-DD) y crear fecha local
  const dateOnly = dateString.split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  return format(new Date(year, month - 1, day), 'PPP', { locale: es });
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusLabels = {
  pending: 'Pendiente',
  'in-progress': 'En Progreso',
  completed: 'Completada',
};

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export const TaskCard = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing mt-1"
            title="Arrastra para reordenar"
          >
            <GripVertical size={18} />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">{task.title}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          Prioridad: {priorityLabels[task.priority]}
        </span>
      </div>

      {task.dueDate && (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={14} className="mr-1" />
          Vence: {formatDate(task.dueDate)}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Creada: {format(new Date(task.createdAt), 'PPP', { locale: es })}
      </div>
    </div>
  );
};
