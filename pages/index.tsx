import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

const API_KEY = "ff1c239d7ec4784d9c323dc5468beee1";
const provider = new GoogleAuthProvider();

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [partidos, setPartidos] = useState([]);
  const [reseñas, setReseñas] = useState<any>({});
  const [textos, setTextos] = useState<any>({});

  useEffect(() => {
    auth.onAuthStateChanged((usuario) => setUser(usuario));

    fetch("https://v3.football.api-sports.io/fixtures?league=140&season=2024&last=5", {
      headers: {
        "x-apisports-key": API_KEY,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPartidos(data.response);
        data.response.forEach((match: any) => {
          const q = query(
            collection(db, "reseñas"),
            where("partidoId", "==", match.fixture.id)
          );
          onSnapshot(q, (snapshot) => {
            setReseñas((prev: any) => ({
              ...prev,
              [match.fixture.id]: snapshot.docs.map((doc) => doc.data()),
            }));
          });
        });
      });
  }, []);

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handlePost = async (id: string) => {
    const texto = textos[id]?.trim();
    if (!texto || !user) return;

    await addDoc(collection(db, "reseñas"), {
      partidoId: id,
      texto,
      fecha: new Date().toISOString(),
      user: {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });
    setTextos({ ...textos, [id]: "" });
  };

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sportsboxd</h1>
        {user ? (
          <div className="flex items-center gap-2">
            <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
            <span>{user.displayName}</span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin}>Iniciar sesión con Google</Button>
        )}
      </div>

      {partidos.map((match: any) => (
        <Card key={match.fixture.id}>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xl font-semibold">
              {match.teams.home.name} vs {match.teams.away.name}
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(match.fixture.date).toLocaleString()}
            </p>
            <p>
              Marcador: <strong>{match.goals.home} - {match.goals.away}</strong>
            </p>

            {user && (
              <>
                <Textarea
                  value={textos[match.fixture.id] || ""}
                  onChange={(e) =>
                    setTextos({ ...textos, [match.fixture.id]: e.target.value })
                  }
                  placeholder="Tu reseña de este partido..."
                />
                <Button onClick={() => handlePost(match.fixture.id)}>Publicar</Button>
              </>
            )}

            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-sm">Reseñas</h4>
              {(reseñas[match.fixture.id] || []).map((r: any, i: number) => (
                <div key={i} className="border p-2 rounded text-sm">
                  <p>{r.texto}</p>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>{new Date(r.fecha).toLocaleString()}</span>
                    <span>{r.user.displayName}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
