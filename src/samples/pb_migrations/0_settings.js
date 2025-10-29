/// <reference path="../.pb/pb_data/types.d.ts" />

// PUT HERE YOUR POCKETBASE INSTANCE SETTINGS //

migrate((app) => {
  let settings = app.settings();

  // App settings

  // settings.meta.appName = "foo"

  app.save(settings);
});
