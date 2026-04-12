/**
 * Utilitário para formatar URLs de imagens de forma dinâmica.
 * Garante que as imagens sempre usem o IP atual configurado no App,
 * independentemente do que está salvo no banco de dados.
 */
export const getImageUrl = (url: any): string => {
  if (!url) return 'https://placehold.co/400x400/1e293b/ffffff?text=Sem+Foto';
  
  // Caso o dado venha como objeto (legado do banco) em vez de string
  let targetUrl = typeof url === 'string' ? url : url.url;
  
  if (!targetUrl || typeof targetUrl !== 'string') {
    return 'https://placehold.co/400x400/1e293b/ffffff?text=Erro+Imagem';
  }

  // Se for Base64 (captura recente) ou blob, retorna como está
  if (targetUrl.startsWith('data:') || targetUrl.startsWith('blob:')) {
    return targetUrl;
  }

  // Se for uma URL completa via placeholder externo, mantemos
  if (targetUrl.includes('placehold.co') || targetUrl.includes('placeholder.com')) {
    return targetUrl;
  }

  // Extraímos apenas o nome do arquivo final (ex: "123456-789.jpg")
  const fileName = targetUrl.split('/').pop();
  
  // Pegamos a baseURL da API do ambiente atual (ex: http://192.168.15.13:3000/api/v1)
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  
  // Removemos o '/api/v1' do final para apontar para a raiz (onde o static serve o /uploads)
  const serverRoot = apiBase.replace(/\/api\/v1\/?$/, '');
  
  // Retornamos a URL reconstruída e "fresca" com o IP atual
  return `${serverRoot}/uploads/${fileName}`;
};
