/**
 * Convierte cualquier archivo de imagen a formato JPEG, aplicando redimensionamiento
 * (máximo 1200px de ancho/alto) y compresión (calidad del 80%) en el cliente.
 * Esto reduce sustancialmente el peso del archivo antes de subirlo al backend,
 * previniendo errores de límite de paquete de base de datos (ECONNRESET) y reduciendo el almacenamiento.
 */
export function compressAndConvertToJpeg(file: File, maxDimension = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    // Si no es una imagen o es del entorno del servidor, retornar el original
    if (typeof window === "undefined" || !file || !file.type || !file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calcular nuevas dimensiones manteniendo la relación de aspecto
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return resolve(file); // Retorno de respaldo al original
          }

          // Pintar fondo blanco para mantener opacidad en imágenes transparentes (como PNG)
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);

          // Dibujar la imagen redimensionada en el canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir el canvas a Blob en formato JPEG con la calidad definida
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }

              // Reemplazar la extensión del archivo original a .jpg
              const originalName = file.name;
              const lastDotIndex = originalName.lastIndexOf(".");
              const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
              const newFileName = `${baseName}.jpg`;

              const compressedFile = new File([blob], newFileName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            "image/jpeg",
            quality
          );
        } catch (err) {
          console.error("Error al procesar la imagen en canvas:", err);
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
