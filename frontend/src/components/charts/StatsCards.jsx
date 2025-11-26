import { CheckCircle, Clock, Play, ListTodo } from 'lucide-react';

export const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total de Tareas',
      value: stats.total,
      icon: ListTodo,
      color: 'bg-blue-500',
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'En Progreso',
      value: stats.inProgress,
      icon: Play,
      color: 'bg-blue-500',
    },
    {
      title: 'Completadas',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
