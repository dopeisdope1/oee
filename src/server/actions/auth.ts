"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithDiscordAction() {
  await signIn("discord", { redirectTo: "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
