import api from "./api";

const ensureSuccess = (response, fallbackMessage) => {
  if (!response?.data?.success) {
    throw new Error(response?.data?.message || fallbackMessage);
  }

  return response.data.data ?? null;
};

export const getProfile = async () => {
  const response = await api.get("/profile");
  return ensureSuccess(response, "Unable to load your profile.");
};

export const updateProfile = async ({ name, phone, avatar }) => {
  const response = await api.patch("/profile", {
    name,
    phone,
    avatar,
  });

  return ensureSuccess(response, "Unable to update your profile.");
};

const profileService = {
  getProfile,
  updateProfile,
};

export default profileService;