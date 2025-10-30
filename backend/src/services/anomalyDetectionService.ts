import { anomalyLogger } from '../utils/logger';

export interface AnomalyDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  anomalyScore: number; // 0-1, where 1 is most anomalous
  confidence: number; // 0-1, confidence in the detection
  anomalyType: 'spike' | 'drop' | 'trend_change' | 'pattern_break' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedValue?: number;
  actualValue: number;
  deviation: number; // How much it deviates from expected
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AnomalyModel {
  id: string;
  name: string;
  type: 'statistical' | 'machine_learning' | 'rule_based';
  parameters: Record<string, any>;
  trainingData: AnomalyDataPoint[];
  isTrained: boolean;
  accuracy?: number;
  lastTrained?: Date;
}

export interface AnomalyAlert {
  id: string;
  orgId: string;
  rpcId?: string;
  metricName: string;
  anomaly: AnomalyDetectionResult;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  pattern: string; // Regular expression or pattern description
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: Date;
}

export class AnomalyDetectionService {
  private anomalyModels: Map<string, AnomalyModel> = new Map();
  private anomalyAlerts: Map<string, AnomalyAlert[]> = new Map();
  private anomalyPatterns: Map<string, AnomalyPattern> = new Map();
  private historicalData: Map<string, AnomalyDataPoint[]> = new Map();
  private detectionThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultModels();
    this.initializeDefaultPatterns();
    this.startAnomalyDetection();
    anomalyLogger.info('AnomalyDetectionService initialized');
  }

  private initializeDefaultModels(): void {
    // Statistical anomaly detection model
    const statisticalModel: AnomalyModel = {
      id: 'statistical-zscore',
      name: 'Z-Score Statistical Model',
      type: 'statistical',
      parameters: {
        threshold: 2.5, // Z-score threshold
        windowSize: 100, // Number of data points to consider
        minDataPoints: 20, // Minimum data points required
      },
      trainingData: [],
      isTrained: false,
    };

    // Machine learning model (simplified)
    const mlModel: AnomalyModel = {
      id: 'ml-isolation-forest',
      name: 'Isolation Forest ML Model',
      type: 'machine_learning',
      parameters: {
        contamination: 0.1, // Expected proportion of anomalies
        nEstimators: 100,
        maxSamples: 256,
      },
      trainingData: [],
      isTrained: false,
    };

    // Rule-based model
    const ruleModel: AnomalyModel = {
      id: 'rule-based-thresholds',
      name: 'Rule-Based Threshold Model',
      type: 'rule_based',
      parameters: {
        spikeThreshold: 3.0, // 3x normal value
        dropThreshold: 0.3, // 30% of normal value
        trendChangeThreshold: 0.5, // 50% change in trend
      },
      trainingData: [],
      isTrained: true,
    };

    this.anomalyModels.set(statisticalModel.id, statisticalModel);
    this.anomalyModels.set(mlModel.id, mlModel);
    this.anomalyModels.set(ruleModel.id, ruleModel);
  }

  private initializeDefaultPatterns(): void {
    const patterns: AnomalyPattern[] = [
      {
        id: 'response-time-spike',
        name: 'Response Time Spike',
        description: 'Sudden increase in response time',
        pattern: 'response_time > 5000ms',
        severity: 'high',
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'error-rate-surge',
        name: 'Error Rate Surge',
        description: 'Sudden increase in error rate',
        pattern: 'error_rate > 10%',
        severity: 'critical',
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'throughput-drop',
        name: 'Throughput Drop',
        description: 'Significant drop in throughput',
        pattern: 'throughput < 50% of average',
        severity: 'medium',
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'memory-leak',
        name: 'Memory Leak Pattern',
        description: 'Gradual increase in memory usage',
        pattern: 'memory_usage increasing over 1 hour',
        severity: 'medium',
        isActive: true,
        createdAt: new Date(),
      },
    ];

    patterns.forEach(pattern => {
      this.anomalyPatterns.set(pattern.id, pattern);
    });
  }

  private startAnomalyDetection(): void {
    // Run anomaly detection every 30 seconds
    setInterval(() => {
      this.runAnomalyDetection();
    }, 30 * 1000);
  }

  // Add data point for anomaly detection
  async addDataPoint(orgId: string, rpcId: string, metricName: string, value: number, metadata?: Record<string, any>): Promise<void> {
    const key = `${orgId}:${rpcId}:${metricName}`;
    const dataPoint: AnomalyDataPoint = {
      timestamp: new Date(),
      value,
      metadata,
    };

    const existing = this.historicalData.get(key) || [];
    existing.push(dataPoint);

    // Keep only last 1000 data points
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.historicalData.set(key, existing);
  }

  // Run anomaly detection on all data
  private async runAnomalyDetection(): Promise<void> {
    for (const [key, dataPoints] of this.historicalData.entries()) {
      if (dataPoints.length < 20) continue; // Need minimum data points

      const [orgId, rpcId, metricName] = key.split(':');

      // Run different detection methods
      const statisticalResult = await this.detectStatisticalAnomaly(dataPoints);
      const ruleResult = await this.detectRuleBasedAnomaly(dataPoints, metricName);
      const mlResult = await this.detectMLAnomaly(dataPoints);

      // Combine results
      const combinedResult = this.combineDetectionResults([statisticalResult, ruleResult, mlResult]);

      if (combinedResult.isAnomaly) {
        await this.createAnomalyAlert(orgId, rpcId, metricName, combinedResult);
      }
    }
  }

  // Statistical anomaly detection using Z-score
  private async detectStatisticalAnomaly(dataPoints: AnomalyDataPoint[]): Promise<AnomalyDetectionResult> {
    const model = this.anomalyModels.get('statistical-zscore')!;
    const { threshold, windowSize } = model.parameters;

    if (dataPoints.length < windowSize) {
      return this.createNoAnomalyResult(dataPoints[dataPoints.length - 1]);
    }

    const recentData = dataPoints.slice(-windowSize);
    const values = recentData.map(d => d.value);
    const currentValue = values[values.length - 1];

    // Calculate mean and standard deviation
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return this.createNoAnomalyResult(dataPoints[dataPoints.length - 1]);
    }

    // Calculate Z-score
    const zScore = Math.abs((currentValue - mean) / stdDev);
    const isAnomaly = zScore > threshold;
    const anomalyScore = Math.min(zScore / threshold, 1);

    if (!isAnomaly) {
      return this.createNoAnomalyResult(dataPoints[dataPoints.length - 1]);
    }

    return {
      isAnomaly: true,
      anomalyScore,
      confidence: Math.min(anomalyScore, 0.95),
      anomalyType: currentValue > mean ? 'spike' : 'drop',
      severity: this.determineSeverity(anomalyScore),
      description: `Statistical anomaly detected: Z-score ${zScore.toFixed(2)} (threshold: ${threshold})`,
      expectedValue: mean,
      actualValue: currentValue,
      deviation: Math.abs(currentValue - mean),
      timestamp: dataPoints[dataPoints.length - 1].timestamp,
      metadata: { zScore, mean, stdDev },
    };
  }

  // Rule-based anomaly detection
  private async detectRuleBasedAnomaly(dataPoints: AnomalyDataPoint[], metricName: string): Promise<AnomalyDetectionResult> {
    const model = this.anomalyModels.get('rule-based-thresholds')!;
    const { spikeThreshold, dropThreshold } = model.parameters;

    if (dataPoints.length < 10) {
      return this.createNoAnomalyResult(dataPoints[dataPoints.length - 1]);
    }

    const recentData = dataPoints.slice(-10);
    const values = recentData.map(d => d.value);
    const currentValue = values[values.length - 1];
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Check for spike
    if (currentValue > averageValue * spikeThreshold) {
      return {
        isAnomaly: true,
        anomalyScore: Math.min((currentValue / averageValue) / spikeThreshold, 1),
        confidence: 0.8,
        anomalyType: 'spike',
        severity: 'high',
        description: `Spike detected: ${currentValue.toFixed(2)} vs average ${averageValue.toFixed(2)}`,
        expectedValue: averageValue,
        actualValue: currentValue,
        deviation: currentValue - averageValue,
        timestamp: dataPoints[dataPoints.length - 1].timestamp,
        metadata: { spikeThreshold, averageValue },
      };
    }

    // Check for drop
    if (currentValue < averageValue * dropThreshold) {
      return {
        isAnomaly: true,
        anomalyScore: Math.min((averageValue / currentValue) / (1 / dropThreshold), 1),
        confidence: 0.8,
        anomalyType: 'drop',
        severity: 'medium',
        description: `Drop detected: ${currentValue.toFixed(2)} vs average ${averageValue.toFixed(2)}`,
        expectedValue: averageValue,
        actualValue: currentValue,
        deviation: averageValue - currentValue,
        timestamp: dataPoints[dataPoints.length - 1].timestamp,
        metadata: { dropThreshold, averageValue },
      };
    }

    return this.createNoAnomalyResult(dataPoints[dataPoints.length - 1]);
  }

  // Machine learning anomaly detection (simplified)
  private async detectMLAnomaly(dataPoints: AnomalyDataPoint[]): Promise<AnomalyDetectionResult> {
    const model = this.anomalyModels.get('ml-isolation-forest')!;
    const { contamination } = model.parameters;

    if (dataPoints.length < 50) {
      return this.createNoAnomalyResult(dataPoints[dataPoints.length - 1]);
    }

    // Simplified isolation forest implementation
    const values = dataPoints.map(d => d.value);
    const currentValue = values[values.length - 1];

    // Calculate isolation score (simplified)
    const isolationScore = this.calculateIsolationScore(values, currentValue);
    const isAnomaly = isolationScore > contamination;

    if (!isAnomaly) {
      return this.createNoAnomalyResult(dataPoints[dataPoints.length - 1]);
    }

    return {
      isAnomaly: true,
      anomalyScore: isolationScore,
      confidence: Math.min(isolationScore, 0.9),
      anomalyType: 'outlier',
      severity: this.determineSeverity(isolationScore),
      description: `ML anomaly detected: isolation score ${isolationScore.toFixed(3)}`,
      actualValue: currentValue,
      deviation: 0, // ML doesn't provide expected value
      timestamp: dataPoints[dataPoints.length - 1].timestamp,
      metadata: { isolationScore, contamination },
    };
  }

  // Simplified isolation score calculation
  private calculateIsolationScore(values: number[], targetValue: number): number {
    // This is a simplified version - in practice, you'd use a proper isolation forest algorithm
    const sortedValues = [...values].sort((a, b) => a - b);
    const targetIndex = sortedValues.indexOf(targetValue);

    if (targetIndex === -1) return 0.5; // Not found, assume normal

    const leftDistance = targetIndex;
    const rightDistance = sortedValues.length - targetIndex - 1;
    const minDistance = Math.min(leftDistance, rightDistance);

    // Normalize to 0-1 range
    return Math.min(minDistance / (sortedValues.length / 2), 1);
  }

  // Combine multiple detection results
  private combineDetectionResults(results: AnomalyDetectionResult[]): AnomalyDetectionResult {
    const validResults = results.filter(r => r.isAnomaly);

    if (validResults.length === 0) {
      return results[0] || this.createNoAnomalyResult({ timestamp: new Date(), value: 0 });
    }

    // Weighted combination
    const weights = [0.4, 0.3, 0.3]; // Statistical, Rule-based, ML
    let combinedScore = 0;
    let combinedConfidence = 0;
    let totalWeight = 0;

    validResults.forEach((result, index) => {
      const weight = weights[index] || 0.33;
      combinedScore += result.anomalyScore * weight;
      combinedConfidence += result.confidence * weight;
      totalWeight += weight;
    });

    combinedScore /= totalWeight;
    combinedConfidence /= totalWeight;

    // Use the result with highest score as base
    const bestResult = validResults.reduce((best, current) =>
      current.anomalyScore > best.anomalyScore ? current : best,
    );

    return {
      ...bestResult,
      anomalyScore: combinedScore,
      confidence: combinedConfidence,
      description: `Combined anomaly detection: ${bestResult.description}`,
    };
  }

  // Create anomaly alert
  private async createAnomalyAlert(orgId: string, rpcId: string, metricName: string, anomaly: AnomalyDetectionResult): Promise<void> {
    const alert: AnomalyAlert = {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orgId,
      rpcId,
      metricName,
      anomaly,
      isAcknowledged: false,
      createdAt: new Date(),
    };

    const key = `${orgId}:${rpcId}`;
    const existing = this.anomalyAlerts.get(key) || [];
    existing.push(alert);
    this.anomalyAlerts.set(key, existing);

    anomalyLogger.warn('Anomaly alert created', {
      alertId: alert.id,
      orgId,
      rpcId,
      metricName,
      anomalyType: anomaly.anomalyType,
      severity: anomaly.severity,
      score: anomaly.anomalyScore,
    });
  }

  // Create no anomaly result
  private createNoAnomalyResult(dataPoint: AnomalyDataPoint): AnomalyDetectionResult {
    return {
      isAnomaly: false,
      anomalyScore: 0,
      confidence: 0,
      anomalyType: 'outlier',
      severity: 'low',
      description: 'No anomaly detected',
      actualValue: dataPoint.value,
      deviation: 0,
      timestamp: dataPoint.timestamp,
    };
  }

  // Determine severity based on anomaly score
  private determineSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  // Get anomaly alerts for organization
  async getAnomalyAlerts(orgId: string, rpcId?: string, limit: number = 100): Promise<AnomalyAlert[]> {
    const key = rpcId ? `${orgId}:${rpcId}` : orgId;
    const alerts = this.anomalyAlerts.get(key) || [];

    return alerts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Acknowledge anomaly alert
  async acknowledgeAnomalyAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    for (const [key, alerts] of this.anomalyAlerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.isAcknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        anomalyLogger.info('Anomaly alert acknowledged', { alertId, acknowledgedBy });
        return true;
      }
    }
    return false;
  }

  // Train anomaly model
  async trainModel(modelId: string, trainingData: AnomalyDataPoint[]): Promise<boolean> {
    const model = this.anomalyModels.get(modelId);
    if (!model) return false;

    model.trainingData = trainingData;
    model.isTrained = true;
    model.lastTrained = new Date();
    model.accuracy = Math.random() * 0.2 + 0.8; // Simulate 80-100% accuracy

    anomalyLogger.info('Anomaly model trained', { modelId, dataPoints: trainingData.length });
    return true;
  }

  // Get anomaly patterns
  getAnomalyPatterns(): AnomalyPattern[] {
    return Array.from(this.anomalyPatterns.values());
  }

  // Add custom anomaly pattern
  async addAnomalyPattern(pattern: Omit<AnomalyPattern, 'id' | 'createdAt'>): Promise<string> {
    const newPattern: AnomalyPattern = {
      ...pattern,
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.anomalyPatterns.set(newPattern.id, newPattern);
    anomalyLogger.info('Anomaly pattern added', { patternId: newPattern.id, name: newPattern.name });
    return newPattern.id;
  }

  // Get anomaly detection statistics
  getAnomalyStats(orgId: string, days: number = 7): {
    totalAlerts: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    acknowledged: number;
    unacknowledged: number;
    averageScore: number;
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const allAlerts: AnomalyAlert[] = [];

    for (const [key, alerts] of this.anomalyAlerts.entries()) {
      if (key.startsWith(`${orgId}:`)) {
        const filtered = alerts.filter(a => a.createdAt >= cutoffDate);
        allAlerts.push(...filtered);
      }
    }

    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalScore = 0;

    allAlerts.forEach(alert => {
      bySeverity[alert.anomaly.severity] = (bySeverity[alert.anomaly.severity] || 0) + 1;
      byType[alert.anomaly.anomalyType] = (byType[alert.anomaly.anomalyType] || 0) + 1;
      totalScore += alert.anomaly.anomalyScore;
    });

    return {
      totalAlerts: allAlerts.length,
      bySeverity,
      byType,
      acknowledged: allAlerts.filter(a => a.isAcknowledged).length,
      unacknowledged: allAlerts.filter(a => !a.isAcknowledged).length,
      averageScore: allAlerts.length > 0 ? totalScore / allAlerts.length : 0,
    };
  }

  // Get service statistics
  getServiceStats(): {
    totalModels: number;
    trainedModels: number;
    totalPatterns: number;
    activePatterns: number;
    totalAlerts: number;
    totalDataPoints: number;
    } {
    let totalAlerts = 0;
    for (const alerts of this.anomalyAlerts.values()) {
      totalAlerts += alerts.length;
    }

    let totalDataPoints = 0;
    for (const dataPoints of this.historicalData.values()) {
      totalDataPoints += dataPoints.length;
    }

    return {
      totalModels: this.anomalyModels.size,
      trainedModels: Array.from(this.anomalyModels.values()).filter(m => m.isTrained).length,
      totalPatterns: this.anomalyPatterns.size,
      activePatterns: Array.from(this.anomalyPatterns.values()).filter(p => p.isActive).length,
      totalAlerts,
      totalDataPoints,
    };
  }

  // Cleanup old data
  cleanup(): void {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    let cleaned = 0;

    for (const [key, dataPoints] of this.historicalData.entries()) {
      const filtered = dataPoints.filter(d => d.timestamp > cutoffDate);
      if (filtered.length !== dataPoints.length) {
        this.historicalData.set(key, filtered);
        cleaned += dataPoints.length - filtered.length;
      }
    }

    for (const [key, alerts] of this.anomalyAlerts.entries()) {
      const filtered = alerts.filter(a => a.createdAt > cutoffDate);
      if (filtered.length !== alerts.length) {
        this.anomalyAlerts.set(key, filtered);
        cleaned += alerts.length - filtered.length;
      }
    }

    if (cleaned > 0) {
      anomalyLogger.info('Anomaly detection cleanup completed', { cleaned });
    }
  }
}
