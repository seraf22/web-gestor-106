import { useState } from 'react';
// Usamos sessionStorage + window.location para evitar errores si no hay contexto de router

import { CheckCircle, AlertCircle } from 'lucide-react';
import { apiUrl, authHeaders } from '../config';

interface AnalysisResult {
  tipo?: string;
  monto?: number;
  categoria?: string;
  descripcion?: string;
  proveedor?: string;
  fecha?: string;
  metodoPago?: string;
}

  export function AnalizarTextoPage() {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AnalysisResult | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  async function handleAnalyze(guardar = false) {
    if (!texto.trim()) {
      setMensaje({ tipo: 'error', texto: 'Ingresa el texto a analizar' });
      return;
    }

    setLoading(true);
    setMensaje(null);

    try {
      const resp = await fetch(apiUrl(`/api/analisis/texto?guardar=${guardar}`), {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      });

      if (!resp.ok) throw new Error('Error al analizar texto');

      const data = await resp.json();
      setResultado(data.analisis || data);

      if (data.guardado) {
        setMensaje({ tipo: 'exito', texto: data.mensaje || 'Analizado y guardado' });
      } else {
        setMensaje({ tipo: 'exito', texto: 'Texto analizado correctamente' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al analizar el texto' });
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmEdit() {
    if (!resultado) return;
    try {
      sessionStorage.setItem('prefillMovimiento', JSON.stringify(resultado));
    } catch {}
    window.location.href = '/nuevo-movimiento';
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Analizar Texto</h2>

      {mensaje && (
        <div className={`p-3 rounded ${mensaje.tipo === 'exito' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {mensaje.tipo === 'exito' ? <CheckCircle size={18} className="inline mr-2" /> : <AlertCircle size={18} className="inline mr-2" />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      <div className="bg-white rounded shadow p-4">
        <label className="block text-sm text-gray-700 mb-2">Pega aquí el texto del comprobante o descripción</label>
        <textarea className="w-full h-40 p-2 border rounded" value={texto} onChange={(e)=>setTexto(e.target.value)} />

        <div className="mt-3 flex gap-2">
          <button onClick={() => handleAnalyze(false)} disabled={loading} className="bg-casa-blue text-white px-4 py-2 rounded">Analizar</button>
          <button onClick={() => handleAnalyze(true)} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">Analizar y Guardar</button>
        </div>
      </div>

      {resultado && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold">Resultado</h3>
          {resultado.tipo && <div><strong>Tipo:</strong> {resultado.tipo}</div>}
          {resultado.monto !== undefined && <div><strong>Monto:</strong> {resultado.monto}</div>}
          {resultado.categoria && <div><strong>Categoría:</strong> {resultado.categoria}</div>}
          {resultado.descripcion && <div><strong>Descripción:</strong> {resultado.descripcion}</div>}
          {resultado.proveedor && <div><strong>Proveedor:</strong> {resultado.proveedor}</div>}
          {resultado.fecha && <div><strong>Fecha:</strong> {resultado.fecha}</div>}
          {resultado.metodoPago && <div><strong>Método de pago:</strong> {resultado.metodoPago}</div>}
          <div className="mt-3">
            <button onClick={handleConfirmEdit} className="bg-yellow-600 text-white px-3 py-1 rounded">Confirmar y editar</button>
          </div>
        </div>
      )}
    </div>
  );
}
