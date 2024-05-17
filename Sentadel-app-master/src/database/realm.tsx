import { createRealmContext, Realm } from '@realm/react';
import {
  BarcodeSalesDaily,
  BarcodeSalesR,
  ClientBarcodeSalesR
} from '@sentadell-src/stores/realm/schemas/barcodeSales';
import {
  GradeStorage,
  GradeStorageModel
} from '@sentadell-src/stores/realm/schemas/grades';
import { FetchQueue } from '@sentadell-src/stores/realm/schemas/fetchQueue';
import { PartnerModelR } from '@sentadell-src/stores/realm/schemas/partners';
import { ScaleServer } from '@sentadell-src/stores/realm/schemas/scaleServer';
import {
  GradingQueueData,
  GradingQueueReferenceData
} from '@sentadell-src/stores/realm/schemas/grading';
import {
  GropuingQueueGoodsData,
  GroupingQueueData
} from '@sentadell-src/stores/realm/schemas/grouping';
import { ShipmentQueueData } from '@sentadell-src/stores/realm/schemas/shipment';

const config: Realm.Configuration = {
  path: 'std-project-schema.realm',
  schema: [
    FetchQueue,
    GradingQueueData,
    BarcodeSalesDaily,
    ClientBarcodeSalesR,
    BarcodeSalesR,
    GradeStorage,
    GradeStorageModel,
    GradingQueueReferenceData,
    PartnerModelR,
    ScaleServer,
    GropuingQueueGoodsData,
    GroupingQueueData,
    ShipmentQueueData
  ],
  schemaVersion: 1,
  inMemory: false,
  deleteRealmIfMigrationNeeded: true
};

const RealmCtx = createRealmContext(config);

export { Realm };

export default RealmCtx;
