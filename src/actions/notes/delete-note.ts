"use server";
import { deleteNote } from "@/lib/api/notes";

export async function deleteNoteAction(id: string) {
  return deleteNote(id);
}
