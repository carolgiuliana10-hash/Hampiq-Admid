import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultIndicacionGuia, createDefaultHojaControl } from './storage';

test('createDefaultIndicacionGuia initializes all editable sections requested by doctor', () => {
  const indicacion = createDefaultIndicacionGuia();

  // 1. Hormonas with row adding support
  assert.ok(Array.isArray(indicacion.hormonasLineas));
  assert.ok(indicacion.hormonasLineas.length >= 1);
  assert.equal(indicacion.hormonasLineas[0].nombre, 'PROGESTERONA (Progesterona micronizada)');

  // 5. Consumo de proteínas diaria
  assert.ok(typeof indicacion.consumoProteinasDiaria === 'string');
  assert.ok(indicacion.consumoProteinasDiaria.includes('Consumo de proteínas'));

  // 6. Higiene del sueño editable pautas
  assert.ok(Array.isArray(indicacion.higieneSuenoPautas));
  assert.equal(indicacion.higieneSuenoPautas.length, 10);
  assert.ok(indicacion.higieneSuenoPautas[0].includes('Dormir misma hora'));

  // 7. Cenar máximo
  assert.ok(typeof indicacion.cenarMaximoHora === 'string');
  assert.equal(indicacion.cenarMaximoHora, '7:00 pm');

  // 3. Reglas importantes de la región
  assert.ok(Array.isArray(indicacion.reglasImportantes));
  assert.equal(indicacion.reglasImportantes.length, 7);

  // 4. Fuentes de proteína de la región
  assert.ok(Array.isArray(indicacion.fuentesProteina));
  assert.equal(indicacion.fuentesProteina.length, 9);
  assert.equal(indicacion.fuentesProteina[0].alimento, '2 huevos');
  assert.equal(indicacion.fuentesProteina[0].proteina, '12 g');
});

test('createDefaultHojaControl initializes 12 consultation columns and standard clinical rows', () => {
  const hc = createDefaultHojaControl();
  assert.equal(hc.citas.length, 13); // Inicial + C1 to C12
  assert.equal(hc.citas[0].etiqueta, 'Inicial');
  assert.equal(hc.citas[1].etiqueta, 'C1');
  assert.equal(hc.citas[12].etiqueta, 'C12');
  assert.ok(hc.filas.some(f => f.concepto === 'ESM'));
  assert.ok(hc.filas.some(f => f.concepto === 'Sueroterapia'));
  assert.ok(hc.filas.some(f => f.concepto === 'Estrogeno'));
  assert.ok(hc.filas.some(f => f.concepto === 'Progesterona'));
  assert.ok(hc.filas.some(f => f.concepto === 'Testosterona'));
});
