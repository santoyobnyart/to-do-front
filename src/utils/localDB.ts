import { openDB } from 'idb';
// 1. Añadimos 'type' a la importación para cumplir con las reglas de TypeScript.
import type { Task } from '../types';

const DB_NAME = 'taskDB';
const STORE_NAME = 'tasks';

export const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
    },
});

export async function saveTask(task: Task) {
    const db = await dbPromise;
    return db.put(STORE_NAME, task);
}

export async function getTasks(): Promise<Task[]> {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
}

export async function deleteTask(id: number) {
    const db = await dbPromise;
    return db.delete(STORE_NAME, id);
}
