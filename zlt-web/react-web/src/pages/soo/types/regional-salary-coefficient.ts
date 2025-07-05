export interface RegionalSalaryCoefficient {
  id?: number;
  region: string;
  regionCode: string;
  salaryCoefficient: number;
  costOfLivingIndex?: number;
  effectiveDate: string;
  expireDate?: string;
  status: number;
  sortOrder?: number;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface RegionalSalaryCoefficientQuery {
  region?: string;
  regionCode?: string;
  status?: number;
  effectiveDateStart?: string;
  effectiveDateEnd?: string;
  includeExpired?: boolean;
  pageNum?: number;
  pageSize?: number;
}

export interface CopyToNewRegionRequest {
  sourceId: number;
  targetRegion: string;
  targetRegionCode: string;
  effectiveDate: string;
} 