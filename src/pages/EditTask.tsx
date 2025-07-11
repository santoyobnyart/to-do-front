import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const EditTask: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { task } = location.state as {
    task: { id: number; title: string; status: string };
  };

  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    console.log("Tarea editada:", { id: task.id, title, status });
    // Aquí podrías actualizar la tarea en tu estado global o backend
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Editar tarea
        </Typography>
        <Box component="form" noValidate sx={{ mt: 2 }} onSubmit={handleSave}>
          <TextField
            fullWidth
            label="Título"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Descripción"
            margin="normal"
            multiline
            rows={3}  
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            fullWidth
            select
            label="Estado"
            margin="normal"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <MenuItem value="pendiente">Pendiente</MenuItem>
            <MenuItem value="en proceso">En proceso</MenuItem>
            <MenuItem value="completada">Completada</MenuItem>
          </TextField>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            type="submit"
          >
            Guardar cambios
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={() => navigate("/dashboard")}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default EditTask;