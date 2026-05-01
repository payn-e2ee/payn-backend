interface MessageFrameDTO {
    header: MessageHeaderDTO;
    ciphertext: string;
    auth_tag: string;
}

interface MessageHeaderDTO {
    chat_id: string;

    sender_user_id: string;
    sender_device_id: string;
    recipient_user_id: string;
    recipient_device_id: string;

    message_id: string;
    sender_identity_key: string;
    sender_ephemeral_public_key: string;
    message_counter: number;
}