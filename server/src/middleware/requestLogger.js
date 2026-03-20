// server/src/middleware/requestLogger.js

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color =
      status >= 500 ? "\x1b[31m" :   // red
      status >= 400 ? "\x1b[33m" :   // yellow
      status >= 200 ? "\x1b[32m" :   // green
      "\x1b[36m";                    // cyan

    console.log(
      `${color}[${new Date().toISOString()}] ${method} ${url} → ${status} (${duration}ms)\x1b[0m`
    );
  });

  next();
};