/// <reference path="../.pb/pb_data/types.d.ts" />

migrate(
  (app) => {
    let settings = app.settings();

    const inserSettings = (configSettings, pbSettings) => {
      if (typeof configSettings == "array")
        return configSettings.forEach((item) =>
          inserSettings(item, pbSettings)
        );

      if (typeof configSettings == "object")
        Object.entries(configSettings).forEach(([key, value]) => {
          if (typeof value == "object" || typeof value == "array")
            return inserSettings(value, pbSettings[key]);

          pbSettings[key] = value;
        });
    };
    inserSettings;

    app.save(settings);

    let superusers = app.findCollectionByNameOrId("_superusers");

    let record = new Record(superusers);

    CONFIG_SUPERUSERS.forEach((item) => {
      record.set("email", item.email);
      record.set("password", item.password);
    });

    app.save(record);
  },
  (app) => {
    CONFIG_SUPERUSERS.forEach((item) => {
      try {
        let record = app.findAuthRecordByEmail("_superusers", item.email);
        app.delete(record);
      } catch {
        // no such record
      }
    });
  }
);
