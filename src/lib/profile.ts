import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// Perfil del visitante con sesión: nombre, teléfono y foto (bucket `avatars`, carpeta por usuario).

export type OwnProfile = {
  displayName: string;
  lastName: string;
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

async function currentUser() {
  const { data } = await client().auth.getUser();
  if (!data.user) throw new Error("Inicia sesión para continuar.");
  return data.user;
}

export async function loadOwnProfile(): Promise<OwnProfile> {
  const supabase = client();
  const user = await currentUser();
  const userId = user.id;
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, last_name, phone, avatar_storage_path")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error("No pudimos cargar tu información.");
  return {
    displayName: data?.display_name ?? "",
    lastName: data?.last_name ?? "",
    phone: data?.phone ?? "",
    email: user.email ?? null,
    avatarPath: data?.avatar_storage_path ?? null,
  };
}

export async function saveOwnProfile(input: {
  displayName: string;
  lastName: string;
  phone: string;
  email: string;
}): Promise<{ emailPending: boolean }> {
  const name = input.displayName.trim();
  const lastName = input.lastName.trim();
  if (lastName.length > 80) throw new Error("El apellido no puede tener más de 80 caracteres.");
  const phone = input.phone.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2 || name.length > 80) {
    throw new Error("El nombre debe tener entre 2 y 80 caracteres.");
  }
  if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) {
    throw new Error("Escribe un teléfono válido, por ejemplo +507 6000-0000.");
  }
  const supabase = client();
  const user = await currentUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: name,
      last_name: lastName || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) throw new Error("No pudimos guardar tus cambios.");

  const currentEmail = (user.email ?? "").toLowerCase();
  if (!email || email === currentEmail) return { emailPending: false };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Escribe un correo válido.");
  const change = await supabase.auth.updateUser({ email });
  if (change.error) throw new Error(change.error.message);
  return { emailPending: true };
}

export async function uploadOwnAvatar(file: File): Promise<string> {
  const extension = AVATAR_EXTENSIONS[file.type];
  if (!extension) throw new Error("La foto debe ser JPG, PNG o WEBP.");
  if (file.size > MAX_AVATAR_BYTES) throw new Error("La foto no puede pesar más de 3 MB.");

  const supabase = client();
  const userId = (await currentUser()).id;
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
