// Este archivo centraliza las definiciones de tipos para todo el proyecto.

/**
 * Define la estructura de un objeto de Tarea.
 * Se usará en los componentes, servicios y la base de datos local.
 */
export interface Task {
  id: number;           // ID numérico, puede ser temporal (timestamp) o del servidor.
  title: string;        // Título de la tarea.
  description?: string; // Descripción opcional.
  status: 'pending' | 'completed'; // Estado de la tarea.
  
  // Propiedades para la lógica offline
  pendingSync?: boolean; // true si la tarea fue creada/modificada offline y necesita sincronizarse.
  synced?: boolean;      // Otra forma de verlo, true si ya está en el servidor.
}
