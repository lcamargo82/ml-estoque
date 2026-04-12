import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Salva uma imagem em Base64 como arquivo físico no servidor.
 * Retorna o nome do arquivo gerado.
 */
export const saveBase64Image = async (base64String: string, uploadDir: string): Promise<string> => {
  // Se não for uma string base64 válida de imagem, retorna a própria string (pode ser uma URL externa)
  if (!base64String || !base64String.startsWith('data:image')) {
    return base64String;
  }

  // Garante que o diretório de upload existe
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Extrair a extensão (ex: png, jpeg) e os dados puros (base64)
  const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    // Se falhar o regex mas começar com data:image, tenta uma limpeza básica ou retorna original
    return base64String;
  }

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const imageData = matches[2];
  
  // Gerar um nome único para o arquivo
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
  const filePath = join(uploadDir, fileName);

  // Salvar o arquivo no disco
  try {
    await writeFile(filePath, imageData, 'base64');
    console.log(`Image saved successfully to ${filePath}`);
  } catch (err) {
    console.error(`Failed to write file at ${filePath}:`, err);
    throw err;
  }

  return fileName;
};
