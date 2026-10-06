"use server";
import { createNote, type NoteInput } from "@/lib/api/notes";

export async function createNoteAction(input: NoteInput) {
  return createNote(input);
}
