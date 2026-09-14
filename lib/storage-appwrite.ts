/**
 * Utilidades para procesamiento de imágenes del Portal del Trabajador
 * - Compresión en cliente (HTML5 Canvas + WebP) para reducir 5MB a ~70KB
 * - Cola offline para guardado en localStorage ante pérdida de señal en obra
 */

export async function compressImageFile(file: File, maxWidth = 1280, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error al leer el archivo de imagen"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error al procesar la imagen"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Exportar a WebP de alta compresión o JPEG si WebP no está soportado
        try {
          const compressedData = canvas.toDataURL("image/webp", quality);
          resolve(compressedData);
        } catch {
          const fallbackData = canvas.toDataURL("image/jpeg", quality);
          resolve(fallbackData);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export interface ReporteOffline {
  id: string;
  tareaId: string;
  fecha: string;
  fotos: string[];
  comentario?: string;
  herramientaUsada?: string;
  eppVerificado: boolean;
  esProblema?: boolean;
}

const OFFLINE_QUEUE_KEY = "obralogix_offline_reportes_v1";

export function saveOfflineReport(reporte: ReporteOffline): void {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const list: ReporteOffline[] = raw ? JSON.parse(raw) : [];
    list.push(reporte);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Error guardando reporte offline:", err);
  }
}

export function getOfflineReports(): ReporteOffline[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removeOfflineReport(id: string): void {
  try {
    const reports = getOfflineReports().filter((r) => r.id !== id);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error("Error removiendo reporte offline:", err);
  }
}
