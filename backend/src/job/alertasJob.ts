import cron from 'node-cron';
import { ejecutarAlertasSMS } from '../services/alertasService';

// Todos los días a las 7:00 a.m. hora de Colombia
export const iniciarAlertasJob = () => {
  cron.schedule(
    '0 7 * * *',
    async () => {
      try {
        console.log('[Alertas] Revisando vencimientos...');
        await ejecutarAlertasSMS();
      } catch (err) {
        console.error('[Alertas] Error en la tarea programada:', err);
      }
    },
    { timezone: 'America/Bogota' }
  );
  console.log('⏰ Tarea de alertas programada (7:00 a.m. todos los días)');
};