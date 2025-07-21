import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";

const API_KEY = "ff1c239d7ec4784d9c323dc5468beee1";

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null);
  const [reseñas, setReseñas] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      setUsuario(user);

      const q = query(collection(db, "reseñas"), where("user.uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const datos = snapshot.docs.map((doc) => doc.data());
      setReseñas(datos);

      // Fetch detalles de partidos reseñados
      const ids = datos.map((r) => r.partidoId);
      const detalles: any = {};
      await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
            headers: { "x-apisports-key": API_KEY },
          });
          const json = await res.json();
          if (json.response?.length) {
            detalles[id] = json.response[0];
          }
        })
      );
      setPartidos(detalles);
    });

    return () => unsub();
  }, [router]);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Mi perfil</h1>

      {usuario && (
        <div className="flex items-center gap-4">
          <img src={usuario.photoURL} alt="avatar" className="w-16 h-16 rounded-full" />
          <div>
            <p className="text-xl font-semibold">{usuario.displayName}</p>
            <p className="text-gray-600 text-sm">{usuario.email}</p>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Mis reseñas</h2>
        {reseñas.length === 0 ? (
          <p className="text-gray-500">No has escrito ninguna reseña todavía.</p>
        ) : (
          reseñas.map((r, i) => {
            const partido = partidos[r.partidoId];
            return (
              <Card key={i}>
                <CardContent className="p-4 space-y-1">
                  <p className="text-sm">{r.texto}</p>
                  <p className="text-xs text-gray-500">{new Date(r.fecha).toLocaleString()}</p>
                  {partido && (
                    <div className="text-xs text-gray-700">
                      <p>
                        <strong>
                          {partido.teams.home.name} vs {partido.teams.away.name}
                        </strong>
                      </p>
                      <p>
                        Marcador: {partido.goals.home} - {partido.goals.away}
                      </p>
                      <p>{new Date(partido.fixture.date).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </main>
  );
}
