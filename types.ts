export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  isFinal?: boolean;
}

export interface AudioVisualizerData {
  volume: number; // 0 to 1
  history: number[]; // Array of recent volume levels for wave visualization
}
