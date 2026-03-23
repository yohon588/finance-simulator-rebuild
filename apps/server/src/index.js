import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import { loadModuleConfig } from "./config/module-config.js";
import { createRouter } from "./routes/index.js";
import { createFileRepository, createInMemoryRepository } from "./services/repository.js";
import { createPostgresRepository } from "./services/postgres-repository.js";

const port = Number(process.env.PORT || 3100);
const moduleConfig = loadModuleConfig();
const webDistDir = path.resolve(process.cwd(), "apps/web/dist");
const staticMimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function serveStaticFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = staticMimeTypes[extension] ?? "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(response);
}

function tryServeWeb(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }
  if (!fs.existsSync(webDistDir)) {
    return false;
  }

  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  const requestPath = decodeURIComponent(requestUrl.pathname);
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const candidatePath = path.resolve(webDistDir, `.${normalizedPath}`);

  if (candidatePath.startsWith(webDistDir) && fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    serveStaticFile(response, candidatePath);
    return true;
  }

  if (!requestPath.startsWith("/api") && !requestPath.startsWith("/health")) {
    const fallbackPath = path.join(webDistDir, "index.html");
    if (fs.existsSync(fallbackPath)) {
      serveStaticFile(response, fallbackPath);
      return true;
    }
  }

  return false;
}

async function createRepository() {
  if (process.env.DATABASE_URL) {
    return createPostgresRepository(process.env.DATABASE_URL);
  }

  if (process.env.STORE_MODE === "memory") {
    return createInMemoryRepository();
  }

  return createFileRepository(path.resolve(process.cwd(), "apps/server/.data/repository.json"));
}

const repository = await createRepository();
const router = createRouter({ moduleConfig, repository });

const server = http.createServer((request, response) => {
  if (tryServeWeb(request, response)) {
    return;
  }
  router(request, response);
});

server.listen(port, () => {
  console.log(`Finance simulator rebuild server listening on http://localhost:${port}`);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`Received ${signal}, shutting down finance simulator rebuild server...`);

  server.close(async () => {
    try {
      if (typeof repository.close === "function") {
        await repository.close();
      }
    } finally {
      process.exit(0);
    }
  });

  setTimeout(async () => {
    try {
      if (typeof repository.close === "function") {
        await repository.close();
      }
    } finally {
      process.exit(1);
    }
  }, 5000).unref();
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
