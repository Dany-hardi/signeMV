// ============================================================
// src/services/adminAuthService.ts
// Gestion sécurisée de l'authentification CMS par Hachage Cryptographique SHA-256
// AUCUN MOT DE PASSE EN CLAIR DANS LE CODE SOURCE
// ============================================================

const PASSWORD_HASH_KEY = 'signemv_admin_password_hash';

/** Génère un hash SHA-256 sécurisé pour ne jamais stocker ni comparer de texte en clair */
async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AdminAuthService = {
  /** Vérifie l'exactitude du mot de passe fourni via comparaison de hash SHA-256 */
  async verifyPassword(input: string): Promise<boolean> {
    if (!input || !input.trim()) return false;

    const inputHash = await hashPassword(input);
    const storedHash = localStorage.getItem(PASSWORD_HASH_KEY);

    if (storedHash) {
      return inputHash === storedHash;
    }

    // Si une variable d'environnement VITE_ADMIN_PASSWORD est définie, comparer son hash
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD;
    if (envPass) {
      const envHash = await hashPassword(envPass);
      return inputHash === envHash;
    }

    // Première initialisation : enregistrer le hash dès la première saisie valide (>= 6 caractères)
    if (input.trim().length >= 6) {
      localStorage.setItem(PASSWORD_HASH_KEY, inputHash);
      return true;
    }

    return false;
  },

  /** Modifie le mot de passe avec double confirmation et enregistrement du hash SHA-256 */
  async updatePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    const isValidOld = await this.verifyPassword(oldPassword);
    if (!isValidOld) {
      return { success: false, message: "L'ancien mot de passe est incorrect." };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, message: "Le nouveau mot de passe doit comporter au moins 6 caractères." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: "Les deux saisies du nouveau mot de passe ne correspondent pas." };
    }

    // Hachage cryptographique du nouveau mot de passe
    const newHash = await hashPassword(newPassword);
    localStorage.setItem(PASSWORD_HASH_KEY, newHash);

    return { success: true, message: "Le mot de passe administrateur a été modifié et sécurisé avec succès !" };
  }
};
