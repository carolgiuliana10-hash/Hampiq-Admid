/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Layers,
  FlaskConical,
  AlertTriangle,
  Pill,
} from 'lucide-react';
import { HCCita } from '../types/clinical';

export interface MatrixTablesSharedProps {
  citas: HCCita[];
  activeCitaIndex: number;
  onSelectCita: (index: number) => void;
  onUpdateCita: (index: number, updater: (cita: HCCita) => HCCita) => void;
  onAddCita: () => void;
  onDeleteCita: (index: number) => void;
}

interface TextRowDef {
  id: string;
  label: string;
  placeholder?: string;
  getValue: (cita: HCCita) => string;
  setValue: (cita: HCCita, val: string) => HCCita;
}

interface MatrixGroupDef {
  groupTitle: string;
  rows: TextRowDef[];
}

interface CheckboxRowDef {
  id: string;
  label: string;
  dangerLabel?: boolean;
  getChecked: (cita: HCCita) => boolean;
  setChecked: (cita: HCCita, checked: boolean) => HCCita;
}

function renderAppointmentThead(
  firstColLabel: string,
  props: MatrixTablesSharedProps,
  colMinWidth = 'min-w-[155px]',
  accent: 'sky' | 'rose' = 'sky'
) {
  const { citas, activeCitaIndex, onSelectCita, onUpdateCita, onDeleteCita } = props;
  return (
    <thead>
      {/* Appointment Columns */}
      <tr className="bg-slate-50/95 border-b border-sky-100">
        <th className="py-2.5 px-3 sm:px-4 font-bold text-slate-800 w-48 sm:w-60 min-w-[175px] sm:min-w-[220px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]">
          {firstColLabel}
        </th>
        {citas.map((cita, idx) => {
          const isActive = idx === activeCitaIndex;
          const activeTh =
            accent === 'rose'
              ? 'bg-rose-100/90 text-rose-950 font-extrabold ring-1 ring-rose-300 ring-inset'
              : 'bg-sky-100/90 text-sky-950 font-extrabold ring-1 ring-sky-300 ring-inset';
          return (
            <th
              key={cita.id}
              onClick={() => onSelectCita(idx)}
              className={`py-2.5 px-2.5 text-center ${colMinWidth} border-r border-slate-100 cursor-pointer transition select-none ${
                isActive ? activeTh : 'text-slate-700 font-bold hover:bg-sky-50/70'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="uppercase tracking-wide">{cita.etiqueta}</span>
                {citas.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCita(idx);
                    }}
                    title={`Eliminar cita ${cita.etiqueta}`}
                    className="no-print p-0.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </th>
          );
        })}
      </tr>

      {/* Fecha Row */}
      <tr
        className={`border-b-2 ${
          accent === 'rose' ? 'border-rose-200 bg-rose-50/35' : 'border-sky-200 bg-sky-50/40'
        }`}
      >
        <td
          className={`py-2 px-4 font-bold sticky left-0 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)] ${
            accent === 'rose' ? 'text-rose-950 bg-rose-50/95' : 'text-sky-900 bg-sky-50/95'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Calendar
              className={`w-3.5 h-3.5 shrink-0 ${
                accent === 'rose' ? 'text-rose-600' : 'text-sky-600'
              }`}
            />
            <span>Fecha</span>
          </div>
        </td>
        {citas.map((cita, idx) => {
          const isActive = idx === activeCitaIndex;
          return (
            <td
              key={cita.id}
              className={`py-1.5 px-2 border-r border-slate-100 ${
                isActive ? (accent === 'rose' ? 'bg-rose-100/40' : 'bg-sky-100/50') : ''
              }`}
            >
              <input
                type="date"
                value={cita.fecha || ''}
                onFocus={() => onSelectCita(idx)}
                onChange={(e) =>
                  onUpdateCita(idx, (c) => ({
                    ...c,
                    fecha: e.target.value,
                    diagnostico: { ...c.diagnostico, fecha: e.target.value },
                  }))
                }
                className={`w-full px-2 py-1 rounded-lg text-[11px] font-semibold outline-hidden border ${
                  isActive
                    ? 'bg-white border-sky-300 text-sky-950'
                    : 'bg-white/90 border-slate-200 text-slate-800'
                }`}
              />
            </td>
          );
        })}
      </tr>
    </thead>
  );
}

function renderGroupedTextRows(
  groups: MatrixGroupDef[],
  props: MatrixTablesSharedProps,
  accent: 'sky' | 'rose' = 'sky'
) {
  const { citas, activeCitaIndex, onSelectCita, onUpdateCita } = props;
  const colSpan = citas.length + 1;

  return groups.map((group) => (
    <React.Fragment key={group.groupTitle}>
      <tr
        className={
          accent === 'rose'
            ? 'bg-rose-50/75 border-y border-rose-200/80'
            : 'bg-sky-50/80 border-y border-sky-100'
        }
      >
        <td
          colSpan={colSpan}
          className={`py-2 px-4 font-bold text-[11px] uppercase tracking-wide ${
            accent === 'rose' ? 'text-rose-950' : 'text-sky-950'
          }`}
        >
          <span className="sticky left-4 inline-block">{group.groupTitle}</span>
        </td>
      </tr>

      {group.rows.map((row) => (
        <tr key={row.id} className="hover:bg-slate-50/60 transition">
          <td className="py-1.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
            {row.label}
          </td>
          {citas.map((cita, idx) => {
            const isActive = idx === activeCitaIndex;
            return (
              <td
                key={cita.id}
                className={`py-1 px-2 border-r border-slate-100 ${
                  isActive ? (accent === 'rose' ? 'bg-rose-50/35' : 'bg-sky-50/40') : ''
                }`}
              >
                <input
                  type="text"
                  placeholder={row.placeholder || 'Registrar...'}
                  value={row.getValue(cita)}
                  onFocus={() => onSelectCita(idx)}
                  onChange={(e) => onUpdateCita(idx, (c) => row.setValue(c, e.target.value))}
                  className={`w-full px-2 py-1 rounded-lg text-xs outline-hidden border transition text-slate-800 ${
                    isActive
                      ? 'bg-white border-sky-200 focus:border-sky-400'
                      : 'bg-slate-50/70 hover:bg-white focus:bg-white border-slate-200/80 focus:border-sky-300'
                  }`}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </React.Fragment>
  ));
}

export const CincoEjesMatrixTable: React.FC<MatrixTablesSharedProps> = (props) => {
  const { citas, onAddCita } = props;

  const groups: MatrixGroupDef[] = [
    {
      groupTitle: 'EJE 1: vasomotor / hormonal',
      rows: [
        {
          id: 'eje1_sofocos',
          label: 'Sofocos',
          getValue: (c) => c.cincoEjes.eje1.sofocos,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje1: { ...c.cincoEjes.eje1, sofocos: v } },
          }),
        },
        {
          id: 'eje1_sudoracion',
          label: 'Sudoración nocturna',
          getValue: (c) => c.cincoEjes.eje1.sudoracionNocturna,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: {
              ...c.cincoEjes,
              eje1: { ...c.cincoEjes.eje1, sudoracionNocturna: v },
            },
          }),
        },
        {
          id: 'eje1_despertares',
          label: 'Despertares por VMS',
          getValue: (c) => c.cincoEjes.eje1.despertaresPorVms,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje1: { ...c.cincoEjes.eje1, despertaresPorVms: v } },
          }),
        },
        {
          id: 'eje1_palpitaciones',
          label: 'Palpitaciones asociadas',
          getValue: (c) => c.cincoEjes.eje1.palpitacionesAsociadas,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: {
              ...c.cincoEjes,
              eje1: { ...c.cincoEjes.eje1, palpitacionesAsociadas: v },
            },
          }),
        },
      ],
    },
    {
      groupTitle: 'EJE 2: neurológico / sueño / psicoemocional',
      rows: [
        {
          id: 'eje2_insomnio',
          label: 'Insomnio',
          getValue: (c) => c.cincoEjes.eje2.insomnio,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje2: { ...c.cincoEjes.eje2, insomnio: v } },
          }),
        },
        {
          id: 'eje2_irritabilidad',
          label: 'Irritabilidad',
          getValue: (c) => c.cincoEjes.eje2.irritabilidad,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje2: { ...c.cincoEjes.eje2, irritabilidad: v } },
          }),
        },
        {
          id: 'eje2_ansiedad',
          label: 'Ansiedad/tensión',
          getValue: (c) => c.cincoEjes.eje2.ansiedadTension,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje2: { ...c.cincoEjes.eje2, ansiedadTension: v } },
          }),
        },
        {
          id: 'eje2_niebla',
          label: 'Niebla mental',
          getValue: (c) => c.cincoEjes.eje2.nieblaMental,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje2: { ...c.cincoEjes.eje2, nieblaMental: v } },
          }),
        },
        {
          id: 'eje2_fatiga',
          label: 'Fatiga/cansancio',
          getValue: (c) => c.cincoEjes.eje2.fatigaCansancio,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje2: { ...c.cincoEjes.eje2, fatigaCansancio: v } },
          }),
        },
        {
          id: 'eje2_concentracion',
          label: 'Dificultad concentración',
          getValue: (c) => c.cincoEjes.eje2.dificultadConcentracion,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: {
              ...c.cincoEjes,
              eje2: { ...c.cincoEjes.eje2, dificultadConcentracion: v },
            },
          }),
        },
      ],
    },
    {
      groupTitle: 'EJE 3: genitourinario / sexual',
      rows: [
        {
          id: 'eje3_sequedad',
          label: 'Sequedad vaginal',
          getValue: (c) => c.cincoEjes.eje3.sequedadVaginal,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje3: { ...c.cincoEjes.eje3, sequedadVaginal: v } },
          }),
        },
        {
          id: 'eje3_dispareunia',
          label: 'Dispareunia',
          getValue: (c) => c.cincoEjes.eje3.dispareunia,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje3: { ...c.cincoEjes.eje3, dispareunia: v } },
          }),
        },
        {
          id: 'eje3_urgencia',
          label: 'Urgencia/ITU',
          getValue: (c) => c.cincoEjes.eje3.urgenciaItu,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje3: { ...c.cincoEjes.eje3, urgenciaItu: v } },
          }),
        },
        {
          id: 'eje3_libido',
          label: 'Libido',
          getValue: (c) => c.cincoEjes.eje3.libido,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje3: { ...c.cincoEjes.eje3, libido: v } },
          }),
        },
        {
          id: 'eje3_orgasmo',
          label: 'Orgasmo/satisfacción',
          getValue: (c) => c.cincoEjes.eje3.orgasmoSatisfaccionSexual,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: {
              ...c.cincoEjes,
              eje3: { ...c.cincoEjes.eje3, orgasmoSatisfaccionSexual: v },
            },
          }),
        },
      ],
    },
    {
      groupTitle: 'EJE 4: cardiometabólico / composición corporal',
      rows: [
        {
          id: 'eje4_pa',
          label: 'Presión arterial',
          getValue: (c) => c.cincoEjes.eje4.presionArterial,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje4: { ...c.cincoEjes.eje4, presionArterial: v } },
          }),
        },
        {
          id: 'eje4_hba1c',
          label: 'HbA1c',
          getValue: (c) => c.cincoEjes.eje4.hba1c,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje4: { ...c.cincoEjes.eje4, hba1c: v } },
          }),
        },
        {
          id: 'eje4_glucosa',
          label: 'Glucosa ayunas',
          getValue: (c) => c.cincoEjes.eje4.glucosaAyunas,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje4: { ...c.cincoEjes.eje4, glucosaAyunas: v } },
          }),
        },
        {
          id: 'eje4_ldl',
          label: 'LDL',
          getValue: (c) => c.cincoEjes.eje4.ldl,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje4: { ...c.cincoEjes.eje4, ldl: v } },
          }),
        },
        {
          id: 'eje4_hdl',
          label: 'HDL',
          getValue: (c) => c.cincoEjes.eje4.hdl,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje4: { ...c.cincoEjes.eje4, hdl: v } },
          }),
        },
        {
          id: 'eje4_tg',
          label: 'Triglicéridos',
          getValue: (c) => c.cincoEjes.eje4.trigliceridos,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje4: { ...c.cincoEjes.eje4, trigliceridos: v } },
          }),
        },
      ],
    },
    {
      groupTitle: 'EJE 5: musculoesquelético / hueso / función',
      rows: [
        {
          id: 'eje5_articular',
          label: 'Dolor articular',
          getValue: (c) => c.cincoEjes.eje5.dolorArticular,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje5: { ...c.cincoEjes.eje5, dolorArticular: v } },
          }),
        },
        {
          id: 'eje5_muscular',
          label: 'Dolor muscular',
          getValue: (c) => c.cincoEjes.eje5.dolorMuscular,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje5: { ...c.cincoEjes.eje5, dolorMuscular: v } },
          }),
        },
        {
          id: 'eje5_debilidad',
          label: 'Sensación de debilidad',
          getValue: (c) => c.cincoEjes.eje5.sensacionDebilidad,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje5: { ...c.cincoEjes.eje5, sensacionDebilidad: v } },
          }),
        },
        {
          id: 'eje5_limitacion',
          label: 'Limitación funcional',
          getValue: (c) => c.cincoEjes.eje5.limitacionFuncional,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje5: { ...c.cincoEjes.eje5, limitacionFuncional: v } },
          }),
        },
        {
          id: 'eje5_caidas',
          label: 'Caídas último año',
          getValue: (c) => c.cincoEjes.eje5.caidasUltimoAno,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje5: { ...c.cincoEjes.eje5, caidasUltimoAno: v } },
          }),
        },
        {
          id: 'eje5_fuerza',
          label: 'Fuerza funcional *',
          getValue: (c) => c.cincoEjes.eje5.fuerzaFuncional,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: { ...c.cincoEjes, eje5: { ...c.cincoEjes.eje5, fuerzaFuncional: v } },
          }),
        },
      ],
    },
    {
      groupTitle: 'Calidad de vida',
      rows: [
        {
          id: 'calidad_vida_impacto',
          label: 'Impacto global percibido',
          placeholder: 'Ej. 7/10',
          getValue: (c) => c.cincoEjes.calidadVida.impactoGlobalPercibido,
          setValue: (c, v) => ({
            ...c,
            cincoEjes: {
              ...c.cincoEjes,
              calidadVida: { impactoGlobalPercibido: v },
            },
          }),
        },
      ],
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden text-xs">
      <div className="px-5 py-3.5 bg-slate-50/90 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            LOS 5 EJES CLÍNICOS
          </h3>
          <span className="text-[11px] bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-md border border-sky-200/80 whitespace-nowrap shrink-0">
            {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddCita}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Cita</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          {renderAppointmentThead('Eje / Síntoma', props, 'min-w-[150px]')}
          <tbody className="divide-y divide-slate-100">
            {renderGroupedTextRows(groups, props)}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const LaboratorioMatrixTable: React.FC<MatrixTablesSharedProps> = (props) => {
  const { citas, onAddCita } = props;

  const groups: MatrixGroupDef[] = [
    {
      groupTitle: 'Laboratorio - "Imitadores"',
      rows: (
        [
          ['hemoglobina', 'Hemoglobina'],
          ['vcm', 'VCM'],
          ['ferritina', 'Ferritina'],
          ['tsh', 'TSH'],
          ['t4l', 'T4L'],
          ['t3l', 'T3L'],
          ['vitaminaB12', 'Vitamina B12'],
          ['vitaminaD25OH', '25-OH-vitamina D'],
          ['tgo', 'TGO'],
          ['tgp', 'TGP'],
          ['fa', 'FA'],
          ['creatinina', 'Creatinina'],
          ['tfg', 'TFG'],
        ] as Array<[keyof HCCita['laboratorio'], string]>
      ).map(([k, label]) => ({
        id: `lab_${String(k)}`,
        label,
        getValue: (c) => c.laboratorio[k] || '',
        setValue: (c, v) => ({ ...c, laboratorio: { ...c.laboratorio, [k]: v } }),
      })),
    },
    {
      groupTitle: 'Hormonas específicas',
      rows: (
        [
          ['fsh', 'FSH – hormona foliculoestimulante'],
          ['estradiol', 'Estradiol'],
          ['testosteronaTotal', 'Testosterona total'],
          ['shbg', 'SHBG – globulina fijadora'],
        ] as Array<[keyof HCCita['hormonas'], string]>
      ).map(([k, label]) => ({
        id: `horm_${String(k)}`,
        label,
        getValue: (c) => c.hormonas[k] || '',
        setValue: (c, v) => ({ ...c, hormonas: { ...c.hormonas, [k]: v } }),
      })),
    },
    {
      groupTitle: 'Tamizajes / estudios',
      rows: (
        [
          ['mamografia', 'Mamografía'],
          ['evaluacionMamaria', 'Evaluación mamaria'],
          ['tamizajeCervical', 'Tamizaje cervical'],
          ['papanicolaou', 'Papanicolaou'],
          ['ecografiaGinecologica', 'Ecografía ginecológica *'],
          ['pruebaVph', 'Prueba VPH'],
          ['densitometria', 'Densitometría'],
        ] as Array<[keyof HCCita['tamizajesEstudios'], string]>
      ).map(([k, label]) => ({
        id: `tam_${String(k)}`,
        label,
        getValue: (c) => c.tamizajesEstudios[k] || '',
        setValue: (c, v) => ({
          ...c,
          tamizajesEstudios: { ...c.tamizajesEstudios, [k]: v },
        }),
      })),
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden text-xs">
      <div className="px-5 py-3.5 bg-slate-50/90 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-sky-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            LABORATORIO - &quot;IMITADORES&quot; Y HORMONAS
          </h3>
          <span className="text-[11px] bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-md border border-sky-200/80 whitespace-nowrap shrink-0">
            {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddCita}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Cita</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          {renderAppointmentThead('Estudio / Analito', props, 'min-w-[150px]')}
          <tbody className="divide-y divide-slate-100">
            {renderGroupedTextRows(groups, props)}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const AlarmasMatrixTable: React.FC<MatrixTablesSharedProps> = (props) => {
  const { citas, activeCitaIndex, onSelectCita, onUpdateCita, onAddCita } = props;

  const sangradoRows: CheckboxRowDef[] = [
    {
      id: 'sangrado_6m',
      label: 'Sangrado — Dentro de 6 meses de iniciar THM',
      getChecked: (c) => Boolean(c.alarmas.sangrado.dentro6mIniciarThm),
      setChecked: (c, checked) => ({
        ...c,
        alarmas: {
          ...c.alarmas,
          sangrado: { ...c.alarmas.sangrado, dentro6mIniciarThm: checked },
        },
      }),
    },
    {
      id: 'sangrado_3m',
      label: 'Sangrado — Dentro de 3 meses de modificar THM',
      getChecked: (c) => Boolean(c.alarmas.sangrado.dentro3mModificarThm),
      setChecked: (c, checked) => ({
        ...c,
        alarmas: {
          ...c.alarmas,
          sangrado: { ...c.alarmas.sangrado, dentro3mModificarThm: checked },
        },
      }),
    },
    {
      id: 'sangrado_fuera',
      label: 'Sangrado — Fuera de esas ventanas',
      dangerLabel: true,
      getChecked: (c) => Boolean(c.alarmas.sangrado.fueraEsasVentanas),
      setChecked: (c, checked) => ({
        ...c,
        alarmas: {
          ...c.alarmas,
          sangrado: { ...c.alarmas.sangrado, fueraEsasVentanas: checked },
        },
      }),
    },
    {
      id: 'sangrado_abundante',
      label: 'Sangrado — Abundante / prolongado',
      dangerLabel: true,
      getChecked: (c) => Boolean(c.alarmas.sangrado.abundanteProlongado),
      setChecked: (c, checked) => ({
        ...c,
        alarmas: {
          ...c.alarmas,
          sangrado: { ...c.alarmas.sangrado, abundanteProlongado: checked },
        },
      }),
    },
  ];

  const alarmGroups: MatrixGroupDef[] = [
    {
      groupTitle: 'Parámetros de Supervisión Clínica',
      rows: (
        [
          ['mastalgia', 'Mastalgia'],
          ['cefalea', 'Cefalea'],
          ['edema', 'Edema'],
          ['somnolencia', 'Somnolencia'],
          ['acne', 'Acné'],
          ['hirsutismo', 'Hirsutismo'],
          ['cambioDeVoz', 'Cambio de voz'],
          ['sintomaTrombotico', 'Síntoma trombótico'],
          ['malaAdherencia', 'Mala adherencia'],
          ['ansiedadPersistente', 'Ansiedad persistente'],
          ['insomnioPersistente', 'Insomnio persistente'],
          ['noBajaCintura', 'No baja cintura'],
          ['fatigaSevera', 'Fatiga severa'],
        ] as Array<[Exclude<keyof HCCita['alarmas'], 'sangrado'>, string]>
      ).map(([k, label]) => ({
        id: `alarm_${String(k)}`,
        label,
        placeholder: 'No / detalle',
        getValue: (c) => (c.alarmas[k] as string) || '',
        setValue: (c, v) => ({ ...c, alarmas: { ...c.alarmas, [k]: v } }),
      })),
    },
  ];

  return (
    <section className="bg-white rounded-2xl border-2 border-rose-300 shadow-xs overflow-hidden text-xs">
      <div className="bg-rose-600 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-100 shrink-0" />
          <h3 className="text-sm font-bold uppercase tracking-wide">
            EFECTOS ADVERSOS / ALARMAS DURANTE EL TRATAMIENTO
          </h3>
          <span className="text-[11px] bg-rose-700/80 text-rose-50 font-semibold px-2 py-0.5 rounded-md border border-rose-400/50 whitespace-nowrap shrink-0">
            Supervisión Clínica · {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddCita}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Cita</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          {renderAppointmentThead('Signo / Alarma', props, 'min-w-[150px]', 'rose')}
          <tbody className="divide-y divide-slate-100">
            {/* Sangrado group header */}
            <tr className="bg-rose-50/75 border-y border-rose-200/80">
              <td
                colSpan={citas.length + 1}
                className="py-2 px-4 font-bold text-[11px] uppercase tracking-wide text-rose-950"
              >
                <span className="sticky left-4 inline-block">Sangrado (Ventanas clínicas)</span>
              </td>
            </tr>

            {sangradoRows.map((row) => (
              <tr key={row.id} className="hover:bg-rose-50/30 transition">
                <td
                  className={`py-1.5 px-4 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)] ${
                    row.dangerLabel ? 'font-bold text-rose-800' : 'font-semibold text-slate-700'
                  }`}
                >
                  {row.label}
                </td>
                {citas.map((cita, idx) => {
                  const isActive = idx === activeCitaIndex;
                  const checked = row.getChecked(cita);
                  return (
                    <td
                      key={cita.id}
                      className={`py-1.5 px-2 text-center border-r border-slate-100 ${
                        isActive ? 'bg-rose-50/35' : ''
                      }`}
                    >
                      <label className="inline-flex items-center justify-center gap-1.5 cursor-pointer select-none px-2 py-0.5 rounded-md hover:bg-rose-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            onSelectCita(idx);
                            onUpdateCita(idx, (c) => row.setChecked(c, e.target.checked));
                          }}
                          className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span
                          className={`text-[11px] font-medium ${
                            checked ? 'text-rose-700 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {checked ? 'Sí' : 'No'}
                        </span>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}

            {renderGroupedTextRows(alarmGroups, props, 'rose')}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const TratamientoMatrixTable: React.FC<MatrixTablesSharedProps> = (props) => {
  const { citas, onAddCita } = props;

  const groups: MatrixGroupDef[] = [
    {
      groupTitle: 'Tratamiento hormonal',
      rows: [
        {
          id: 'thm_estradiol_td',
          label: 'Estradiol TD/dosis',
          getValue: (c) => c.tratamiento.hormonal.estradiolTdDosis,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              hormonal: { ...c.tratamiento.hormonal, estradiolTdDosis: v },
            },
          }),
        },
        {
          id: 'thm_progesterona_vo',
          label: 'Progesterona VO/dosis',
          getValue: (c) => c.tratamiento.hormonal.progesteronaVoDosis,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              hormonal: { ...c.tratamiento.hormonal, progesteronaVoDosis: v },
            },
          }),
        },
        {
          id: 'thm_testosterona_td',
          label: 'Testosterona TD/dosis',
          getValue: (c) => c.tratamiento.hormonal.testosteronaTdDosis,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              hormonal: { ...c.tratamiento.hormonal, testosteronaTdDosis: v },
            },
          }),
        },
        {
          id: 'thm_pellet',
          label: 'Pellet Testosterona fecha/dosis',
          getValue: (c) => c.tratamiento.hormonal.pelletTestosteronaFechaDosis,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              hormonal: { ...c.tratamiento.hormonal, pelletTestosteronaFechaDosis: v },
            },
          }),
        },
        {
          id: 'thm_estradiol_vag',
          label: 'Estradiol vaginal',
          getValue: (c) => c.tratamiento.hormonal.estradiolVaginal,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              hormonal: { ...c.tratamiento.hormonal, estradiolVaginal: v },
            },
          }),
        },
        {
          id: 'thm_lubricante',
          label: 'Lubricante/Hidratante vaginal',
          getValue: (c) => c.tratamiento.hormonal.lubricanteHidratanteVaginal,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              hormonal: { ...c.tratamiento.hormonal, lubricanteHidratanteVaginal: v },
            },
          }),
        },
      ],
    },
    {
      groupTitle: 'Sueroterapia',
      rows: [
        {
          id: 'trat_sueroterapia',
          label: 'Sueroterapia (filas libres)',
          placeholder: 'NAD+ 10ml EV, DETOX, Megadosis Vit C...',
          getValue: (c) => c.tratamiento.sueroterapia.join(', '),
          setValue: (c, v) => ({
            ...c,
            tratamiento: { ...c.tratamiento, sueroterapia: [v] },
          }),
        },
      ],
    },
    {
      groupTitle: 'Suplemento oral',
      rows: (
        [
          ['formulaHampiq', 'Formula Hampiq'],
          ['vitaminaD', 'Vitamina D'],
          ['b12', 'B12'],
          ['complejoB', 'Complejo B'],
          ['hierro', 'Hierro'],
          ['magnesio', 'Magnesio'],
          ['melatonina', 'Melatonina'],
          ['creatina3a5g', 'Creatina 3-5 g/día'],
          ['proteina12a15g', 'Proteína 1.2-1.5 kg/d'],
        ] as Array<[keyof HCCita['tratamiento']['suplementoOral'], string]>
      ).map(([k, label]) => ({
        id: `sup_${String(k)}`,
        label,
        getValue: (c) => c.tratamiento.suplementoOral[k] || '',
        setValue: (c, v) => ({
          ...c,
          tratamiento: {
            ...c.tratamiento,
            suplementoOral: { ...c.tratamiento.suplementoOral, [k]: v },
          },
        }),
      })),
    },
    {
      groupTitle: 'ESM y Ejercicio',
      rows: [
        {
          id: 'trat_esm',
          label: 'ESM: 1 vez por sem',
          getValue: (c) => c.tratamiento.esm1VezPorSem,
          setValue: (c, v) => ({
            ...c,
            tratamiento: { ...c.tratamiento, esm1VezPorSem: v },
          }),
        },
        {
          id: 'ej_fuerza',
          label: 'Ejercicio fuerza 2–3 veces/semana',
          getValue: (c) => c.tratamiento.ejercicio.fuerza2a3Sem,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              ejercicio: { ...c.tratamiento.ejercicio, fuerza2a3Sem: v },
            },
          }),
        },
        {
          id: 'ej_aerobica',
          label: '≥150 min/semana actividad aeróbica moderada',
          getValue: (c) => c.tratamiento.ejercicio.aerobica150Min,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              ejercicio: { ...c.tratamiento.ejercicio, aerobica150Min: v },
            },
          }),
        },
        {
          id: 'ej_caminar',
          label: 'Caminar diariamente',
          getValue: (c) => c.tratamiento.ejercicio.caminarDiariamente,
          setValue: (c, v) => ({
            ...c,
            tratamiento: {
              ...c.tratamiento,
              ejercicio: { ...c.tratamiento.ejercicio, caminarDiariamente: v },
            },
          }),
        },
      ],
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden text-xs">
      <div className="px-5 py-3.5 bg-slate-50/90 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-sky-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            TRATAMIENTO PRESCRITO
          </h3>
          <span className="text-[11px] bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-md border border-sky-200/80 whitespace-nowrap shrink-0">
            {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddCita}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Cita</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          {renderAppointmentThead('Tratamiento / Indicación', props, 'min-w-[165px]')}
          <tbody className="divide-y divide-slate-100">
            {renderGroupedTextRows(groups, props)}
          </tbody>
        </table>
      </div>
    </section>
  );
};
