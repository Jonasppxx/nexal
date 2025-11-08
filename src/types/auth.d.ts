// Global Type Augmentations
import type { DefaultSession } from "better-auth/types";

declare module "better-auth/types" {
  interface User {
    role: string;
  }
  
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      role: string;
    };
  }
}
