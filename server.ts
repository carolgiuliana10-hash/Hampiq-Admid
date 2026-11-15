/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

const MENOPAUSE_SYSTEM_INSTRUCTION = `Eres una Médica Especialista Senior en Medicina de la Menopausia, Climaterio y Endocrinología Ginecológica Funcional (criterios STRAW+10, guías NAMS/IMS/EMMR, manejo integral de los 5 ejes clínicos, Terapia Hormonal de la Menopausia [THM], salud cardiometabólica, ósea, neuropsicológica y genitourinaria).

Tu tarea es analizar la evolución longitudinal de una paciente a lo largo de todas sus citas médicas registradas (por ejemplo: Inicial, C1, C2, C3...), evaluando EXCLUSIVAMENTE los cuadros clínicos de consulta desde Funciones Vitales hasta los 5 Ejes, Calidad de Vida, Laboratorio/Hormonas/Tamizajes, Efectos Adversos/Alarmas y Tratamiento. NO debes generar diagnósticos definitivos ni incluir sección de Diagnóstico.

Instrucciones estrictas de salida:
1. Idioma: Español médico claro, preciso, empático y útil para la consulta médica.
2. En "filas", debes incluir exactamente los 12 cuadros clínicos en este orden (si algún cuadro no tiene datos en ninguna cita, igual inclúyelo indicando "0/N citas" y tendencia "sin_datos"):
   1) Funciones Vitales y Antropometría
   2) Sueño y Funciones Biológicas
   3) Examen Físico Dirigido
   4) Eje 1: Vasomotor / Hormonal
   5) Eje 2: Neurológico / Sueño / Psicoemocional
   6) Eje 3: Genitourinario / Sexual
   7) Eje 4: Cardiometabólico / Composición Corporal
   8) Eje 5: Musculoesquelético / Hueso / Función
   9) Calidad de Vida (Impacto Global)
   10) Laboratorio, Hormonas y Tamizajes
   11) Efectos Adversos / Alarmas
   12) Tratamiento Prescrito
3. En cada fila:
   - "frecuenciaRegistro": Indica en cuántas citas aparece registrado este cuadro (ej. "3/3 citas" o "2/4 citas").
   - "celdasPorCita": Una entrada por cada cita enviada, manteniendo exactamente la misma "etiquetaCita" (Inicial, C1, etc.). En "estadoFrecuencia" indica brevemente la intensidad/frecuencia o presencia (ej. "Severo / Diario", "Leve / Ocasional", "Normal", "Registrado", "Sin dato"). En "resumenCita" sintetiza los valores o hallazgos puntuales de esa cita en máximo 12-18 palabras. En "puntaje" asigna un número de 0 a 10 que represente el nivel de control clínico o evolución favorable en esa cita para graficarlo en una curva evolutiva (10 = óptimo / asintomático / en meta terapéutica, 5 = moderado o parcial, 0 = severo / muy frecuente / descontrolado; usa -1 si no hay datos registrados en esa cita).
   - "tendencia": Usa exactamente uno de: "mejoria", "estable", "empeoramiento", "mixta", "sin_datos".
   - "analisisEvolucion": Resume en 1-2 oraciones cómo evolucionó la paciente en ese cuadro específico a lo largo de las citas.
4. En "resumenGeneral":
   - "evolucionGlobal": Redacta un resumen clínico integral de 1-2 párrafos sobre la trayectoria evolutiva global de la paciente desde su primera cita hasta la más reciente, integrando síntomas vasomotores, neuroemocionales, genitourinarios, perfil cardiometabólico, salud ósea/muscular, adherencia/tolerancia a THM o suplementación y señales de alarma.
   - "logrosPrincipales": Lista de 2 a 4 mejoras o metas alcanzadas.
   - "areasAtencion": Lista de 2 a 4 aspectos pendientes, síntomas persistentes, factores de riesgo o alarmas que requieren vigilancia.
   - "recomendacionesSeguimiento": Lista de 2 a 4 sugerencias prácticas de seguimiento clínico para la médica tratante (sin emitir diagnóstico médico formal).
5. Nunca inventes cifras o síntomas que no figuren en los datos enviados.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    filas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          cuadro: { type: Type.STRING },
          frecuenciaRegistro: { type: Type.STRING },
          celdasPorCita: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                etiquetaCita: { type: Type.STRING },
                estadoFrecuencia: { type: Type.STRING },
                resumenCita: { type: Type.STRING },
                puntaje: { type: Type.NUMBER },
              },
              required: ['etiquetaCita', 'estadoFrecuencia', 'resumenCita', 'puntaje'],
            },
          },
          tendencia: { type: Type.STRING },
          analisisEvolucion: { type: Type.STRING },
        },
        required: [
          'cuadro',
          'frecuenciaRegistro',
          'celdasPorCita',
          'tendencia',
          'analisisEvolucion',
        ],
      },
    },
    resumenGeneral: {
      type: Type.OBJECT,
      properties: {
        evolucionGlobal: { type: Type.STRING },
        logrosPrincipales: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        areasAtencion: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        recomendacionesSeguimiento: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        'evolucionGlobal',
        'logrosPrincipales',
        'areasAtencion',
        'recomendacionesSeguimiento',
      ],
    },
  },
  required: ['filas', 'resumenGeneral'],
};

async function callGeminiWithRetry(ai: GoogleGenAI, promptText: string, attempts = 2) {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptText,
        config: {
          systemInstruction: MENOPAUSE_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      });
    } catch (err: unknown) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 800 * (i + 1)));
      }
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/ai/menopause-summary', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error:
          'La clave de Gemini (GEMINI_API_KEY) no está configurada en el entorno del servidor.',
      });
      return;
    }

    const clinicalPayload = req.body?.clinicalPayload;
    if (
      !clinicalPayload ||
      typeof clinicalPayload !== 'object' ||
      !Array.isArray(clinicalPayload.citas) ||
      clinicalPayload.citas.length === 0
    ) {
      res.status(400).json({
        error: 'Se requiere al menos una cita clínica para generar el análisis evolutivo.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptText = `Analiza los siguientes datos clínicos longitudinales de una paciente en seguimiento de menopausia/climaterio (excluyendo diagnóstico) y genera la tabla de frecuencia/evolución por citas y el resumen general:\n\n${JSON.stringify(
        clinicalPayload
      )}`;

      const response = await callGeminiWithRetry(ai, promptText);
      const text = response.text?.trim();
      if (!text) {
        res.status(502).json({
          error: 'La IA no devolvió contenido. Intenta nuevamente.',
        });
        return;
      }

      const parsed = JSON.parse(text);
      res.json({ analysis: parsed });
    } catch (err: unknown) {
      console.error('Gemini menopause summary error:', err);
      const message =
        err instanceof Error ? err.message : 'Error inesperado al consultar la IA de Menopausia.';
      res.status(500).json({
        error: `No se pudo generar el resumen con IA: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hampiq server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
