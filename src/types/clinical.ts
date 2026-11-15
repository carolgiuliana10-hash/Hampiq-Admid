/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  celular: string;
  fechaNacimiento: string; // YYYY-MM-DD
  direccion: string;
  ocupacion: string;
  etapaActual: string;
  proximaCita: string;
  ultimaCita: string;
  createdAt: string;
  updatedAt: string;
  hc: HistoriaClinicaData;
  hojaControl: HojaControlData;
  indicacionGuia: IndicacionGuiaData;
  notasVoz: NotaVoz[];
}

export type TendenciaEvolucion = 'mejoria' | 'estable' | 'empeoramiento' | 'mixta' | 'sin_datos';

export interface EvolucionIACelda {
  etiquetaCita: string;
  fecha: string;
  estadoFrecuencia: string;
  resumenCita: string;
  puntaje?: number | null;
}

export interface EvolucionIAFila {
  cuadro: string;
  frecuenciaRegistro: string;
  celdasPorCita: EvolucionIACelda[];
  tendencia: TendenciaEvolucion;
  analisisEvolucion: string;
}

export interface EvolucionIAResumenGeneral {
  evolucionGlobal: string;
  logrosPrincipales: string[];
  areasAtencion: string[];
  recomendacionesSeguimiento: string[];
}

export interface EvolucionIAAnalisis {
  generadoEn: string;
  totalCitasAnalizadas: number;
  filas: EvolucionIAFila[];
  resumenGeneral: EvolucionIAResumenGeneral;
}

export interface HistoriaClinicaData {
  antecedentes: AntecedentesData;
  citas: HCCita[];
  analisisEvolucionIA?: EvolucionIAAnalisis;
}

export interface AntecedentesData {
  // FUM / ciclo
  fumFecha: string;
  regular: boolean;
  irregular: boolean;
  cambioPersistente7d: boolean;
  intervaloSinSangrado60d: boolean;
  amenorrea12m: boolean;
  posmenopausia60o10: boolean;
  mayor70anos: boolean;

  // STRAW+10
  strawEtapa: string; // '-3', '-2', '-1', '0', '+1a', '+1b', '+1c', '+2', ''

  // Tipo
  tipoMenopausia: 'natural' | 'quirurgica' | 'temprana' | 'iop' | 'por_confirmar' | '';

  // Gestaciones
  gestaciones: {
    g: string;
    p: string;
    a: string;
    c: string;
    ultimoEmbarazo: string;
  };

  // Embarazo posible
  embarazoPosible: 'NO' | 'SÍ' | 'duda';

  // Anticoncepción
  anticoncepcion: {
    noRequiere: boolean;
    preservativo: boolean;
    diuCobre: boolean;
    diuLng52mg: boolean;
    pildoraImplanteProgestageno: boolean;
    combinada: boolean;
    otro: string;
  };

  // Cirugía
  cirugia: {
    uteroIntacto: boolean;
    histerectomiaTotal: boolean;
    histerectomiaSubtotal: boolean;
    ovarios: 'ambos' | 'uno' | 'ninguno' | '';
    fechaCausa: string;
  };

  // Sangrado actual
  sangradoActual: {
    presenta: 'NO' | 'SÍ';
    intermenstrual: boolean;
    postcoital: boolean;
    postmenopausico: boolean;
    abundanteProlongado: boolean;
    detalle: string;
  };

  // Tamizajes
  tamizajes: {
    cervixFecha: string;
    cervixResultado: string;
    mamaFecha: string;
    mamaResultado: string;
    otros: string;
  };

  // Simulador (checkboxes from image)
  simuladores: {
    anemiaFerropenia: boolean;
    hipotiroidismo: boolean;
    hipertiroidismo: boolean;
    diabetes: boolean;
    deficitB12: boolean;
    apnea: boolean;
    depresionAnsiedad: boolean;
    infeccion: boolean;
    reumatologicoArtrosisLupus: boolean;
    neurologico: boolean;
    ituDermatosisVulvodiniaPisoPelvico: boolean;
    farmacos: boolean;
    corticoides: boolean;
    detalle: string;
  };

  // Agravante (checkboxes from image)
  agravantes: {
    obesidad: boolean;
    sedentarismo: boolean;
    estres: boolean;
    alcohol: boolean;
    tabaco: boolean;
    cafeina: boolean;
    malSueno: boolean;
    dolorCronico: boolean;
    factoresSexualesRelacionales: boolean;
    farmacos: boolean;
    fracturaFragilidad: boolean;
    antecedenteParentalCadera: boolean;
    corticoides: boolean;
    bajoPeso: boolean;
    caidas: boolean;
    enfermedadSecundaria: boolean;
    detalle: string;
  };

  // Modificador de tratamiento (checkboxes from image)
  modificadores: {
    hipertension: boolean;
    diabetes: boolean;
    obesidad: boolean;
    dislipidemiaHipertrigliceridemia: boolean;
    migrana: boolean;
    tromboembolismoTrombofilia: boolean;
    cardiovascular: boolean;
    hepatopatia: boolean;
    lupusSaf: boolean;
    artritisReumatoide: boolean;
    sop: boolean;
    endometriosis: boolean;
    tiroides: boolean;
    osteoporosis: boolean;
    sangradoPosmenopausicoInexplicado: boolean;
    cancerHormonodependienteRelevante: boolean;
    ictusEnfermedadCardiovascular: boolean;
    hepatopatiaSignificativa: boolean;
    otraSituacionCompleja: string;
    // Specific high-alert list from image:
    cancerMama: boolean;
    endometrio: boolean;
    ovarioOtroHormonodependiente: boolean;
    lesionMamariaPendiente: boolean;
    trombosisVenosa: boolean;
    emboliaPulmonar: boolean;
    trombofilia: boolean;
    acvAit: boolean;
    infartoCoronaria: boolean;
    migranaConAura: boolean;
    hta: boolean;
    erc: boolean;
    litiasisRenal: boolean;
    malabsorcionBariatrica: boolean;
    epilepsia: boolean;
    detalleFechaTratamiento: string;
  };

  // Riesgo óseo
  riesgoOseo: {
    osteoporosis: boolean;
    fracturaFragilidad: boolean;
    familiarCadera: boolean;
    corticoide: boolean;
    caidas: boolean;
    frax: string;
    dxa: string;
    vitaminaDCalcio: string;
  };

  // Hábitos
  habitos: {
    tabaco: string;
    alcohol: string;
    suenoHoras: string;
    fuerzaSem: string;
    aerobicoSem: string;
    alimentacionProteinaCalcio: string;
  };

  // Antecedentes familiares
  antecedentesFamiliares: {
    cancerMamaOvarioEndometrioColon: boolean;
    trombosis: boolean;
    cvPrecoz: boolean;
    fracturaCadera: boolean;
    detalle: string;
  };

  // Medicamentos previos
  medicamentosPrevios: {
    medicamentosDosis: string;
    thmPreviaActual: string;
    respuestaEa: string;
  };
}

export interface HCCita {
  id: string;
  etiqueta: string; // "Inicial", "C1", "C2", ...
  fecha: string;

  // Funciones vitales y antropometría
  funcionesVitales: {
    presionArterial: string;
    frecuenciaCardiaca: string;
    frecuenciaRespiratoria: string;
    saturacionO2: string;
    temperatura: string;
    pesoKg: string;
    tallaCm: string;
    imc: string; // auto
    cinturaCm: string;
    cinturaTalla: string; // auto
    apetito: string;
    sed: string;
    deposiciones: string;
    miccion: string;
    actividadFisica: string;
    funcionSexual: string;
    // Sueño
    suenoHoras: string;
    conciliacionDificil: boolean;
    despertaresFrecuentes: boolean;
    despertarPrecoz: boolean;
    ronquidosImportantes: boolean;
    pausasRespiratoriasObservadas: boolean;
    somnolenciaDiurna: boolean;
    necesidadMoverPiernas: boolean;
    nocturia: boolean;
  };

  // Examen Físico Dirigido
  examenFisico: {
    general: string;
    dermatologico: string;
    cardiovascular: string;
    respiratorio: string;
    tiroides: 'normal' | 'bocio_nodulo' | 'otro' | '';
    tiroidesOtro: string;
    mama: string;
    abdomen: string;
    ginecologico: {
      noRequerido: boolean;
      atrofiaSequedad: boolean;
      lesion: boolean;
      prolapso: boolean;
      sangrado: boolean;
      detalle: string;
    };
    musculoesqueleticoNeurologico: string; // fuerza/función/dolor
    psicologicoEmocional: string; // estable, (tendencia al llanto, ansiosa, irritable)
  };

  // Los 5 Ejes
  cincoEjes: {
    eje1: {
      sofocos: string;
      sudoracionNocturna: string;
      despertaresPorVms: string;
      palpitacionesAsociadas: string;
    };
    eje2: {
      insomnio: string;
      irritabilidad: string;
      ansiedadTension: string;
      nieblaMental: string;
      fatigaCansancio: string;
      dificultadConcentracion: string;
    };
    eje3: {
      sequedadVaginal: string;
      dispareunia: string;
      urgenciaItu: string;
      libido: string;
      orgasmoSatisfaccionSexual: string;
    };
    eje4: {
      presionArterial: string;
      peso: string;
      cintura: string;
      cinturaTalla: string;
      hba1c: string;
      glucosaAyunas: string;
      ldl: string;
      hdl: string;
      trigliceridos: string;
    };
    eje5: {
      dolorArticular: string;
      dolorMuscular: string;
      sensacionDebilidad: string;
      limitacionFuncional: string;
      caidasUltimoAno: string;
      fuerzaFuncional: string;
    };
    calidadVida: {
      impactoGlobalPercibido: string;
    };
  };

  // Laboratorio "Imitadores"
  laboratorio: {
    hemoglobina: string;
    vcm: string;
    ferritina: string;
    tsh: string;
    t4l: string;
    t3l: string;
    vitaminaB12: string;
    vitaminaD25OH: string;
    tgo: string;
    tgp: string;
    fa: string;
    creatinina: string;
    tfg: string;
  };

  // Hormonas Específicas
  hormonas: {
    fsh: string;
    estradiol: string;
    testosteronaTotal: string;
    shbg: string;
  };

  // Tamizajes / Estudios
  tamizajesEstudios: {
    mamografia: string;
    evaluacionMamaria: string;
    tamizajeCervical: string;
    papanicolaou: string;
    ecografiaGinecologica: string;
    pruebaVph: string;
    densitometria: string;
  };

  // Efectos Adversos / Alarmas (Red Block in image)
  alarmas: {
    sangrado: {
      dentro6mIniciarThm: boolean;
      dentro3mModificarThm: boolean;
      fueraEsasVentanas: boolean;
      abundanteProlongado: boolean;
    };
    mastalgia: string;
    cefalea: string;
    edema: string;
    somnolencia: string;
    acne: string;
    hirsutismo: string;
    cambioDeVoz: string;
    sintomaTrombotico: string;
    malaAdherencia: string;
    ansiedadPersistente: string;
    insomnioPersistente: string;
    noBajaCintura: string;
    fatigaSevera: string;
  };

  // Tratamiento
  tratamiento: {
    hormonal: {
      estradiolTdDosis: string;
      progesteronaVoDosis: string;
      testosteronaTdDosis: string;
      pelletTestosteronaFechaDosis: string;
      estradiolVaginal: string;
      lubricanteHidratanteVaginal: string;
    };
    sueroterapia: string[];
    suplementoOral: {
      formulaHampiq: string;
      vitaminaD: string;
      b12: string;
      complejoB: string;
      hierro: string;
      magnesio: string;
      melatonina: string;
      creatina3a5g: string;
      proteina12a15g: string;
    };
    esm1VezPorSem: string;
    ejercicio: {
      fuerza2a3Sem: string;
      aerobica150Min: string;
      caminarDiariamente: string;
    };
  };

  // Diagnóstico
  diagnostico: {
    fecha: string;
    etapa: string;
    motivoConsultaSintomaPrincipal: string;
    simulador: string;
    agravante: string;
    modificador: string;
    ejeDominante: string;
    otrosDiagnosticos: string;
  };
}

export interface HojaControlFila {
  id: string;
  concepto: string;
  valores: Record<string, string>; // citaId -> valor
}

export interface HojaControlData {
  citas: Array<{ id: string; etiqueta: string }>; // Inicial, C1 to C12
  fechas: Record<string, string>; // citaId -> YYYY-MM-DD
  filas: HojaControlFila[];
}

export interface IndicacionGuiaData {
  // Nutricional
  batidoProteicoObjetivo: string;
  batidoOpciones: Array<{ id: string; titulo: string; receta: string }>;
  planSemanal: Array<{
    dia: string;
    desayuno: string;
    almuerzo: string;
    cena: string;
  }>;
  reglasImportantes: string[];
  fuentesProteina: Array<{ id: string; alimento: string; proteina: string }>;

  // Indicación médica
  hormonasLineas: Array<{ id: string; nombre: string; dosis: string }>;
  progesteronaMicronizada: string; // kept for compatibility
  sueroterapiaLineas: Array<{ id: string; periodo: string; indicacion: string }>;
  emsSesiones: string;
  probiotico: string;
  consumoProteinasDiaria: string;
  higieneSuenoPautas: string[];
  cenarMaximoHora: string;

  doctora: {
    nombre: string;
    especialidad: string;
    cmp: string;
    rne: string;
  };
}

export interface NotaVoz {
  id: string;
  fecha: string;
  texto: string;
}

export interface UserSession {
  uid: string;
  email: string;
  nombre: string;
  rol: 'Doctora' | 'Equipo Asistencial';
  especialidad?: string;
  cmp?: string;
  rne?: string;
  emailVerified: boolean;
  providerId: string;
  isAuthenticated: boolean;
}

