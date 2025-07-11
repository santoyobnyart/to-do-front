import React, { useState } from 'react';
import { TextField, Button, Container, Box, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; // Importa tu instancia configurada

const Login: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        try {
            // VERIFICA ESTA LÍNEA: Asegúrate de que apunte a '/auth/login'
            const response = await axiosInstance.post('/auth/login', { 
                email,
                password,
            });
    
            console.log('Respuesta del login:', response.data); 
            if (response.data && response.data.token) {
                console.log('Token recibido y guardado:', response.data.token); 
                // VERIFICA ESTA LÍNEA: Guarda solo el token, sin "Bearer "
                localStorage.setItem('token', response.data.token); 
            } else {
                setErrorMessage('Inicio de sesión exitoso, pero no se recibió el token. Contacte al administrador.');
                return;
            }
            
            setErrorMessage(''); 
            navigate('/dashboard'); // Esta es la línea 41
        } catch (error: any) {
            console.error('Error al iniciar sesión:', error);
            if (error.response) {
                console.error('Datos de error de la respuesta:', error.response.data);
                setErrorMessage(
                    error.response.data.message || 'Error en las credenciales. Verifique su correo y contraseña.'
                );
            } else if (error.request) {
                setErrorMessage('No se pudo conectar con el servidor. Verifique su conexión.');
            } else {
                setErrorMessage('Ocurrió un error inesperado al iniciar sesión.');
            }
        }
    };
    

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Iniciar Sesión
                </Typography>
                {errorMessage && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Typography>
                )}
                <Box component="form" noValidate sx={{ mt: 2 }} onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Correo Electrónico"
                        margin="normal"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Contraseña"
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3 }}
                        type="submit"
                    >
                        Ingresar
                    </Button>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        ¿No tienes una cuenta?{' '}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate('/register')}
                        >
                            Regístrate aquí
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
