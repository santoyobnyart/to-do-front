import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, TextField, Button, List,
    ListItem, ListItemText, ListItemSecondaryAction, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
    Snackbar
} from '@mui/material';
import { Alert as MuiAlert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
// 1. Se cambia la importación a nuestra instancia centralizada
import axiosInstance from '../api/axiosInstance';
// Asumo que tienes estos helpers en las rutas correctas
import { saveTask, getTasks, deleteTask as deleteLocalTask } from '../utils/localDB';
import { checkConnection, listenForReconnection } from '../utils/connectionStatus';

// Interfaz para definir la estructura de una tarea
interface Task {
    id: number;
    title: string;
    description?: string;
    status: 'pending' | 'completed';
    pendingSync?: boolean;
}

// Componente Alert para el Snackbar
const Alert = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof MuiAlert>>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Dashboard: React.FC = () => {
    // Estados para manejar las tareas y la UI
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    // Función para obtener tareas (Online y Offline)
    const fetchTasks = async () => {
        const offlineTasks = await getTasks();
        if (checkConnection()) {
            try {
                // 2. Se usa axiosInstance con ruta relativa. No se necesitan headers.
                const response = await axiosInstance.get('/tasks');
                const syncedTaskIds = new Set(response.data.map((task: Task) => task.id));
                const filteredOfflineTasks = offlineTasks.filter(task => !syncedTaskIds.has(task.id));
                setTasks([...response.data, ...filteredOfflineTasks]);
            } catch (error: any) {
                console.error('Error al obtener las tareas del servidor:', error);
                // El interceptor de axiosInstance ya maneja el 401, pero mantenemos la lógica de fallback
                setErrorMessage('Error al obtener las tareas del servidor. Mostrando datos locales.');
                setTasks(offlineTasks);
            }
        } else {
            setTasks(offlineTasks);
        }
    };

    // Función para agregar una tarea (Online y Offline)
    const handleAddTask = async () => {
        if (!taskTitle.trim()) {
            setErrorMessage('El título de la tarea no puede estar vacío.');
            return;
        }
        const newTask: Task = {
            id: Date.now(),
            title: taskTitle,
            description: taskDescription,
            status: 'pending',
            pendingSync: !checkConnection(),
        };
        setTasks(prev => [...prev, newTask]);
        if (checkConnection()) {
            try {
                // 3. Se usa axiosInstance con ruta relativa.
                const response = await axiosInstance.post('/tasks', { 
                    title: taskTitle, 
                    description: taskDescription, 
                    status: 'pending' 
                });
                setTasks(prev => [...prev.filter(t => t.id !== newTask.id), response.data]);
                setSuccessMessage('Tarea agregada exitosamente.');
            } catch (error: any) {
                console.error('Error al agregar tarea online:', error);
                setErrorMessage('Error al agregar la tarea. Se guardó localmente.');
                await saveTask(newTask);
            }
        } else {
            await saveTask(newTask);
            setSuccessMessage('Tarea guardada offline. Se sincronizará cuando haya conexión.');
        }
        setTaskTitle('');
        setTaskDescription('');
    };

    // Función para sincronizar tareas pendientes
    const syncTasksWithServer = async () => {
        const offlineTasks = await getTasks();
        if (offlineTasks.length === 0) return;
        setSuccessMessage('Sincronizando tareas pendientes...');
        for (const task of offlineTasks) {
            try {
                if (task.pendingSync) {
                    // 4. Se usa axiosInstance para crear tareas nuevas
                    const response = await axiosInstance.post('/tasks', { 
                        title: task.title, 
                        description: task.description, 
                        status: task.status 
                    });
                    setTasks(prev => [...prev.filter(t => t.id !== task.id), response.data]);
                    await deleteLocalTask(task.id);
                } else {
                    // 5. Se usa axiosInstance para actualizar tareas editadas
                    const response = await axiosInstance.put(`/tasks/${task.id}`, { 
                        title: task.title, 
                        description: task.description, 
                        status: task.status 
                    });
                    setTasks(prev => prev.map(t => (t.id === task.id ? response.data : t)));
                    await deleteLocalTask(task.id);
                }
            } catch (error: any) {
                console.error('Error sincronizando tarea:', task, error);
                setErrorMessage(`Error al sincronizar la tarea: ${task.title}`);
            }
        }
        setSuccessMessage('Sincronización completada.');
    };

    const handleEditClick = (task: Task) => {
        setEditTask(task);
        setOpenEditDialog(true);
    };

    // Función para actualizar una tarea
    const handleUpdateTask = async () => {
        if (!editTask) return;
        if (!editTask.title.trim()) {
            setErrorMessage('El título no puede estar vacío.');
            return;
        }
        const updatedTask = { ...editTask, pendingSync: !checkConnection() };
        setTasks(prev => prev.map(task => (task.id === editTask.id ? updatedTask : task)));
        setOpenEditDialog(false);
        if (checkConnection()) {
            try {
                // 6. Se usa axiosInstance para actualizar.
                const response = await axiosInstance.put(`/tasks/${editTask.id}`, { 
                    title: editTask.title, 
                    description: editTask.description, 
                    status: editTask.status 
                });
                setTasks(prev => prev.map(task => (task.id === editTask.id ? response.data : task)));
                setSuccessMessage('Tarea actualizada exitosamente.');
            } catch (error) {
                setErrorMessage('Error al actualizar la tarea. Se guardó localmente.');
                await saveTask(updatedTask);
            }
        } else {
            await saveTask(updatedTask);
            setSuccessMessage('Tarea actualizada offline. Se sincronizará.');
        }
    };

    const handleDeleteTask = (task: Task) => {
        setTaskToDelete(task);
        setDeleteDialogOpen(true);
    };

    // Confirma y ejecuta la eliminación
    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;
        setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
        setDeleteDialogOpen(false);
        if (checkConnection()) {
            try {
                // 7. Se usa axiosInstance para eliminar.
                await axiosInstance.delete(`/tasks/${taskToDelete.id}`);
                setSuccessMessage('Tarea eliminada exitosamente.');
            } catch (error) {
                setErrorMessage('Error al eliminar la tarea en el servidor.');
                setTasks(prev => [...prev, taskToDelete]);
            }
        } else {
            await deleteLocalTask(taskToDelete.id);
            setSuccessMessage('Tarea eliminada offline.');
        }
    };

    useEffect(() => {
        fetchTasks();
        listenForReconnection(syncTasksWithServer);
    }, []);

    const handleCloseError = () => setErrorMessage('');
    const handleCloseSuccess = () => setSuccessMessage('');

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Mis Tareas</Typography>
                <TextField fullWidth label="Título de la Nueva Tarea" variant="outlined" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} sx={{ mb: 2 }} />
                <TextField fullWidth label="Descripción de la Tarea (Opcional)" variant="outlined" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} sx={{ mb: 2 }} />
                <Button variant="contained" color="primary" sx={{ mb: 4, py: 1.5 }} onClick={handleAddTask} fullWidth>Agregar Tarea</Button>
                <List sx={{ mt: 4, border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                    {tasks.length === 0 ? (
                        <ListItem><ListItemText primary="No hay tareas para mostrar." sx={{ textAlign: 'center' }} /></ListItem>
                    ) : (
                        tasks.map(task => (
                            <ListItem key={task.id} divider>
                                <ListItemText primary={<Typography variant="h6" component="span">{task.title}{task.pendingSync && <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}> (Pendiente)</Typography>}</Typography>} secondary={`Estado: ${task.status === 'pending' ? 'Pendiente' : 'Completado'} | Descripción: ${task.description || 'N/A'}`} />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => handleEditClick(task)}><EditIcon /></IconButton>
                                    <IconButton edge="end" onClick={() => handleDeleteTask(task)}><DeleteIcon /></IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    )}
                </List>
            </Box>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent><Typography>¿Estás seguro de que deseas eliminar la tarea "{taskToDelete?.title}"?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={confirmDeleteTask} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Editar Tarea</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Título" type="text" fullWidth value={editTask?.title || ''} onChange={(e) => setEditTask(prev => prev ? { ...prev, title: e.target.value } : null)} />
                    <TextField margin="dense" label="Descripción" type="text" fullWidth value={editTask?.description || ''} onChange={(e) => setEditTask(prev => prev ? { ...prev, description: e.target.value } : null)} />
                    <Select fullWidth value={editTask?.status || 'pending'} onChange={(e) => setEditTask(prev => prev ? { ...prev, status: e.target.value as 'pending' | 'completed' } : null)} sx={{ mt: 2 }}>
                        <MenuItem value="pending">Pendiente</MenuItem>
                        <MenuItem value="completed">Completado</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                    <Button onClick={handleUpdateTask}>Guardar Cambios</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleCloseError}><Alert onClose={handleCloseError} severity="error">{errorMessage}</Alert></Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={handleCloseSuccess}><Alert onClose={handleCloseSuccess} severity="success">{successMessage}</Alert></Snackbar>
        </Container>
    );
};

export default Dashboard;
