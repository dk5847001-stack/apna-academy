import api from "./api";
const unwrap=(r)=>r?.data?.data??r?.data??{};
export const getPromoAnalytics=async(params={})=>unwrap(await api.get("/admin/promocodes/analytics/summary",{params}));
export const getPromoAudit=async(params={})=>unwrap(await api.get("/admin/promocodes/audit/events",{params}));
