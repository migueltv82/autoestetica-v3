-- Script para inicializar la base de datos de Auto Estética
-- Pega esto en el SQL Editor de tu proyecto en Supabase y dale "Run"

-- 1. Crear la tabla de Turnos
CREATE TABLE public.turns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    service TEXT NOT NULL,
    status TEXT DEFAULT 'Pendiente' NOT NULL,
    notes TEXT
);

-- 2. Configurar Row Level Security (Políticas de Seguridad)
ALTER TABLE public.turns ENABLE ROW LEVEL SECURITY;

-- Por ahora, permitimos acceso público total (Lectura, Inserción, Actualización, Borrado)
-- Idealmente después limitamos la inserción/actualización mediante autenticación
CREATE POLICY "Permitir todo acceso público" 
ON public.turns 
FOR ALL USING (true);

-- 3. Insertar datos de prueba para ver en nuestra interfaz
INSERT INTO public.turns (date, time, client_name, phone, vehicle_type, service, status, notes)
VALUES 
    (CURRENT_DATE, '10:00:00', 'Miguel Torres', '3814400001', 'Auto', 'Lavado premium', 'Pendiente', 'Primer cliente'),
    (CURRENT_DATE, '12:00:00', 'Juan Pérez', '3814400002', 'Camioneta', 'Limpieza de interior', 'Confirmado', ''),
    (CURRENT_DATE, '16:00:00', 'Sofía Gómez', '3814400003', 'Moto', 'Lavado y detallado de motos', 'Pendiente', '');
