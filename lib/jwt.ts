export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export function extractUserFromJWT(token: string): any {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    id: decoded.sub || decoded.UserId,
    email:
      decoded.email ||
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
    fullName:
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] || decoded.name,
    role:
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.role,
    phoneNumber: decoded.phoneNumber,
  };
}
