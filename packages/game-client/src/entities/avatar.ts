export type AvatarVariant = "student-blue";
export type AvatarDirection = "down" | "up" | "left" | "right";
export type PetVariant = "study-cat";

export type AvatarConfig = {
  id: string;
  variant: AvatarVariant;
  displayName: string;
};

export type PetConfig = {
  id: string;
  variant: PetVariant;
  ownerId: string;
  displayName: string;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  id: "local-player",
  variant: "student-blue",
  displayName: "Estudante",
};

export const DEFAULT_PET: PetConfig = {
  id: "local-pet",
  variant: "study-cat",
  ownerId: DEFAULT_AVATAR.id,
  displayName: "Mimi",
};

export function directionFromVector(dx: number, dy: number): AvatarDirection {
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "left" : "right";
  if (dy < 0) return "up";
  return "down";
}
