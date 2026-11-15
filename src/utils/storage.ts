/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, HCCita, HojaControlData, IndicacionGuiaData, AntecedentesData } from '../types/clinical';

const STORAGE_KEY = 'hampiq_biomedicina_pacientes_v3';
const USER_KEY = 'hampiq_biomedicina_user_v2';

export function createEmptyAntecedentes(): AntecedentesData {
  return {
    fumFecha: '',
    regular: false,
    irregular: false,
    cambioPersistente7d: false,
    intervaloSinSangrado60d: false,
    amenorrea12m: false,
    posmenopausia60o10: false,
    mayor70anos: false,
    strawEtapa: '',
    tipoMenopausia: 'natural',
    gestaciones: {
      g: '',
      p: '',
      a: '',
      c: '',
      ultimoEmbarazo: '',
    },
    embarazoPosible: 'NO',
    anticoncepcion: {
      noRequiere: true,
      preservativo: false,
      diuCobre: false,
      diuLng52mg: false,
      pildoraImplanteProgestageno: false,
      combinada: false,
      otro: '',
    },
    cirugia: {
      uteroIntacto: true,
      histerectomiaTotal: false,
      histerectomiaSubtotal: false,
      ovarios: 'ambos',
      fechaCausa: '',
    },
    sangradoActual: {
      presenta: 'NO',
      intermenstrual: false,
      postcoital: false,
      postmenopausico: false,
      abundanteProlongado: false,
      detalle: '',
    },
    tamizajes: {
      cervixFecha: '',
      cervixResultado: '',
      mamaFecha: '',
      mamaResultado: '',
      otros: '',
    },
    simuladores: {
      anemiaFerropenia: false,
      hipotiroidismo: false,
      hipertiroidismo: false,
      diabetes: false,
      deficitB12: false,
      apnea: false,
      depresionAnsiedad: false,
      infeccion: false,
      reumatologicoArtrosisLupus: false,
      neurologico: false,
      ituDermatosisVulvodiniaPisoPelvico: false,
      farmacos: false,
      corticoides: false,
      detalle: '',
    },
    agravantes: {
      obesidad: false,
      sedentarismo: false,
      estres: false,
      alcohol: false,
      tabaco: false,
      cafeina: false,
      malSueno: false,
      dolorCronico: false,
      factoresSexualesRelacionales: false,
      farmacos: false,
      fracturaFragilidad: false,
      antecedenteParentalCadera: false,
      corticoides: false,
      bajoPeso: false,
      caidas: false,
      enfermedadSecundaria: false,
      detalle: '',
    },
    modificadores: {
      hipertension: false,
      diabetes: false,
      obesidad: false,
      dislipidemiaHipertrigliceridemia: false,
      migrana: false,
      tromboembolismoTrombofilia: false,
      cardiovascular: false,
      hepatopatia: false,
      lupusSaf: false,
      artritisReumatoide: false,
      sop: false,
      endometriosis: false,
      tiroides: false,
      osteoporosis: false,
      sangradoPosmenopausicoInexplicado: false,
      cancerHormonodependienteRelevante: false,
      ictusEnfermedadCardiovascular: false,
      hepatopatiaSignificativa: false,
      otraSituacionCompleja: '',
      cancerMama: false,
      endometrio: false,
      ovarioOtroHormonodependiente: false,
      lesionMamariaPendiente: false,
      trombosisVenosa: false,
      emboliaPulmonar: false,
      trombofilia: false,
      acvAit: false,
      infartoCoronaria: false,
      migranaConAura: false,
      hta: false,
      erc: false,
      litiasisRenal: false,
      malabsorcionBariatrica: false,
      epilepsia: false,
      detalleFechaTratamiento: '',
    },
    riesgoOseo: {
      osteoporosis: false,
      fracturaFragilidad: false,
      familiarCadera: false,
      corticoide: false,
      caidas: false,
      frax: '',
      dxa: '',
      vitaminaDCalcio: '',
    },
    habitos: {
      tabaco: '',
      alcohol: '',
      suenoHoras: '',
      fuerzaSem: '',
      aerobicoSem: '',
      alimentacionProteinaCalcio: '',
    },
    antecedentesFamiliares: {
      cancerMamaOvarioEndometrioColon: false,
      trombosis: false,
      cvPrecoz: false,
      fracturaCadera: false,
      detalle: '',
    },
    medicamentosPrevios: {
      medicamentosDosis: '',
      thmPreviaActual: '',
      respuestaEa: '',
    },
  };
}

export function createEmptyCita(etiqueta: string, fecha: string = ''): HCCita {
  return {
    id: 'cita_' + Math.random().toString(36).substring(2, 9),
    etiqueta,
    fecha,
    funcionesVitales: {
      presionArterial: '',
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      saturacionO2: '',
      temperatura: '',
      pesoKg: '',
      tallaCm: '',
      imc: '',
      cinturaCm: '',
      cinturaTalla: '',
      apetito: '',
      sed: '',
      deposiciones: '',
      miccion: '',
      actividadFisica: '',
      funcionSexual: '',
      suenoHoras: '',
      conciliacionDificil: false,
      despertaresFrecuentes: false,
      despertarPrecoz: false,
      ronquidosImportantes: false,
      pausasRespiratoriasObservadas: false,
      somnolenciaDiurna: false,
      necesidadMoverPiernas: false,
      nocturia: false,
    },
    examenFisico: {
      general: '',
      dermatologico: '',
      cardiovascular: '',
      respiratorio: '',
      tiroides: 'normal',
      tiroidesOtro: '',
      mama: '',
      abdomen: '',
      ginecologico: {
        noRequerido: false,
        atrofiaSequedad: false,
        lesion: false,
        prolapso: false,
        sangrado: false,
        detalle: '',
      },
      musculoesqueleticoNeurologico: '',
      psicologicoEmocional: 'estable',
    },
    cincoEjes: {
      eje1: {
        sofocos: '',
        sudoracionNocturna: '',
        despertaresPorVms: '',
        palpitacionesAsociadas: '',
      },
      eje2: {
        insomnio: '',
        irritabilidad: '',
        ansiedadTension: '',
        nieblaMental: '',
        fatigaCansancio: '',
        dificultadConcentracion: '',
      },
      eje3: {
        sequedadVaginal: '',
        dispareunia: '',
        urgenciaItu: '',
        libido: '',
        orgasmoSatisfaccionSexual: '',
      },
      eje4: {
        presionArterial: '',
        peso: '',
        cintura: '',
        cinturaTalla: '',
        hba1c: '',
        glucosaAyunas: '',
        ldl: '',
        hdl: '',
        trigliceridos: '',
      },
      eje5: {
        dolorArticular: '',
        dolorMuscular: '',
        sensacionDebilidad: '',
        limitacionFuncional: '',
        caidasUltimoAno: '',
        fuerzaFuncional: '',
      },
      calidadVida: {
        impactoGlobalPercibido: '7',
      },
    },
    laboratorio: {
      hemoglobina: '',
      vcm: '',
      ferritina: '',
      tsh: '',
      t4l: '',
      t3l: '',
      vitaminaB12: '',
      vitaminaD25OH: '',
      tgo: '',
      tgp: '',
      fa: '',
      creatinina: '',
      tfg: '',
    },
    hormonas: {
      fsh: '',
      estradiol: '',
      testosteronaTotal: '',
      shbg: '',
    },
    tamizajesEstudios: {
      mamografia: '',
      evaluacionMamaria: '',
      tamizajeCervical: '',
      papanicolaou: '',
      ecografiaGinecologica: '',
      pruebaVph: '',
      densitometria: '',
    },
    alarmas: {
      sangrado: {
        dentro6mIniciarThm: false,
        dentro3mModificarThm: false,
        fueraEsasVentanas: false,
        abundanteProlongado: false,
      },
      mastalgia: '',
      cefalea: '',
      edema: '',
      somnolencia: '',
      acne: '',
      hirsutismo: '',
      cambioDeVoz: '',
      sintomaTrombotico: '',
      malaAdherencia: '',
      ansiedadPersistente: '',
      insomnioPersistente: '',
      noBajaCintura: '',
      fatigaSevera: '',
    },
    tratamiento: {
      hormonal: {
        estradiolTdDosis: '',
        progesteronaVoDosis: '',
        testosteronaTdDosis: '',
        pelletTestosteronaFechaDosis: '',
        estradiolVaginal: '',
        lubricanteHidratanteVaginal: '',
      },
      sueroterapia: [''],
      suplementoOral: {
        formulaHampiq: '',
        vitaminaD: '',
        b12: '',
        complejoB: '',
        hierro: '',
        magnesio: '',
        melatonina: '',
        creatina3a5g: '',
        proteina12a15g: '',
      },
      esm1VezPorSem: '',
      ejercicio: {
        fuerza2a3Sem: '',
        aerobica150Min: '',
        caminarDiariamente: '',
      },
    },
    diagnostico: {
      fecha,
      etapa: '',
      motivoConsultaSintomaPrincipal: '',
      simulador: '',
      agravante: '',
      modificador: '',
      ejeDominante: '',
      otrosDiagnosticos: '',
    },
  };
}

export function createDefaultIndicacionGuia(): IndicacionGuiaData {
  return {
    batidoProteicoObjetivo: 'Disminuir hambre , mejorar metabolismo ,reducir grasa visceral , proteger músculo , mejorar energía.',
    batidoOpciones: [
      {
        id: 'opt_1',
        titulo: 'OPCIÓN 1 — BATIDO NATURAL (38gr de proteína)',
        receta: 'Leche 250ml(1vaso)+ 3 cucharadas Quinua cocida+3 cucharadas Tarwi cocido+1 vaso pequeño Yogur natural(kefir)+ 1 cucharada Maní molido+1 cucharadita Canela(batir todo junto)',
      },
    ],
    planSemanal: [
      {
        dia: 'LUNES',
        desayuno: 'Batido proteico + 2 huevos sancochado + palta',
        almuerzo: 'Trucha + ensalada + quinua',
        cena: 'Tortilla de verduras + queso fresco',
      },
      {
        dia: 'MARTES',
        desayuno: 'Batido proteico + Yogur natural + quinua + manzana',
        almuerzo: 'Pollo + verduras + camote',
        cena: 'Sopa de verduras + huevo',
      },
      {
        dia: 'MIÉRCOLES',
        desayuno: 'Batido proteico + Avena moderada + huevo + queso',
        almuerzo: 'Carne magra + ensalada + papa pequeña',
        cena: 'Yogur + palta + tomate',
      },
      {
        dia: 'JUEVES',
        desayuno: 'Batido proteína + 2 huevos sancochado + fruta',
        almuerzo: 'Trucha + verduras + quinua',
        cena: 'Tortilla con espinaca',
      },
      {
        dia: 'VIERNES',
        desayuno: 'Batido proteico + 2 huevos sancochado + queso + mate',
        almuerzo: 'Pollo + lentejas + ensalada',
        cena: 'Crema de verduras + queso fresco',
      },
    ],
    reglasImportantes: [
      'Comer proteína en cada comida',
      'Tomar 6–8 vasos agua/día',
      'Consumir verduras diariamente',
      'Caminar y hacer fuerza',
      'Dormir mejor',
      'Evitar azúcar y gaseosas',
      'Evitar frituras y exceso pan',
    ],
    fuentesProteina: [
      { id: 'fp_1', alimento: '2 huevos', proteina: '12 g' },
      { id: 'fp_2', alimento: '100 g trucha', proteina: '22 g' },
      { id: 'fp_3', alimento: '100 g pollo', proteina: '25 g' },
      { id: 'fp_4', alimento: '100 g queso fresco', proteina: '15 g' },
      { id: 'fp_5', alimento: '1 taza tarwi', proteina: '18–20 g' },
      { id: 'fp_6', alimento: '1 taza yogur', proteina: '15 g' },
      { id: 'fp_7', alimento: '1 vaso leche', proteina: '8 g' },
      { id: 'fp_8', alimento: '1 taza lentejas', proteina: '18 g' },
      { id: 'fp_9', alimento: '1 scoop proteína', proteina: '25 g' },
    ],
    hormonasLineas: [
      {
        id: 'h_1',
        nombre: 'PROGESTERONA (Progesterona micronizada)',
        dosis: '100 mg antes de dormir.',
      },
    ],
    progesteronaMicronizada: '100 mg antes de dormir.',
    sueroterapiaLineas: [
      { id: 'st_1', periodo: '1° semana', indicacion: 'NAD+ 10ml Ev' },
      { id: 'st_2', periodo: '3° semana', indicacion: 'NAD+ 10ml Ev' },
      { id: 'st_3', periodo: '2°mes', indicacion: 'DETOX 1 10ml Ev' },
      { id: 'st_4', periodo: '3°mes', indicacion: 'DETOX 2 10ml Ev' },
    ],
    emsSesiones: '12 sesiones',
    probiotico: 'Lactobacillus gasseri+ Limosilactobacillus reuteri+ Bifidobacterium infantis+ Bifidobacterium longum+ Lactobacillus rhamnosus GG+ Lactiplantibacillus plantarum+ Inulina /día junto con el desayuno',
    consumoProteinasDiaria: 'Consumo de proteínas diaria según guía Nutricional',
    higieneSuenoPautas: [
      'Dormir misma hora',
      'Ideal 9:30–10:30 pm',
      'Levantarse misma hora',
      'Apagar celular-TV 1 HORA ANTES DE DORMIR',
      'Cena ligera',
      'No azúcar noche',
      'Infusión relajante: Manzanilla(relajación), Toronjil (ansiedad), Anís(digestión), Hierba luisa(relajante)',
      'Habitación fresca',
      'Luz tenue',
      'Evitar café noche.',
    ],
    cenarMaximoHora: '7:00 pm',
    doctora: {
      nombre: 'Dra. Médica Especialista Hampiq',
      especialidad: 'Medicina Funcional y Antienvejecimiento',
      cmp: 'CMP: 48921',
      rne: 'RNE: 24105',
    },
  };
}

export function createDefaultHojaControl(): HojaControlData {
  const columnasCitas = [
    { id: 'Inicial', etiqueta: 'Inicial' },
    { id: 'C1', etiqueta: 'C1' },
    { id: 'C2', etiqueta: 'C2' },
    { id: 'C3', etiqueta: 'C3' },
    { id: 'C4', etiqueta: 'C4' },
    { id: 'C5', etiqueta: 'C5' },
    { id: 'C6', etiqueta: 'C6' },
    { id: 'C7', etiqueta: 'C7' },
    { id: 'C8', etiqueta: 'C8' },
    { id: 'C9', etiqueta: 'C9' },
    { id: 'C10', etiqueta: 'C10' },
    { id: 'C11', etiqueta: 'C11' },
    { id: 'C12', etiqueta: 'C12' },
  ];

  return {
    citas: columnasCitas,
    fechas: {
      Inicial: new Date().toISOString().split('T')[0],
    },
    filas: [
      { id: 'f_esm', concepto: 'ESM', valores: {} },
      { id: 'f_suero', concepto: 'Sueroterapia', valores: {} },
      { id: 'f_estrogeno', concepto: 'Estrogeno', valores: {} },
      { id: 'f_progesterona', concepto: 'Progesterona', valores: {} },
      { id: 'f_testosterona', concepto: 'Testosterona', valores: {} },
    ],
  };
}

export function createNewPatient(
  nombres: string,
  apellidos: string,
  dni: string,
  fechaNacimiento: string,
  celular: string = '',
  direccion: string = '',
  ocupacion: string = ''
): Patient {
  const citaInicial = createEmptyCita('Inicial', new Date().toISOString().split('T')[0]);
  const citaC1 = createEmptyCita('C1', '');

  return {
    id: 'paciente_' + Math.random().toString(36).substring(2, 9),
    nombres,
    apellidos,
    dni,
    celular,
    fechaNacimiento,
    direccion,
    ocupacion,
    etapaActual: 'Evaluación Inicial',
    proximaCita: '',
    ultimaCita: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hc: {
      antecedentes: createEmptyAntecedentes(),
      citas: [citaInicial, citaC1],
    },
    hojaControl: createDefaultHojaControl(),
    indicacionGuia: createDefaultIndicacionGuia(),
    notasVoz: [],
  };
}

export const DEMO_PATIENTS: Patient[] = [];

export function getStoredPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const defaults = createDefaultIndicacionGuia();
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Exclude demo / placeholder patients while preserving any real patient records
      const realPatients = parsed.filter(
        (p: Patient) =>
          p.id !== 'demo_paciente_1' &&
          !p.id.startsWith('demo_') &&
          !p.apellidos?.includes('Demostrativo')
      );

      return realPatients.map((p: Patient) => ({
        ...p,
        notasVoz: Array.isArray(p.notasVoz) ? p.notasVoz : [],
        indicacionGuia: {
          ...defaults,
          ...(p.indicacionGuia || {}),
          hormonasLineas:
            p.indicacionGuia?.hormonasLineas && p.indicacionGuia.hormonasLineas.length > 0
              ? p.indicacionGuia.hormonasLineas
              : defaults.hormonasLineas,
          reglasImportantes:
            p.indicacionGuia?.reglasImportantes && p.indicacionGuia.reglasImportantes.length > 0
              ? p.indicacionGuia.reglasImportantes
              : defaults.reglasImportantes,
          fuentesProteina:
            p.indicacionGuia?.fuentesProteina && p.indicacionGuia.fuentesProteina.length > 0
              ? p.indicacionGuia.fuentesProteina
              : defaults.fuentesProteina,
          higieneSuenoPautas:
            p.indicacionGuia?.higieneSuenoPautas && p.indicacionGuia.higieneSuenoPautas.length > 0
              ? p.indicacionGuia.higieneSuenoPautas
              : defaults.higieneSuenoPautas,
        },
      }));
    }
    return [];
  } catch (err) {
    console.error('Error reading patients from localStorage:', err);
    return [];
  }
}

export function saveStoredPatients(patients: Patient[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error('Error saving patients to localStorage:', err);
  }
}

export function exportBackupJSON(patients: Patient[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(patients, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const now = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `respaldo_hampiq_pacientes_${now}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function getStoredUser(): { email: string; nombre: string; rol: string } | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
    return {
      email: 'doctora@hampiq.pe',
      nombre: 'Dra. María Elena Ramos',
      rol: 'Doctora Especialista',
    };
  } catch {
    return null;
  }
}

export function saveStoredUser(user: { email: string; nombre: string; rol: string } | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (err) {
    console.error('Error saving user to localStorage:', err);
  }
}
