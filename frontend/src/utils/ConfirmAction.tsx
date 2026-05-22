import { Box, Button, Card, CardActions, CardHeader, Modal, SxProps } from '@mui/material';
import { useEffect } from 'react';
import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';

const style: SxProps = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    borderRadius: '10px'
};

// 1. Definimos qué datos EXTRAS le pasaremos nosotros (solo el mensaje)
interface AdditionalProps {
    message: string;
}

type ResponseType = null | boolean

// 2. El componente que recibe las props de react-confirm + las nuestras
// Usamos ConfirmDialogProps<Props_Que_Pasamos, Tipo_De_Respuesta>
const MyDialog = ({ show, proceed, message }: ConfirmDialogProps<AdditionalProps, ResponseType>) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita comportamientos por defecto del navegador
                proceed(true);
            }
        };

        // Solo añadimos el escuchador si el modal está abierto
        if (show) {
            window.addEventListener('keydown', handleKeyDown);
        }

        // Limpieza fundamental: eliminamos el evento al desmontar o cerrar el modal
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, proceed]);

    return (
        <Modal
            open={show} 
            onClose={() => proceed(null)} // Si cierran el modal sin clickar botones
        >
            <Box sx={style}>
                <Card elevation={0}>
                    <CardHeader title={message} />
                    <CardActions sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 4 }}>
                        <Button variant="contained" disableElevation color="error" onClick={() => proceed(false)}>
                            No
                        </Button>
                        <Button variant="contained" disableElevation color="success" onClick={() => proceed(true)}>
                            Sí
                        </Button>
                    </CardActions>
                </Card>
            </Box>
        </Modal>
    );
};

// 3. LA CLAVE: confirmable(MyDialog) devuelve un componente que TS ya entiende 
// que no necesita recibir 'show' o 'proceed' externamente.
export const confirmAction = createConfirmation(confirmable(MyDialog));

export default confirmAction;