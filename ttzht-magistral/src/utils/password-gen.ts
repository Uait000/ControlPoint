export const generateSafePassword = (): string => {
  // Исключаем: I, l, 1 (похожи), 0, O (похожи)
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let password = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    password += alphabet[randomIndex];
  }
  return password;
};