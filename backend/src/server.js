// Server bootstrap: loads environment, imports the configured Express app,
// and starts the HTTP server listening on the configured port.
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

// Default port can be overridden with the PORT env var
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

