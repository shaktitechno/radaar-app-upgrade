// Define the base types for individual elements
interface User {
    _id: string;
    first_name: string;
    last_name: string;
}

interface Media {
    _id?: string;
    userId?: string;
    mediaUrl: string;
    mediaType: string;
    status?: string;
    createdAt?: string;
    __v?: number;
}

export interface Message {
    _id: string;
    sender: string;
    message: string;
    message_state: 'delivered' | 'sent' | 'seen'|'pending';
    conversationId: string;
    timestamp: Date | string ;
    __v: number;
    message_type:'text' | 'emoji' | 'image',
    mediaUrl?:string,
    isReplay:boolean,
    toWhichReplied?:any
}

// Define the main data structure type
export interface ChatData {
    _id: string;
    participants?: string[];
    requestStatus?: 'pending' | 'rejected' | 'accepted';
    initiator?: string;
    responder?: string;
    user: User;
    media: Media[];
    messages: Message[];
}

export interface chatData {
    unreadMesage?:boolean,
    loading:boolean;
    data:ChatData[] | []
}
// export interface token {
//     token:string
// }
