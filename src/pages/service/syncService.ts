// 1. Importamos la instancia de Axios, los tipos y las funciones de la DB corregidas.
import axiosInstance from '../../api/axiosInstance';
import { getTasks, saveTask, deleteTask } from '../../utils/localDB';
import { Task } from '../../types';

export const syncTasksWithServer = async () => {
    const tasks = await getTasks();
    // Filtramos las tareas que están marcadas como pendientes de sincronización.
    const unsyncedTasks = tasks.filter((task: Task) => task.pendingSync);

    if (unsyncedTasks.length === 0) {
        return; // No hay nada que hacer
    }

    console.log(`Iniciando sincronización de ${unsyncedTasks.length} tareas.`);

    for (const taskToSync of unsyncedTasks) {
        try {
            // 2. Usamos axiosInstance. La URL base y el token se añaden automáticamente.
            const response = await axiosInstance.post('/tasks', {
                title: taskToSync.title,
                description: taskToSync.description,
                status: taskToSync.status,
            });

            // La tarea que vuelve del servidor ya tiene el ID permanente.
            const syncedTaskFromServer: Task = response.data;

            // 3. Lógica para evitar duplicados:
            // Primero, eliminamos la tarea con el ID temporal de IndexedDB.
            await deleteTask(taskToSync.id);

            // Luego, guardamos la nueva tarea (con el ID del servidor)
            // y la marcamos como ya sincronizada.
            await saveTask({
                ...syncedTaskFromServer,
                pendingSync: false, // Ya no está pendiente
            });

            console.log(`Tarea "${syncedTaskFromServer.title}" sincronizada exitosamente.`);

        } catch (error) {
            console.error(`Error al sincronizar la tarea "${taskToSync.title}":`, error);
            // Si hay un error, la tarea no se borra de IndexedDB y se intentará sincronizar más tarde.
        }
    }
};
