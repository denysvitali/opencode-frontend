export interface ResourceMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage (0-100)
    cores: number;
    frequency: number; // GHz
    processes: number;
  };
  memory: {
    used: number; // bytes
    available: number; // bytes
    total: number; // bytes
    usage: number; // percentage (0-100)
    swap?: {
      used: number;
      total: number;
    };
  };
  disk: {
    used: number; // bytes
    available: number; // bytes
    total: number; // bytes
    usage: number; // percentage (0-100)
    readSpeed: number; // bytes/sec
    writeSpeed: number; // bytes/sec
    iops: number; // operations per second
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number; // ms
  };
  gpu?: {
    usage: number; // percentage
    memory: {
      used: number;
      total: number;
    };
    temperature: number; // celsius
  };
}

export interface WorkspaceResourceStatus {
  workspaceId: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastUpdate: Date;
  metrics: ResourceMetrics;
  alerts: ResourceAlert[];
  limits: ResourceLimits;
  uptime: number; // seconds
}

export interface ResourceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'gpu';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface ResourceLimits {
  cpu: {
    maxUsage: number; // percentage
    maxCores: number;
  };
  memory: {
    maxUsage: number; // bytes
    warningThreshold: number; // percentage
  };
  disk: {
    maxUsage: number; // bytes
    warningThreshold: number; // percentage
  };
  network: {
    maxBandwidth: number; // bytes/sec
  };
  processes: {
    maxCount: number;
  };
}

export interface ResourceHistory {
  workspaceId: string;
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  interval: number; // seconds between data points
  metrics: ResourceMetrics[];
}

export interface ResourcePrediction {
  workspaceId: string;
  predictedAt: Date;
  horizon: number; // hours into the future
  predictions: {
    cpu: { timestamp: Date; value: number }[];
    memory: { timestamp: Date; value: number }[];
    disk: { timestamp: Date; value: number }[];
  };
  confidence: number; // 0-1
}

export interface ContainerStats {
  containerId: string;
  name: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting';
  metrics: ResourceMetrics;
  logs: {
    stdout: string[];
    stderr: string[];
  };
  restartCount: number;
  startedAt: Date;
  finishedAt?: Date;
}