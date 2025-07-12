import { openDB } from 'idb';
// 1. Importamos la definición de Task desde nuestro archivo central de tipos.
import { Task } from '../types';

const DB_NAME = 'taskDB';
const STORE_NAME = 'tasks';

// Tu lógica de dbPromise es buena, la mantenemos.
export const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            // Usamos 'id' como keyPath, ya que lo asignamos manualmente para offline.
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
    },
});

// 2. Añadimos el tipo 'Task' al parámetro.
export async function saveTask(task: Task) {
    const db = await dbPromise;
    return db.put(STORE_NAME, task);
}

// 3. Especificamos que la función devuelve un array de Tareas.
export async function getTasks(): Promise<Task[]> {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
}

// 4. Añadimos el tipo 'number' al parámetro 'id'.
export async function deleteTask(id: number) {
    const db = await dbPromise;
    return db.delete(STORE_NAME, id);
}
