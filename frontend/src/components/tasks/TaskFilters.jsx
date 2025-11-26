import { Select } from '../common/Select';
import { Input } from '../common/Input';

export const TaskFilters = ({ filters, onFilterChange }) => {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Estado"
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: '', label: 'Todos' },
            { value: 'pending', label: 'Pendiente' },
            { value: 'in-progress', label: 'En Progreso' },
            { value: 'completed', label: 'Completada' },
          ]}
        />

        <Select
          label="Prioridad"
          value={filters.priority || ''}
          onChange={(e) => handleChange('priority', e.target.value)}
          options={[
            { value: '', label: 'Todas' },
            { value: 'low', label: 'Baja' },
            { value: 'medium', label: 'Media' },
            { value: 'high', label: 'Alta' },
          ]}
        />

        <Input
          type="date"
          label="Desde"
          value={filters.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />

        <Input
          type="date"
          label="Hasta"
          value={filters.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
        />
      </div>
    </div>
  );
};
