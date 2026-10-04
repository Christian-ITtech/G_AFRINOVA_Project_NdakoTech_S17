const API_URL = import.meta.env.VITE_API_URL;

export async function fetchHello() {
  const res = await fetch(`${API_URL}/hello`);
  if (!res.ok) throw new Error('Erreur serveur');
  return res.json();
}