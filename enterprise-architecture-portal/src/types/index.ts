export interface Diagram {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: DiagramCategory;
  subcategory: string;
  type: DiagramType;
  tags: string[];
  content: string; // Mermaid, SVG, or React component
  format: 'mermaid' | 'svg' | 'react' | 'canvas';
  imageUrl?: string;
  relatedDiagrams: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  author?: string;
  version: string;
}

export type DiagramCategory = 
  | 'database'
  | 'architecture'
  | 'workflow'
  | 'security'
  | 'ui-ux'
  | 'infrastructure'
  | 'mobile'
  | 'api'
  | 'devops'
  | 'business'
  | 'user-journey'
  | 'deployment';

export type DiagramType =
  | 'erd'
  | 'flowchart'
  | 'sequence'
  | 'state-machine'
  | 'class-diagram'
  | 'deployment'
  | 'network'
  | 'timeline'
  | 'gantt'
  | 'wireframe'
  | 'mockup'
  | 'architecture'
  | 'graph'
  | 'matrix';

export interface DiagramMetadata {
  category: DiagramCategory;
  subcategory: string;
  tags: string[];
  relatedTo: string[];
  complexity: 'low' | 'medium' | 'high';
  updateFrequency: 'static' | 'quarterly' | 'monthly' | 'weekly';
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  actor: string;
  action: string;
  previousSteps: string[];
  nextSteps: string[];
  conditions?: {
    condition: string;
    trueSteps: string[];
    falseSteps: string[];
  }[];
  decisions?: Array<{
    question: string;
    options: Array<{ text: string; nextSteps: string[] }>;
  }>;
}

export interface SystemFlow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  startPoint: string;
  endPoints: string[];
  actors: string[];
  systems: string[];
}

export interface DatabaseTable {
  name: string;
  nameAr?: string;
  description: string;
  fields: DatabaseField[];
  primaryKey: string[];
  foreignKeys: ForeignKeyConstraint[];
  indexes: IndexDefinition[];
  triggers?: TriggerDefinition[];
  archival?: ArchivalPolicy;
}

export interface DatabaseField {
  name: string;
  type: string;
  nullable: boolean;
  unique: boolean;
  default?: string;
  description: string;
  validation?: string;
}

export interface ForeignKeyConstraint {
  name: string;
  localField: string;
  referencedTable: string;
  referencedField: string;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique: boolean;
  type: 'BTREE' | 'HASH' | 'FULLTEXT';
}

export interface TriggerDefinition {
  name: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  timing: 'BEFORE' | 'AFTER';
  body: string;
}

export interface ArchivalPolicy {
  enabled: boolean;
  archiveAfterDays: number;
  archiveTable: string;
  retentionDays: number;
}

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  authentication: 'none' | 'api-key' | 'bearer' | 'oauth2';
  requestBody?: {
    required: boolean;
    schema: Record<string, unknown>;
  };
  response: {
    status: number;
    schema: Record<string, unknown>;
  };
  rateLimit?: {
    requests: number;
    period: number; // seconds
  };
  examples?: APIExample[];
}

export interface APIExample {
  name: string;
  request: string;
  response: string;
}

export interface SecurityPolicy {
  name: string;
  description: string;
  type: 'authentication' | 'authorization' | 'encryption' | 'audit';
  rules: string[];
  violations?: string[];
  mitigations: string[];
}

export interface UserRole {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  permissions: string[];
  responsibilities: string[];
  constraints?: string[];
}

export interface UIScreen {
  id: string;
  name: string;
  route: string;
  description: string;
  wireframe: string; // SVG or image
  mockup?: string;
  components: UIComponent[];
  states: ScreenState[];
  interactions: UIInteraction[];
}

export interface UIComponent {
  id: string;
  name: string;
  type: 'button' | 'input' | 'table' | 'form' | 'chart' | 'modal' | 'menu' | 'card';
  props?: Record<string, unknown>;
}

export interface ScreenState {
  name: string;
  description: string;
  conditions: string[];
  display: Record<string, unknown>;
}

export interface UIInteraction {
  trigger: string;
  action: string;
  result: string;
  nextScreen?: string;
}

export interface DeploymentConfig {
  name: string;
  environment: 'dev' | 'staging' | 'production';
  infrastructure: string;
  nodes: DeploymentNode[];
  services: DeploymentService[];
  networking: NetworkConfig;
  storage: StorageConfig;
  monitoring: MonitoringConfig;
}

export interface DeploymentNode {
  id: string;
  name: string;
  type: 'master' | 'worker' | 'cache' | 'database' | 'storage';
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  scaling?: AutoScalingPolicy;
}

export interface AutoScalingPolicy {
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
}

export interface DeploymentService {
  id: string;
  name: string;
  image: string;
  replicas: number;
  port: number;
  environment: Record<string, string>;
  resources: {
    cpuRequest: string;
    cpuLimit: string;
    memoryRequest: string;
    memoryLimit: string;
  };
}

export interface NetworkConfig {
  vpcCidr: string;
  subnets: SubnetConfig[];
  loadBalancers: LoadBalancerConfig[];
  securityGroups: SecurityGroupConfig[];
}

export interface SubnetConfig {
  name: string;
  cidr: string;
  tier: 'public' | 'private';
  availabilityZone: string;
}

export interface LoadBalancerConfig {
  name: string;
  type: 'alb' | 'nlb';
  targetGroups: string[];
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
  };
}

export interface SecurityGroupConfig {
  name: string;
  inboundRules: FirewallRule[];
  outboundRules: FirewallRule[];
}

export interface FirewallRule {
  protocol: 'tcp' | 'udp' | 'icmp';
  port: number | [number, number];
  source: string;
  description: string;
}

export interface StorageConfig {
  type: 's3' | 'efs' | 'ebs' | 'rds';
  capacity: string;
  redundancy: 'single' | 'multi-az' | 'multi-region';
  backup: BackupConfig;
}

export interface BackupConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  retention: number; // days
  multiRegion: boolean;
}

export interface MonitoringConfig {
  metrics: string[];
  logging: LoggingConfig;
  alerting: AlertConfig;
  tracing: TracingConfig;
}

export interface LoggingConfig {
  provider: 'cloudwatch' | 'elk' | 'splunk';
  logGroups: string[];
  retention: number;
}

export interface AlertConfig {
  alerting_tool: 'datadog' | 'prometheus' | 'pagerduty';
  rules: AlertRule[];
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notifications: string[];
}

export interface TracingConfig {
  provider: 'jaeger' | 'zipkin' | 'datadog';
  sampleRate: number;
  exporters: string[];
}

export interface PhaseDeliverable {
  phase: number;
  title: string;
  description: string;
  duration: string;
  tasks: Task[];
  dependencies: number[];
  deliverables: string[];
  resources: string[];
  risks: Risk[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  duration: number; // days
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Risk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}
