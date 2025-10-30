import { Request, Response } from 'express';
// NextFunction removed - not used in this controller
import { BaseController } from './base.controller';
import { AlertService } from '../services/alertService';
// Exception imports removed - not currently used in this controller

export class AlertController extends BaseController {
  private alertService: AlertService;

  constructor(alertService: AlertService) {
    super();
    this.alertService = alertService;
  }

  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { resolved, severity, limit, offset } = req.query;

      const alerts = await this.alertService.getUserAlerts(
        userId,
        resolved === 'true',
      );

      this.sendSuccess(res, alerts, 'Alerts retrieved successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async getAlert(req: Request, res: Response): Promise<void> {
    try {
      const alertId = req.params.alertId;
      const alert = await this.alertService.getAlert(alertId);
      this.sendSuccess(res, alert, 'Alert retrieved successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const alertId = req.params.alertId;
      const userId = this.getUserId(req);
      const { resolution } = req.body;

      const resolvedAlert = await this.alertService.resolveAlert(alertId, userId);
      this.sendSuccess(res, resolvedAlert, 'Alert resolved successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async deleteAlert(req: Request, res: Response): Promise<void> {
    try {
      const alertId = req.params.alertId;
      await this.alertService.deleteAlert(alertId);
      this.sendNoContent(res);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  // Alert rule methods removed - not implemented in AlertService

  // TODO: Implement alert rule management in AlertService or create separate AlertRuleService
}
