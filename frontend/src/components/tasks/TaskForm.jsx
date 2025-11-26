import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema } from "../../schemas/task.schema";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  // Usar métodos UTC para evitar problemas de zona horaria
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const TaskForm = ({ task, onSubmit, isLoading }) => {
  const defaultValues = task
    ? {
        ...task,
        dueDate: formatDateForInput(task.dueDate),
      }
    : {
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: "",
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Título"
        {...register("title")}
        error={errors.title?.message}
        placeholder="Título de la tarea"
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          {...register("description")}
          className={`input-field ${
            errors.description ? "border-red-500" : ""
          }`}
          rows={4}
          placeholder="Descripción de la tarea (opcional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <Select
        label="Estado"
        {...register("status")}
        error={errors.status?.message}
        options={[
          { value: "pending", label: "Pendiente" },
          { value: "in-progress", label: "En Progreso" },
          { value: "completed", label: "Completada" },
        ]}
      />

      <Select
        label="Prioridad"
        {...register("priority")}
        error={errors.priority?.message}
        options={[
          { value: "low", label: "Baja" },
          { value: "medium", label: "Media" },
          { value: "high", label: "Alta" },
        ]}
      />

      <Input
        type="date"
        label="Fecha límite (opcional)"
        {...register("dueDate")}
        error={errors.dueDate?.message}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {task ? "Actualizar" : "Crear"} Tarea
        </Button>
      </div>
    </form>
  );
};
