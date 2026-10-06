"use server";
import { updateNote, type NoteInput } from "@/lib/api/notes";

export async function updateNoteAction(
  id: string,
  input: Partial<Pick<NoteInput, "type" | "content" | "tags">>,
) {
  return updateNote(id, input);
}
