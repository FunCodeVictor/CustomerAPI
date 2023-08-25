import { Store } from "./Store";
export type Customer = {
    id: number
    sdpId: number
    customerName: string
    phoneNumber: string
    streetName: string
    stores: Store[]
}