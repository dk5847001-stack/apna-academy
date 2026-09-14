import api from "./api";
const unwrap=r=>r?.data?.data??r?.data??{};
export const listAdminMessages=async(params={})=>unwrap(await api.get("/admin/messages",{params}));
export const getAdminMessage=async(id)=>unwrap(await api.get(`/admin/messages/${encodeURIComponent(id)}`));
export const updateAdminMessage=async(id,payload)=>unwrap(await api.patch(`/admin/messages/${encodeURIComponent(id)}`,payload));
