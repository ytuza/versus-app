import axios from 'axios';

/**
 * Convierte una URL relativa de imagen en una URL completa
 * @param imageUrl - URL relativa de la imagen (ej: /media/payment_proofs/image.jpg)
 * @returns URL completa de la imagen
 */
export const getFullImageUrl = (imageUrl: string | null | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  
  // Si ya es una URL completa, devolverla tal como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si es una URL relativa, agregar la URL base
  return `${axios.defaults.baseURL}${imageUrl}`;
};

/**
 * Procesa un array de transacciones para agregar URLs completas a las imágenes
 * @param transactions - Array de transacciones
 * @returns Array de transacciones con URLs completas de imágenes
 */
export const processTransactionImages = (transactions: any[]) => {
  return transactions.map(transaction => ({
    ...transaction,
    payment_image: getFullImageUrl(transaction.payment_image)
  }));
};
