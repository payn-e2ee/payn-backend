interface MessageFrameDTO {
    header: MessageHeaderDTO;
    ciphertext: string;
    auth_tag: string;
}

interface AttachmentDTO {
    id: string;
    bucket_name: string;
    object_name: string;
    original_file_name: string;
    original_file_size: number;
    created_at: string;
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

    attachment: AttachmentDTO | null;
    message_type: MessageTypeDTO;
}

type MessageTypeDTO = "text" | "file" | "image" | "video" | "voice";
