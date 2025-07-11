import React, { useState } from "react";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
// 1. Cambiamos la importación para usar nuestra instancia centralizada
import axiosInstance from "../api/axiosInstance"; // Asegúrate de que esta ruta sea correcta

const Register: React.FC = () => {
    const navigate = useNavigate();

    // Estados del formulario
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // 2. La función ahora es async para manejar correctamente la llamada a la API
    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        
        try {
            // 3. Usamos axiosInstance con una ruta relativa.
            // La función ahora espera (await) la respuesta del servidor.
            const response = await axiosInstance.post('/users/register', {
                username,
                email,
                password
            });

            console.log("Registration successful:", response.data);
            
            // 4. Solo redirigimos si el registro fue exitoso
            navigate("/login");

        } catch (error: any) {
           console.error("Error en el registro:", error);
           // El mensaje de error ahora se obtiene de la respuesta del error
           setErrorMessage(error.response?.data?.message || "El registro falló. Por favor, intenta de nuevo.");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Register
                </Typography>
            </Box>
            <Box>
                <form onSubmit={handleRegister}>
                    <TextField
                        label="Username"
                        type="text"
                        fullWidth
                        margin="normal"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errorMessage && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Register
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Register;
