import { useState } from 'react';
// Usamos sessionStorage + window.location para evitar errores si no hay contexto de router

import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
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

  export function AnalizarDocumentoPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AnalysisResult | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [guardar, setGuardar] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset
    setResultado(null);
    setMensaje(null);
  }

  async function handleAnalyze() {
    if (!archivo) {
      setMensaje({ tipo: 'error', texto: 'Por favor selecciona un archivo' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const response = await fetch(apiUrl(`/api/analisis/documento?guardar=${guardar}`), {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });

      if (!response.ok) throw new Error('Error al analizar documento');

      const data = await response.json();
      setResultado(data.analisis || data);

      if (data.guardado) {
        setMensaje({
          tipo: 'exito',
          texto: data.mensaje || 'Documento analizado y guardado exitosamente',
        });
      } else {
        setMensaje({ tipo: 'exito', texto: 'Documento analizado correctamente' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al analizar el documento' });
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
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-0 space-y-4 lg:space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Analizar Documento</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Upload Area */}
        <div className="space-y-3 lg:space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 lg:p-8 text-center cursor-pointer hover:border-casa-blue transition"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <Upload className="mx-auto mb-2 lg:mb-3 text-gray-400" size={28} />
              <p className="text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">
                Arrastra el archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500">
                Formatos soportados: JPG, PNG, PDF (máximo 10 MB)
              </p>
              <input
                id="fileInput"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {archivo && (
              <div className="mt-3 lg:mt-4 p-2 lg:p-3 bg-blue-50 border border-blue-200 rounded text-xs lg:text-sm">
                <p className="text-blue-900">
                  ✓ Archivo seleccionado: {archivo.name}
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && archivo?.type.startsWith('image/') && (
            <div className="bg-white rounded-lg shadow-md p-3 lg:p-4">
              <img
                src={preview}
                alt="preview"
                className="w-full rounded max-h-72 object-contain"
              />
            </div>
          )}

          {/* Opciones */}
          <div className="bg-white rounded-lg shadow-md p-3 lg:p-4">
            <label className="flex items-center gap-2 lg:gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={guardar}
                onChange={(e) => setGuardar(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs lg:text-sm text-gray-700">
                Guardar como movimiento después de analizar
              </span>
            </label>
          </div>

          {/* Botón */}
          <button
            onClick={handleAnalyze}
            disabled={!archivo || loading}
            className="w-full bg-casa-blue text-white font-semibold py-2 lg:py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm lg:text-base"
          >
            {loading ? 'Analizando...' : 'Analizar Documento'}
          </button>
        </div>

        {/* Resultados */}
        <div className="space-y-3 lg:space-y-4">
          {mensaje && (
            <div
              className={`p-3 lg:p-4 rounded-lg flex gap-2 lg:gap-3 text-xs lg:text-sm ${
                mensaje.tipo === 'exito'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {mensaje.tipo === 'exito' ? (
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <span>{mensaje.texto}</span>
            </div>
          )}

          {resultado && (
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 space-y-3 lg:space-y-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Resultado del Análisis</h3>

              {resultado.tipo && (
                <div>
                  <label className="text-xs lg:text-sm font-medium text-gray-700">Tipo</label>
                  <p className="mt-1 px-2 lg:px-3 py-2 bg-gray-50 rounded text-xs lg:text-sm">
                    {resultado.tipo}
                  </p>
                </div>
              )}

              {resultado.monto && (
                <div>
                  <label className="text-xs lg:text-sm font-medium text-gray-700">Monto</label>
                  <p className="mt-1 px-2 lg:px-3 py-2 bg-gray-50 rounded text-base lg:text-lg font-semibold text-casa-blue">
                    {resultado.monto.toLocaleString('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                    })}
                  </p>
                </div>
              )}

              <div>
                <button onClick={handleConfirmEdit} className="bg-yellow-600 text-white px-3 py-1 rounded">Confirmar y editar</button>
              </div>

              {resultado.categoria && (
                <div>
                  <label className="text-xs lg:text-sm font-medium text-gray-700">Categoría</label>
                  <p className="mt-1 px-2 lg:px-3 py-2 bg-gray-50 rounded text-xs lg:text-sm">
                    {resultado.categoria}
                  </p>
                </div>
              )}

              {resultado.descripcion && (
                <div>
                  <label className="text-xs lg:text-sm font-medium text-gray-700">Descripción</label>
                  <p className="mt-1 px-2 lg:px-3 py-2 bg-gray-50 rounded text-xs lg:text-sm">
                    {resultado.descripcion}
                  </p>
                </div>
              )}

              {resultado.proveedor && (
                <div>
                  <label className="text-xs lg:text-sm font-medium text-gray-700">Proveedor</label>
                  <p className="mt-1 px-2 lg:px-3 py-2 bg-gray-50 rounded text-xs lg:text-sm">
                    {resultado.proveedor}
                  </p>
                </div>
              )}

              {resultado.metodoPago && (
                <div>
                  <label className="text-xs lg:text-sm font-medium text-gray-700">Método de Pago</label>
                  <p className="mt-1 px-2 lg:px-3 py-2 bg-gray-50 rounded text-xs lg:text-sm">
                    {resultado.metodoPago}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
