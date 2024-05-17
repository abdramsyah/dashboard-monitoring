import { ChipSelectorOption } from "@/components/ChipSelector";

export enum GradeRequestModelEnum {
  CLIENT_ID = "client_id",
  GRADES = "grades",
  CREATED = "created",
  DUPLICATE = "duplicate",
}

export enum GradeModelEnum {
  GRADE = "grade",
  PRICE = "price",
  QUOTA = "quota",
  UB = "ub",
  INDEX = "index",
}

type CreateGradeModel = {
  [GradeModelEnum.GRADE]: string;
  [GradeModelEnum.PRICE]: number;
  [GradeModelEnum.QUOTA]: number;
  [GradeModelEnum.UB]: ChipSelectorOption;
};

interface GradeModelWithIndex extends CreateGradeModel {
  [GradeModelEnum.INDEX]?: number;
}

export type GradeManagementModelRequstProps = {
  [GradeRequestModelEnum.CLIENT_ID]?: number;
  [GradeRequestModelEnum.GRADES]: CreateGradeModel[];
};

export type CreateGradeResponseData = {
  [GradeRequestModelEnum.CLIENT_ID]?: number;
  [GradeRequestModelEnum.GRADES]: GradeModelWithIndex[];
  [GradeRequestModelEnum.DUPLICATE]?: GradeModelWithIndex[];
  [GradeRequestModelEnum.CREATED]?: GradeModelWithIndex[];
};

export type GradeManagementModel = {
  client_id: number;
  client_code: string;
  client_name: string;
  grouped_grade: GradeGroupModel[];
};

export type GradeGroupModel = {
  key: string;
  group: string;
  grades: GroupedGradeModel[];
};

export type GroupedGradeModel = {
  id: number;
  grade: string;
  price: number;
  quota: number;
  ub: number;
  created_at: string;
  updated_at: string;
};

export type GradeModel = {
  model_id: string;
  id: number;
  grade: string;
  price: number;
  quota: number;
  client_id: number;
  client_sales_code_initial: string;
  client_code: string;
  client_name: string;
  ub: number;
  created_at: string;
  updated_at: string;
};

export type GradeSetEditProps =
  | {
      isBatch?: true;
      row?: GradeGroupModel;
    }
  | {
      isBatch?: false;
      row?: GroupedGradeModel;
    };
