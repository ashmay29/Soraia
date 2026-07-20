import { handlers } from "@/auth";

export const runtime = "nodejs"; // bcrypt and the Mongo driver need Node, not edge

export const { GET, POST } = handlers;
