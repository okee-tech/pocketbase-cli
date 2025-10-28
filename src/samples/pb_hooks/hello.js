/// <reference path="../.pb/pb_data/types.d.ts" />

onRecordBeforeCreateRequest((e) => {
  console.log("A record is about to be created in", e.collection.name);
});
