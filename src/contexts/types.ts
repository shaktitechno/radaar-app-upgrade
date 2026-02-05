import { Dispatch, SetStateAction } from "react"

export interface callingdDataType {

    "conversation_id" : string | undefined, 
    "responder_id" : string | undefined,
    "initiator_id" : string | undefined,
    "call_status": "Missed"| "Declined"| "Connected" | undefined,
    "call_type" :  "Video" | "Audio" | undefined,
    "logs_id"?:string | undefined,
    duration?:number
}
export interface SignupContextType {
    callingData:callingdDataType
    setCallingData:Dispatch<SetStateAction<callingdDataType >>
}