// Utilidad genérica para guardar y leer datos JSON en localStorage.
const Storage = {
  leer(clave, valorPorDefecto) {
    try {
      const texto = localStorage.getItem(clave);
      return texto ? JSON.parse(texto) : valorPorDefecto;
    } catch (error) {
      console.error("No se pudieron leer los datos guardados:", error);
      return valorPorDefecto;
    }
  },

  guardar(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      console.error("No se pudieron guardar los datos:", error);
      return false;
    }
  }
};
