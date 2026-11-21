export function parseError(data) {
  if (!data || !data.detail) return "Something went wrong";

  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail)) {
    const err = data.detail[0];
    const field = err.loc?.[err.loc.length - 1];

    if (field === "original_url") {
      return "Please enter a valid URL (e.g. https://example.com)";
    }
    return err.msg;
  }

  return "Something went wrong";
}