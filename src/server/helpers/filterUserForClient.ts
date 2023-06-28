import { User } from "@clerk/backend/dist/types/api";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profileImageUrl,
  };
};
