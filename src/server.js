const app = require("./app");

const connectDB = require("./config/db");

(async () => {
  await connectDB();
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
  );
})();
