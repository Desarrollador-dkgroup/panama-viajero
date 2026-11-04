import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// Perfil del visitante con sesión: nombre, teléfono y foto (bucket `avatars`, carpeta por usuario).

export type OwnProfile = {
  displayName: string;
  phone: string;
  email: string | null;
  avatarPath: string | null;
};

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("El sitio no tiene configurada la conexión con Supabase.");
  return supabase;
}

async function currentUserId() {
  const { data } = await client().auth.getUser();
  if (!data.user) throw new Error("Inicia sesión para continuar.");
  return data.user.id;
}

export async function loadOwnProfile(): Promise<OwnProfile> {
  const supabase = client();
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, phone, email, avatar_storage_path")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error("No pudimos cargar tu información.");
  return {
    displayName: data?.display_name ?? "",
    phone: data?.phone ?? "",
    email: data?.email ?? null,
    avatarPath: data?.avatar_storage_path ?? null,
  };
}

export async function saveOwnProfile(input: { displayName: string; phone: string }) {
  const name = input.displayName.trim();
  const phone = input.phone.trim();
  if (name.length < 2 || name.length > 80) {
    throw new Error("El nombre debe tener entre 2 y 80 caracteres.");
  }
  if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) {
    throw new Error("Escribe un teléfono válido, por ejemplo +507 6000-0000.");
  }
  const userId = await currentUserId();
  const { error } = await client()
    .from("profiles")
    .update({
      display_name: name,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw new Error("No pudimos guardar tus cambios.");
}

export async function uploadOwnAvatar(file: File): Promise<string> {
  const extension = AVATAR_EXTENSIONS[file.type];
  if (!extension) throw new Error("La foto debe ser JPG, PNG o WEBP.");
  if (file.size > MAX_AVATAR_BYTES) throw new Error("La foto no puede pesar más de 3 MB.");

  const supabase = client();
  const userId = await currentUserId();
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from("avatars").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upload.error) throw new Error("No pudimos subir la foto.");

  const { data: previous } = await supabase
    .from("profiles")
    .select("avatar_storage_path")
    .eq("id", userId)
    .maybeSingle();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_storage_path: path, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error("No pudimos guardar tu foto.");

  if (previous?.avatar_storage_path) {
    await supabase.storage.from("avatars").remove([previous.avatar_storage_path]);
  }
  return path;
}
