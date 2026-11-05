import twilio from 'twilio';

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE;

export const smsConfigurado = () => Boolean(sid && token && from);

// Sin tildes para que el SMS use menos segmentos (y cueste menos)
const limpiar = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export interface ResultadoSMS {
  simulado: boolean;
  enviados: number;
  errores: string[];
}

export async function enviarSMS(mensaje: string, destinos: string[]): Promise<ResultadoSMS> {
  if (!smsConfigurado()) {
    console.log(`[SMS SIMULADO] Twilio no configurado. Destinos: ${destinos.join(', ')}\n${mensaje}`);
    return { simulado: true, enviados: 0, errores: [] };
  }

  const client = twilio(sid!, token!);
  const errores: string[] = [];
  let enviados = 0;

  for (const to of destinos) {
    try {
      await client.messages.create({ body: limpiar(mensaje), from: from!, to });
      enviados++;
    } catch (err: any) {
      console.error(`Error enviando SMS a ${to}:`, err.message);
      errores.push(`${to}: ${err.message}`);
    }
  }

  return { simulado: false, enviados, errores };
}