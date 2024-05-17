import { ShipmentQueueData } from '@sentadell-src/stores/realm/schemas/shipment';
import { AddressModel, ClientModel } from './clients';

export type CreateShipmentFormProps = {
  shipment_type: ShipmentQueueData['shipment_type'];
  client_data: ClientModel;
  address_data: AddressModel;
  license_plate: ShipmentQueueData['license_plate'];
  driver: ShipmentQueueData['driver'];
  pic: ShipmentQueueData['pic'];
};
