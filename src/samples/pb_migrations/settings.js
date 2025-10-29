/// <reference path="../.pb/pb_data/types.d.ts" />

const CONFIG_SETTINGS = // #CONFIG_SETTINGS# //
const CONFIG_SUPERUSERS = // #CONFIG_SUPERUSERS# //

migrate(
  (app) => {
    let settings = app.settings();

    const insertSettings = (configSettings, pbSettings = {}) => {
      if (Array.isArray(configSettings)) {
        // ensure pbSettings is an array
        if (!Array.isArray(pbSettings)) pbSettings = [];
        configSettings.forEach((item, i) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            pbSettings[i] = insertSettings(item, pbSettings[i] || {});
          } else {
            pbSettings[i] = item;
          }
        });
        return pbSettings;
      }

      if (configSettings && typeof configSettings === "object") {
        // ensure pbSettings is an object
        if (
          typeof pbSettings !== "object" ||
          pbSettings === null ||
          Array.isArray(pbSettings)
        ) {
          pbSettings = {};
        }

        Object.entries(configSettings).forEach(([key, value]) => {
          if (value && typeof value === "object") {
            pbSettings[key] = insertSettings(value, pbSettings[key]);
          } else {
            pbSettings[key] = value;
          }
        });
      }

      return pbSettings;
    };
    insertSettings(CONFIG_SETTINGS, settings);

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
