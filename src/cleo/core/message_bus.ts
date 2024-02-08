
export class Message{
    name: string;
    topics: string[];
    data: Map<string, string>;
    constructor(name: string, topics: string[], data: Map<string, string> | null = null){
        this.name = name;
        this.topics = topics;
        this.data = data ?? new Map();
    }
}

export class MessageBus{
    //
}