export function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "127.0.0.1"
  )
}

export function generateGroupId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function validateGroupData(title, description, options) {
  const errors = []

  if (!title || title.trim().length === 0) {
    errors.push("Title is required")
  }

  if (!description || description.trim().length === 0) {
    errors.push("Description is required")
  }

  if (!options || options.length < 2) {
    errors.push("At least 2 options are required")
  }

  if (options) {
    const uniqueOptions = [...new Set(options.filter((opt) => opt.trim().length > 0))]
    if (uniqueOptions.length !== options.length) {
      errors.push("All options must be unique and non-empty")
    }
  }

  return errors
}
