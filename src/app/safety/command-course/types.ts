export interface SOPAction {
  action: string;
  content: string;
  threshold: string;
}

export interface DepartmentSOP {
  name: string;
  fullName: string;
  description?: string;
  isNew?: boolean;
  sopTable: SOPAction[];
  sourceNote?: string;
}

export interface ResponseLevel {
  level: 'IV' | 'III' | 'II' | 'I';
  color: string;
  label: string;
  conditionLogic: string;
  conditions: string[];
  departments: DepartmentSOP[];
}

export interface CommandManualData {
  disasterName: string;
  disasterIcon: string;
  responseLevels: ResponseLevel[];
  references: { title: string; url: string }[];
}
