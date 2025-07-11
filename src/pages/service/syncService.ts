import axios from 'axios';
import {getTasks, saveTask} from '../ut';

export const syncTasksWithServer = async () => {
    if (navigator.onLine) return;
    const token =localStorage.getItem('token');
    const tasks = await getTasks();
    const unsyncedTask = tasks.filter((task) => !task.synced);

    for (const task of unsyncedTask) {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/tasks',
                task,
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            task.synced = true;
            await saveTask(task);
        } catch (error: any) {
            console.error('error al sincronizar tarea', error);
        }
    }
}


//Min 14:10 de la clase

